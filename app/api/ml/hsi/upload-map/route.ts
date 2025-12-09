import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const model = form.get('model');
    const file = form.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const upstreamForm = new FormData();
    upstreamForm.set('model', String(model || 'ssun'));
    upstreamForm.set('file', file, (file as File).name || 'cube.mat');
    // pass through optional params if present
    ['time_step','w','num_pc','s1s2'].forEach((k) => {
      const v = form.get(k);
      if (v !== null) upstreamForm.set(k, String(v));
    });

    const url = `${process.env.ML_SERVICE_URL || 'http://localhost:8001'}/hsi/upload-map`;
    const upstream = await fetch(url, { method: 'POST', body: upstreamForm as any });
    const text = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json({ error: `ML service error ${upstream.status}: ${text}` }, { status: 502 });
    }
    try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json({ raw: text }); }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}


