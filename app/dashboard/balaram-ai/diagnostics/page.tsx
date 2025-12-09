'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Check = {
  name: string;
  ok: boolean;
  status?: number;
  error?: string;
  hint?: string;
  headers?: Record<string, string>;
};

type DiagResponse = {
  ok: boolean;
  diagnosis: string;
  apiKeyRedacted?: string;
  projectId?: string | null;
  checks: (Check & { models?: string[] })[];
};

export default function BalaramAIDiagnostics() {
  const [data, setData] = useState<DiagResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/diagnostics/balaram-ai', { cache: 'no-store' });
      const body = await res.json();
      setData(body);
    } catch (e: any) {
      setError(e?.message || 'Failed to run diagnostics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Balaram AI Connectivity Diagnostics</h1>
        <Button onClick={run} disabled={loading}>
          {loading ? 'Running…' : 'Re-run Checks'}
        </Button>
      </div>

      {error && (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                Target model: <span className="font-mono">{process.env.NEXT_PUBLIC_GEMINI_MODEL || 'models/gemini-2.0-flash-exp'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={data.ok ? 'default' : 'destructive'}>
                  {data.ok ? 'OK' : 'Issue Detected'}
                </Badge>
                <span className="text-sm text-muted-foreground">{data.diagnosis}</span>
              </div>
              <div className="text-sm">
                <div>API Key: <span className="font-mono">{data.apiKeyRedacted || 'N/A'}</span></div>
                <div>Project ID: <span className="font-mono">{data.projectId || 'N/A'}</span></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {data.checks?.map((c, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <Badge variant={c.ok ? 'default' : 'destructive'}>{c.ok ? 'OK' : c.status || 'ERR'}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {c.models && c.models.length > 0 && (
                    <div className="text-xs">
                      <div className="mb-1 font-medium">Available models (first 50):</div>
                      <div className="max-h-32 overflow-auto p-2 bg-muted rounded">
                        <ul className="list-disc pl-5">
                          {c.models.map((m) => (
                            <li key={m} className="font-mono">{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  {c.hint && <div className="text-sm text-amber-600">Hint: {c.hint}</div>}
                  {!c.ok && c.error && (
                    <pre className="text-xs p-2 bg-muted rounded overflow-auto max-h-40 whitespace-pre-wrap">
{c.error}
                    </pre>
                  )}
                  {c.headers && (
                    <div className="text-xs text-muted-foreground">
                      <div>x-ratelimit-limit: {c.headers['x-ratelimit-limit'] || '-'}</div>
                      <div>x-ratelimit-remaining: {c.headers['x-ratelimit-remaining'] || '-'}</div>
                      <div>x-ratelimit-reset: {c.headers['x-ratelimit-reset'] || '-'}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


