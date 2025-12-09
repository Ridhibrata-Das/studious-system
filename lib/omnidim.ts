// Omnidim AI Calling Agent Service
// Reads configuration from environment variables and exposes a simple trigger function.

export interface OmnidimCallResponse {
  success: boolean;
  message?: string;
  requestId?: string;
}

const OMNIDIM_BASE_URL = process.env.NEXT_PUBLIC_OMNIDIM_BASE_URL || "https://api.omnidim.io";
const OMNIDIM_API_KEY = process.env.NEXT_PUBLIC_OMNIDIM_API_KEY || "";
const OMNIDIM_AGENT_ID = process.env.NEXT_PUBLIC_OMNIDIM_AGENT_ID || "";

// Triggers an AI call for the configured agent. Adjust endpoint/shape per Omnidim docs.
export async function triggerOmnidimAICall(payload?: Record<string, unknown>): Promise<OmnidimCallResponse> {
  if (!OMNIDIM_API_KEY || !OMNIDIM_AGENT_ID) {
    return { success: false, message: "Missing Omnidim config (API key or Agent ID)." };
  }

  try {
    // Example endpoint; replace path if Omnidim specifies a different one.
    const url = `${OMNIDIM_BASE_URL.replace(/\/$/, "")}/v1/agents/${encodeURIComponent(OMNIDIM_AGENT_ID)}/calls`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OMNIDIM_API_KEY}`,
      },
      body: JSON.stringify({
        // Include any contextual payload you want the agent to receive
        // e.g., latest sensor snapshot, location, crop, etc.
        ...payload,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, message: `Omnidim error ${res.status}: ${text || res.statusText}` };
    }

    const data = await res.json().catch(() => ({}));
    return { success: true, requestId: (data as any)?.id, message: "Call triggered" };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to trigger Omnidim call" };
  }
}


