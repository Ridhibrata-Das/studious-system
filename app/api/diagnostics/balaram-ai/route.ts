import { NextResponse } from 'next/server';

type CheckResult = {
  name: string;
  ok: boolean;
  status?: number;
  error?: string;
  hint?: string;
  headers?: Record<string, string>;
};

const GOOGLE_HOST_V1BETA = 'https://generativelanguage.googleapis.com/v1beta';

function redact(s?: string | null): string | undefined {
  if (!s) return undefined;
  if (s.length <= 8) return '***';
  return s.slice(0, 4) + '***' + s.slice(-4);
}

export async function GET() {
  const apiKey =
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    '';
  // Allow overriding target model via env; default to the user's requested model
  const targetModel =
    process.env.NEXT_PUBLIC_GEMINI_MODEL ||
    process.env.GEMINI_MODEL ||
    'models/gemini-2.0-flash-exp';

  const projectId =
    process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    undefined;

  const results: CheckResult[] = [];

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Missing API key for Balaram AI (Gemini).',
        lookedFor: ['NEXT_PUBLIC_GEMINI_API_KEY', 'GEMINI_API_KEY', 'GOOGLE_API_KEY'],
      },
      { status: 200 }
    );
  }

  // 1) List models to validate key/auth and API enablement
  try {
    const url = `${GOOGLE_HOST_V1BETA}/models?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(projectId ? { 'x-goog-user-project': projectId } : {}),
      },
      cache: 'no-store',
    });
    const text = await res.text();
    let modelsList: string[] | undefined;
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed?.models)) {
        modelsList = parsed.models
          .map((m: any) => m?.name)
          .filter((n: any) => typeof n === 'string')
          .slice(0, 50);
      }
    } catch {}
    results.push({
      name: 'List Models',
      ok: res.ok,
      status: res.status,
      error: res.ok ? undefined : text.slice(0, 500),
      hint:
        !res.ok && res.status === 403
          ? 'API not enabled or billing/project permissions issue.'
          : !res.ok && res.status === 401
          ? 'Invalid API key.'
          : !res.ok && res.status === 429
          ? 'Rate limit or quota exceeded.'
          : undefined,
      headers: {
        'x-ratelimit-limit': res.headers.get('x-ratelimit-limit') || '',
        'x-ratelimit-remaining': res.headers.get('x-ratelimit-remaining') || '',
        'x-ratelimit-reset': res.headers.get('x-ratelimit-reset') || '',
      },
      ...(modelsList ? { models: modelsList } : {}),
    });
  } catch (e: any) {
    results.push({
      name: 'List Models',
      ok: false,
      error: String(e?.message || e),
      hint: 'Network error. Check firewall/VPN/corporate proxy.',
    });
  }

  // 2) Minimal text generate to check content endpoint and quota (for the requested/target model)
  try {
    const url = `${GOOGLE_HOST_V1BETA}/${targetModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
      generationConfig: { maxOutputTokens: 4 },
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(projectId ? { 'x-goog-user-project': projectId } : {}),
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    const text = await res.text();
    results.push({
      name: 'Generate Content (text)',
      ok: res.ok,
      status: res.status,
      error: res.ok ? undefined : text.slice(0, 500),
      hint:
        !res.ok && res.status === 404
          ? 'Model not found or not supported for generateContent in this region/project. If using experimental models, use the appropriate API (e.g., realtime v1alpha for WebSocket).'
          : !res.ok && res.status === 403
          ? 'Permission/billing issue or policy block.'
          : !res.ok && res.status === 429
          ? 'Rate limit or quota exceeded.'
          : undefined,
      headers: {
        'x-ratelimit-limit': res.headers.get('x-ratelimit-limit') || '',
        'x-ratelimit-remaining': res.headers.get('x-ratelimit-remaining') || '',
        'x-ratelimit-reset': res.headers.get('x-ratelimit-reset') || '',
      },
    });
  } catch (e: any) {
    results.push({
      name: 'Generate Content (text)',
      ok: false,
      error: String(e?.message || e),
      hint: 'Network error. Check firewall/VPN/corporate proxy.',
    });
  }

  // 3) Provide likely diagnosis
  const any429 = results.some((r) => r.status === 429);
  const any401 = results.some((r) => r.status === 401);
  const any403 = results.some((r) => r.status === 403);
  const any404 = results.some((r) => r.status === 404);

  let diagnosis = 'Unknown';
  if (any429) diagnosis = 'Rate limit or quota exceeded.';
  else if (any401) diagnosis = 'Invalid API key.';
  else if (any403) diagnosis = 'API not enabled, billing/project permission issue, or safety policy block.';
  else if (any404) diagnosis = 'Model or endpoint not available for this project/region.';

  return NextResponse.json(
    {
      ok: results.every((r) => r.ok),
      diagnosis,
      apiKeyRedacted: redact(apiKey),
      projectId: projectId || null,
      checks: results,
    },
    { status: 200 }
  );
}


