import type { Listing } from "../hooks/useListings";
import { formatListingsForAI } from "./stats";

export type AdvisorMsg = { role: "user" | "assistant"; content: string };

export type AdvisorRequest = {
  messages: AdvisorMsg[];
  listings: Listing[];
};

export type AdvisorResponse = { reply: string } | { error: string };

function buildSystemPrompt(listings: Listing[]): string {
  const now = new Date();
  const date = now.toLocaleDateString("en-IE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return `You are a smart resale selling advisor. You reason over the seller's actual listing data to give specific, actionable advice. You are concise, warm, and direct — like a knowledgeable friend who sells second-hand fashion online.

Here is the seller's current listing data:
${formatListingsForAI(listings ?? [])}

Today is ${date}. Current time is ${time}.

Rules:
- Always reason from the actual data above, not generic advice
- If there's not enough data, say so and explain what would help
- Keep answers to 2–4 sentences max unless a list genuinely helps
- Never be generic — reference specific items, prices, or patterns
- You understand second-hand marketplace algorithms: freshness windows, throttling, engagement signals
- Prices are in euros. Seller is based in Ireland.
- ALWAYS explicitly reference each listing's Category (e.g. "Dress", "Shoes") and Condition (e.g. "New with tags", "Good") when giving recommendations or next-step guidance. Tie advice to those values — e.g. pricing norms for that category, how condition affects buyer expectations, whether to relist, rephotograph, or adjust price for that specific category/condition combo.
- When suggesting next steps, name the item, its category, and its condition so the advice is unambiguous.
- After your recommendation, ALWAYS append a short section titled exactly "Why this advice" (on its own line) that quotes the Category and Condition values you used, in this format:
  Why this advice
  Based on Category: "<category>" and Condition: "<condition>" for "<item name>".
  If multiple items are referenced, list one line per item. Keep this section to 1–3 short lines.`;
}

export async function runAdvisor(
  { messages, listings }: AdvisorRequest,
  apiKey: string | undefined,
): Promise<{ status: number; body: AdvisorResponse }> {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { status: 400, body: { error: "messages required" } };
  }

  if (!apiKey) {
    return {
      status: 500,
      body: {
        error: "VITE_ANTHROPIC_API_KEY is not configured. Add it to your .env file.",
      },
    };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: buildSystemPrompt(listings ?? []),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) {
        return { status: 429, body: { error: "Rate limit reached. Try again in a moment." } };
      }
      try {
        const parsed = JSON.parse(text) as { error?: { message?: string } };
        const msg = parsed.error?.message ?? text;
        return { status: res.status, body: { error: `Anthropic API error: ${msg}` } };
      } catch {
        return { status: res.status, body: { error: `Anthropic API error (${res.status}): ${text}` } };
      }
    }

    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const reply = data.content?.find((block) => block.type === "text")?.text ?? "";
    if (!reply.trim()) {
      return { status: 500, body: { error: "Advisor returned an empty response from Anthropic." } };
    }

    return { status: 200, body: { reply } };
  } catch (e) {
    return {
      status: 500,
      body: { error: e instanceof Error ? e.message : String(e) },
    };
  }
}
