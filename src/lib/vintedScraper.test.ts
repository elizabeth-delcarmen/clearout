import { describe, it, expect } from "vitest";
import { parsePriceFromHtml, parseListingFromHtml } from "./vintedScraper";

const TITLE = '<meta property="og:title" content="Green Zara jacket | Vinted">';
const IMAGE = '<meta property="og:image" content="https://images.vinted.net/thumbs/abc123.jpg">';

describe("parsePriceFromHtml", () => {
  it("prefers price_amount over earlier generic shipping price", () => {
    const html = `
      ${TITLE}
      {"type":"shipping","price":"3.49"}
      {"id":12345678,"price_amount":25,"price_currency":"EUR"}
    `;
    expect(parsePriceFromHtml(html)).toBe("25");
  });

  it("extracts price from nested item-price DOM", () => {
    const html = `
      ${TITLE}
      <div data-testid="item-price"><p>€25.00</p></div>
      {"type":"shipping","price":"3.49"}
    `;
    expect(parsePriceFromHtml(html)).toBe("25.00");
  });

  it("normalizes comma decimal separators", () => {
    const html = `
      ${TITLE}
      <div data-testid="item-price"><p>25,50</p></div>
    `;
    expect(parsePriceFromHtml(html)).toBe("25.50");
  });

  it("prefers DOM over generic price far from title", () => {
    const html = `
      {"type":"shipping","price":"3.49"}
      ${TITLE}
      <div data-testid="item-price">18.00</div>
      {"type":"similar","price":"5.00"}
    `;
    expect(parsePriceFromHtml(html)).toBe("18.00");
  });

  it("uses JSON-LD Offer price when DOM is absent", () => {
    const html = `
      ${TITLE}
      {"@type":"Offer","price":"32.00","priceCurrency":"EUR"}
    `;
    expect(parsePriceFromHtml(html)).toBe("32.00");
  });

  it("scopes generic price near item id when DOM and price_amount are absent", () => {
    const html = `
      {"type":"shipping","price":"3.49"}
      ${TITLE}
      {"id":9876543210,"title":"Jacket","price":"19.99"}
      {"type":"similar","price":"5.00"}
    `;
    expect(parsePriceFromHtml(html, "9876543210")).toBe("19.99");
  });
});

describe("parseListingFromHtml", () => {
  it("returns item title and price together", () => {
    const html = `
      ${TITLE}
      ${IMAGE}
      <div data-testid="item-price">25.00</div>
    `;
    const result = parseListingFromHtml(html);
    expect(result).toEqual({
      item: "Green Zara jacket",
      price: "25.00",
      condition: null,
      image_url: "https://images.vinted.net/thumbs/abc123.jpg",
    });
  });

  it("returns null image_url when og:image is absent", () => {
    const html = `
      ${TITLE}
      <div data-testid="item-price">25.00</div>
    `;
    const result = parseListingFromHtml(html);
    expect(result?.image_url).toBeNull();
  });

  it("returns null when title or price is missing", () => {
    expect(parseListingFromHtml("<div>no title</div>")).toBeNull();
    expect(parseListingFromHtml(`${TITLE}<div>no price</div>`)).toBeNull();
  });
});
