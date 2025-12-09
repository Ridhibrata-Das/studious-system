import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = `${process.env.ML_SERVICE_URL || 'http://localhost:8001'}/hsi/lstm-map`;
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json({ error: `ML service error ${upstream.status}: ${text}` }, { status: 502 });
    }
    try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json({ raw: text }); }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}


