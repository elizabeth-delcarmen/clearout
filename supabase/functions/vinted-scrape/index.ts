import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CONDITION_CANONICAL = [
  "New without tags",
  "New with tags",
  "Very good",
  "Satisfactory",
  "Good",
] as const;

function parseConditionFromHtml(html: string): string | null {
  for (const label of CONDITION_CANONICAL) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(`"value":"${escaped}"\\s*,\\s*"style":"body"`, "i"),
      new RegExp(`\\\\"value\\\\":\\\\"${escaped}\\\\"\\s*,\\s*\\\\"style\\\\":\\\\"body\\\\"`, "i"),
    ];
    if (patterns.some((re) => re.test(html))) return label;
  }
  return null;
}

// Keep in sync with src/lib/vintedScraper.ts
function normalizePrice(raw: string): string {
  return raw.replace(",", ".");
}

function parsePriceFromHtml(html: string, itemId?: string): string | null {
  const domMatch = html.match(
    /data-testid="item-price"[^>]*>([\s\S]{0,200}?)([\d]+(?:[.,][\d]+)?)/,
  );
  if (domMatch) return normalizePrice(domMatch[2]);

  const priceAmountMatch = html.match(/"price_amount"\s*:\s*([\d]+(?:[.,][\d]+)?)/);
  if (priceAmountMatch) return normalizePrice(priceAmountMatch[1]);

  const jsonLdMatch = html.match(
    /"@type"\s*:\s*"Offer"[\s\S]{0,500}?"price"\s*:\s*"?([\d]+(?:[.,][\d]+)?)"?/,
  );
  if (jsonLdMatch) return normalizePrice(jsonLdMatch[1]);

  if (itemId) {
    const itemBlockMatch = html.match(
      new RegExp(`"id"\\s*:\\s*${itemId}[\\s\\S]{0,300}?"price"\\s*:\\s*"?([\\d]+(?:[.,][\\d]+)?)"?`),
    );
    if (itemBlockMatch) return normalizePrice(itemBlockMatch[1]);
  }

  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
  if (titleMatch) {
    const titleIdx = html.indexOf(titleMatch[0]);
    const afterTitle = html.slice(titleIdx, Math.min(html.length, titleIdx + 2000));
    const scopedPrice = afterTitle.match(/"price"\s*:\s*"?([\d]+(?:[.,][\d]+)?)"?/);
    if (scopedPrice) return normalizePrice(scopedPrice[1]);
  }

  return null;
}

function parseImageFromHtml(html: string): string | null {
  const match = html.match(/<meta property="og:image" content="([^"]+)"/);
  return match ? match[1] : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const url = new URL(req.url).searchParams.get("url");
  if (!url) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const vintedPattern =
    /^https?:\/\/(www\.)?vinted\.(co\.uk|ie|fr|de|be|nl|es|it|pl|com)\/items\/\d+/i;
  if (!vintedPattern.test(url)) {
    return new Response(JSON.stringify({ error: "Not a valid Vinted URL" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch listing" }), {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const html = await resp.text();
    const itemId = url.match(/\/items\/(\d+)/)?.[1];

    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const price = parsePriceFromHtml(html, itemId);

    if (!titleMatch || !price) {
      return new Response(JSON.stringify({ error: "Could not parse listing" }), {
        status: 422,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const item = titleMatch[1].replace(/\s*\|\s*Vinted.*$/, "").trim();
    const condition = parseConditionFromHtml(html);
    const image_url = parseImageFromHtml(html);

    return new Response(JSON.stringify({ item, price, condition, image_url }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
