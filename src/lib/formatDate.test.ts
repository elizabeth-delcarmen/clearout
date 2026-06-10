import { describe, it, expect } from "vitest";
import { formatListingDate, parseListingDate } from "./formatDate";

const now = new Date(2026, 5, 10); // Wed 10 Jun 2026

describe("parseListingDate", () => {
  it("parses valid ISO dates at local midnight", () => {
    const d = parseListingDate("2026-06-10");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(5);
    expect(d!.getDate()).toBe(10);
  });

  it("returns null for invalid strings", () => {
    expect(parseListingDate("not-a-date")).toBeNull();
    expect(parseListingDate("2026-13-01")).toBeNull();
  });
});

describe("formatListingDate", () => {
  it("shows weekday, day, and month without year for current year", () => {
    expect(formatListingDate("2026-06-10", now)).toBe("Wed 10 Jun");
  });

  it("includes year when date is from a different year", () => {
    expect(formatListingDate("2025-06-09", now)).toBe("Mon 9 Jun 2025");
  });

  it("returns the raw string when input is not parseable", () => {
    expect(formatListingDate("invalid", now)).toBe("invalid");
  });
});
