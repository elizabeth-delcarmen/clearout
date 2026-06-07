import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const priceJsonMatch = html.match(/"price"\s*:\s*"?([\d]+(?:[.,][\d]+)?)"?/);
    const priceElementMatch = html.match(
      /data-testid="item-price"[^>]*>[\s€]*([\d]+(?:[.,][\d]+)?)/,
    );
    const priceMatch = priceJsonMatch ?? priceElementMatch;

    if (!titleMatch || !priceMatch) {
      return new Response(JSON.stringify({ error: "Could not parse listing" }), {
        status: 422,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const item = titleMatch[1].replace(/\s*\|\s*Vinted.*$/, "").trim();
    const price = priceMatch[1].replace(",", ".");

    return new Response(JSON.stringify({ item, price }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
