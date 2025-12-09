import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const to: string | undefined = body?.to || body?.phoneNumber;

    const OMNIDIM_BASE_URL = process.env.NEXT_PUBLIC_OMNIDIM_BASE_URL || 'https://backend.omnidim.io';
    const OMNIDIM_API_KEY = process.env.NEXT_PUBLIC_OMNIDIM_API_KEY || process.env.OMNIDIM_API_KEY || '';
    const OMNIDIM_AGENT_ID = process.env.NEXT_PUBLIC_OMNIDIM_AGENT_ID || process.env.OMNIDIM_AGENT_ID || '';
    const OMNIDIM_FROM_NUMBER_ID = process.env.NEXT_PUBLIC_OMNIDIM_FROM_NUMBER_ID || process.env.OMNIDIM_FROM_NUMBER_ID || '';

    if (!OMNIDIM_API_KEY || !OMNIDIM_AGENT_ID) {
      return NextResponse.json({ error: 'Missing Omnidim API configuration' }, { status: 500 });
    }
    if (!to) {
      return NextResponse.json({ error: 'Missing destination phone number' }, { status: 400 });
    }

    // According to docs: POST /api/v1/calls/dispatch with { agent_id, to_number, from_number_id?, call_context? }
    const url = `${OMNIDIM_BASE_URL.replace(/\/$/, '')}/api/v1/calls/dispatch`;

    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OMNIDIM_API_KEY}`,
      },
      body: JSON.stringify({
        agent_id: isNaN(Number(OMNIDIM_AGENT_ID)) ? OMNIDIM_AGENT_ID : Number(OMNIDIM_AGENT_ID),
        to_number: to,
        from_number_id: OMNIDIM_FROM_NUMBER_ID || undefined,
        call_context: body?.call_context || { source: 'dashboard', intent: 'test_call' },
      }),
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json({ error: `Omnidim error ${upstream.status}: ${text}` }, { status: 502 });
    }

    let data: any = {};
    try { data = JSON.parse(text); } catch {}
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[Omnidim Proxy] Error:', error);
    return NextResponse.json({ error: error?.message || 'Unexpected error', details: String(error?.stack || '') }, { status: 500 });
  }
}


