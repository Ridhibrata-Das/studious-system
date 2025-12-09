import { NextResponse } from 'next/server';

// ThingSpeak pump control proxy
// Expects env:
// - NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID (or THINGSPEAK_CHANNEL_ID)
// - THINGSPEAK_WRITE_API_KEY
// - THINGSPEAK_PUMP_FIELD (optional, defaults to 7)
// - NEXT_PUBLIC_THINGSPEAK_READ_API_KEY (optional, but required if channel is private)
// - THINGSPEAK_PUMP_CHANNEL_ID (optional override for pump reads)

const getConfig = () => {
  const channelId = process.env.NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID || process.env.THINGSPEAK_CHANNEL_ID;
  const writeKey = process.env.THINGSPEAK_WRITE_API_KEY;
  const pumpField = process.env.THINGSPEAK_PUMP_FIELD ? Number(process.env.THINGSPEAK_PUMP_FIELD) : 7;
  const readKey = process.env.NEXT_PUBLIC_THINGSPEAK_READ_API_KEY || process.env.THINGSPEAK_READ_API_KEY;
  const pumpChannelId = process.env.THINGSPEAK_PUMP_CHANNEL_ID || channelId;

  if (!channelId || !writeKey) {
    throw new Error('Missing ThingSpeak channel or write API key. Set NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID and THINGSPEAK_WRITE_API_KEY.');
  }
  if (!pumpField || Number.isNaN(pumpField) || pumpField < 1 || pumpField > 8) {
    throw new Error('Invalid THINGSPEAK_PUMP_FIELD. It must be an integer between 1 and 8.');
  }

  return { channelId, writeKey, pumpField, readKey, pumpChannelId };
};

export async function POST(req: Request) {
  try {
    const { channelId, writeKey, pumpField } = getConfig();
    const body = await req.json().catch(() => ({}));

    // body: { state: 'on'|'off' } OR { value: 1|0 }
    let desiredValue: number | undefined = undefined;
    if (typeof body?.value === 'number') desiredValue = body.value ? 1 : 0;
    if (typeof body?.state === 'string') desiredValue = body.state?.toLowerCase() === 'on' ? 1 : 0;

    if (desiredValue === undefined) {
      return NextResponse.json({ error: "Provide 'state' as 'on'|'off' or 'value' as 1|0" }, { status: 400 });
    }

    const url = `https://api.thingspeak.com/update.json?api_key=${encodeURIComponent(writeKey)}&field${pumpField}=${desiredValue}`;
    const upstream = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const text = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json({ error: `ThingSpeak update failed ${upstream.status}: ${text}` }, { status: 502 });
    }

    let data: any = {};
    try { data = JSON.parse(text); } catch {}
    return NextResponse.json({ success: true, state: desiredValue === 1 ? 'on' : 'off', data });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { pumpChannelId, pumpField, readKey } = getConfig();
    const params = new URLSearchParams({ results: '1' });
    if (readKey) params.set('api_key', readKey);
    const url = `https://api.thingspeak.com/channels/${encodeURIComponent(pumpChannelId as string)}/feeds.json?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 5 } });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: `ThingSpeak read failed ${res.status}: ${t}` }, { status: 502 });
    }
    const json = await res.json();
    const feed = json?.feeds?.[0] || {};
    const fieldKey = `field${pumpField}` as const;
    const value = Number(feed[fieldKey] ?? 0);
    return NextResponse.json({ success: true, value: value ? 1 : 0, state: value ? 'on' : 'off', at: feed?.created_at });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}


