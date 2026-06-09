const PROXY = "https://api.allorigins.win/get?url=";

// Supabase Edge Function URL — used first, proxy as fallback
const EDGE_FN =
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vinted-scrape`;

export type ScrapeResult =
  | { ok: true; item: string; price: string; condition: string | null }
  | { ok: false; reason: string };

export function isVintedUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?vinted\.(co\.uk|ie|fr|de|be|nl|es|it|pl|com)\/items\/\d+/i.test(url);
}

/** Vinted embeds condition in RSC payload as "value":"…","style":"body" */
const CONDITION_CANONICAL = [
  "New without tags",
  "New with tags",
  "Very good",
  "Satisfactory",
  "Good",
] as const;

export function parseConditionFromHtml(html: string): string | null {
  for (const label of CONDITION_CANONICAL) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`"value":"${escaped}"\\s*,\\s*"style":"body"`, "i");
    if (re.test(html)) return label;
  }
  return null;
}

function parseListingFromHtml(html: string): { item: string; price: string; condition: string | null } | null {
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
  const priceJsonMatch = html.match(/"price"\s*:\s*"?([\d]+(?:[.,][\d]+)?)"?/);
  const priceElementMatch = html.match(/data-testid="item-price"[^>]*>[\s€]*([\d]+(?:[.,][\d]+)?)/);
  const priceMatch = priceJsonMatch ?? priceElementMatch;

  if (!titleMatch || !priceMatch) return null;

  return {
    item: titleMatch[1].replace(/\s*\|\s*Vinted.*$/, "").trim(),
    price: priceMatch[1].replace(",", "."),
    condition: parseConditionFromHtml(html),
  };
}

async function scrapeViaEdgeFunction(url: string): Promise<ScrapeResult> {
  const resp = await fetch(`${EDGE_FN}?url=${encodeURIComponent(url)}`);
  if (!resp.ok) return { ok: false, reason: `Edge function error ${resp.status}` };
  const data = await resp.json();
  if (data.error) return { ok: false, reason: data.error };
  return {
    ok: true,
    item: data.item,
    price: data.price,
    condition: data.condition ?? null,
  };
}

async function scrapeViaProxy(url: string): Promise<ScrapeResult> {
  const resp = await fetch(`${PROXY}${encodeURIComponent(url)}`);
  if (!resp.ok) return { ok: false, reason: "Proxy request failed" };
  const { contents } = await resp.json();
  if (!contents) return { ok: false, reason: "Empty response from proxy" };

  const parsed = parseListingFromHtml(contents);
  if (!parsed) return { ok: false, reason: "Could not parse listing" };

  return { ok: true, ...parsed };
}

export async function scrapeVintedListing(url: string): Promise<ScrapeResult> {
  // Try Edge Function first (server-side, reliable)
  try {
    const result = await scrapeViaEdgeFunction(url);
    if (result.ok) return result;
    console.warn("[vintedScraper] Edge function failed:", result.reason, "— trying proxy fallback");
  } catch (err) {
    console.warn("[vintedScraper] Edge function threw:", err, "— trying proxy fallback");
  }

  // Fallback to allorigins.win proxy
  try {
    return await scrapeViaProxy(url);
  } catch (err) {
    console.error("[vintedScraper] Proxy also failed:", err);
    return { ok: false, reason: "Network error" };
  }
}
