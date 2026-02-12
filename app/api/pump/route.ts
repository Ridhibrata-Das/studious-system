import { NextResponse } from 'next/server';

// Configuration with fallbacks from user request
const CONFIG = {
  channelId: process.env.THINKSPEAK_PUMP_CHANNEL_ID || '2647422',
  writeKey: process.env.THINKSPEAK_PUMP_KEY_WRITE || 'D3VG7N7T222SGT28',
  readKey: process.env.NEXT_PUBLIC_THINGSPEAK_READ_API_KEY || '1IND2YTTTRS3WCNY',
  pumpField: process.env.THINGSPEAK_PUMP_FIELD || '8'
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // Accept 'ON', 'OFF', 'on', 'off', 1, 0
    const action = body?.action || body?.state || body?.value;

    let desiredValue = 0;
    if (String(action).toUpperCase() === 'ON' || String(action) === '1') {
      desiredValue = 1;
    } else if (String(action).toUpperCase() === 'OFF' || String(action) === '0') {
      desiredValue = 0;
    } else {
      return NextResponse.json({ error: "Invalid state. Use 'ON', 'OFF', 1, or 0" }, { status: 400 });
    }

    // Write to ThingSpeak
    const tsUrl = 'https://api.thingspeak.com/update.json';
    const bodyParams = new URLSearchParams();
    bodyParams.append('api_key', CONFIG.writeKey);
    bodyParams.append(`field${CONFIG.pumpField}`, String(desiredValue));

    const response = await fetch(tsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString()
    });

    const text = await response.text();

    if (!response.ok) {
      console.error('ThingSpeak Write Error:', text);
      return NextResponse.json({ error: 'Failed to update ThingSpeak' }, { status: 502 });
    }

    if (text === '0') {
      // ThingSpeak returns '0' if update interval is too short (<15s for free accounts)
      return NextResponse.json({
        success: false,
        warning: 'Rate limited by ThingSpeak (wait 15s)',
        state: desiredValue === 1 ? 'on' : 'off'
      }, { status: 429 });
    }

    return NextResponse.json({
      success: true,
      state: desiredValue === 1 ? 'on' : 'off',
      entryId: text
    });

  } catch (error: any) {
    console.error('Pump API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Read from ThingSpeak
    const url = `https://api.thingspeak.com/channels/${CONFIG.channelId}/fields/${CONFIG.pumpField}/last.json?api_key=${CONFIG.readKey}`;

    const response = await fetch(url, { next: { revalidate: 0 } }); // No cache

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to read from ThingSpeak' }, { status: 502 });
    }

    const data = await response.json();
    const fieldValue = data[`field${CONFIG.pumpField}`];
    const isOn = fieldValue === '1';

    return NextResponse.json({
      success: true,
      state: isOn ? 'on' : 'off',
      value: isOn ? 1 : 0,
      lastUpdate: data.created_at
    });

  } catch (error: any) {
    console.error('Pump Read Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}


