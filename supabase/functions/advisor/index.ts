import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type Msg = { role: "user" | "assistant"; content: string };
type Listing = {
  date: string;
  time: string;
  item: string;
  price: number;
  type: string;
  category?: string;
  condition?: string;
  views: string | null;
  favourites: string | null;
  messages: string | null;
  sold: boolean;
};

function formatListings(listings: Listing[]) {
  if (!listings?.length) return "(no listings yet)";
  return listings
    .map(
      (l) =>
        `${l.date} | ${l.time} | "${l.item}" | €${l.price} | ${l.type} | ${l.category ?? "-"} | ${l.condition ?? "-"} | Views: ${l.views ?? "-"} | Favs: ${l.favourites ?? "-"} | Msgs: ${l.messages ?? "-"} | Sold: ${l.sold ? "Yes" : "No"}`,
    )
    .join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { messages, listings } = (await req.json()) as {
      messages: Msg[];
      listings: Listing[];
    };
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const date = now.toLocaleDateString("en-IE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const systemPrompt = `You are a smart resale selling advisor. You reason over the seller's actual listing data to give specific, actionable advice. You are concise, warm, and direct — like a knowledgeable friend who sells second-hand fashion online.

Here is the seller's current listing data:
${formatListings(listings ?? [])}

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

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (res.status === 402)
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      return new Response(JSON.stringify({ error: `Gateway error: ${text}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});