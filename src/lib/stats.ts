import type { Listing } from "@/hooks/useListings";

export type Stats = {
  bestHour: string | null;
  bestHourAvg: number;
  bestDay: string | null;
  bestDayAvg: number;
  sellRate: number;
  soldCount: number;
  totalWithData: number;
  newAvg: number;
  relistAvg: number;
  bestCategory: string | null;
  bestCategoryAvg: number;
  bestCondition: string | null;
  bestConditionAvg: number;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const num = (s?: string | null) => {
  const n = parseInt(s ?? "", 10);
  return Number.isFinite(n) ? n : null;
};

export function computeStats(listings: Listing[]): Stats {
  const withData = listings.filter((l) => num(l.views) !== null);

  // Best hour
  const hourBuckets = new Map<string, number[]>();
  withData.forEach((l) => {
    const hour = (l.time || "").split(":")[0]?.padStart(2, "0");
    if (!hour) return;
    const k = `${hour}:00`;
    const arr = hourBuckets.get(k) ?? [];
    arr.push(num(l.views)!);
    hourBuckets.set(k, arr);
  });
  let bestHour: string | null = null;
  let bestHourAvg = 0;
  hourBuckets.forEach((vals, k) => {
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (avg > bestHourAvg) {
      bestHourAvg = avg;
      bestHour = k;
    }
  });

  // Best day
  const dayBuckets = new Map<string, number[]>();
  withData.forEach((l) => {
    const d = new Date(l.date + "T00:00:00");
    if (Number.isNaN(d.getTime())) return;
    const k = DAYS[d.getDay()];
    const arr = dayBuckets.get(k) ?? [];
    arr.push(num(l.views)!);
    dayBuckets.set(k, arr);
  });
  let bestDay: string | null = null;
  let bestDayAvg = 0;
  dayBuckets.forEach((vals, k) => {
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (avg > bestDayAvg) {
      bestDayAvg = avg;
      bestDay = k;
    }
  });

  const soldCount = withData.filter((l) => l.sold).length;
  const sellRate = withData.length ? Math.round((soldCount / withData.length) * 100) : 0;

  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const newAvg = avg(
    withData.filter((l) => l.type === "New listing").map((l) => num(l.views)!),
  );
  const relistAvg = avg(
    withData.filter((l) => l.type === "Relist").map((l) => num(l.views)!),
  );

  const bucketBest = (key: "category" | "condition") => {
    const buckets = new Map<string, number[]>();
    withData.forEach((l) => {
      const k = (l[key] as string | undefined) || "";
      if (!k) return;
      const arr = buckets.get(k) ?? [];
      arr.push(num(l.views)!);
      buckets.set(k, arr);
    });
    let best: string | null = null;
    let bestAvg = 0;
    buckets.forEach((vals, k) => {
      const a = vals.reduce((x, y) => x + y, 0) / vals.length;
      if (a > bestAvg) {
        bestAvg = a;
        best = k;
      }
    });
    return { best, bestAvg: Math.round(bestAvg) };
  };
  const cat = bucketBest("category");
  const cond = bucketBest("condition");

  return {
    bestHour,
    bestHourAvg: Math.round(bestHourAvg),
    bestDay,
    bestDayAvg: Math.round(bestDayAvg),
    sellRate,
    soldCount,
    totalWithData: withData.length,
    newAvg,
    relistAvg,
    bestCategory: cat.best,
    bestCategoryAvg: cat.bestAvg,
    bestCondition: cond.best,
    bestConditionAvg: cond.bestAvg,
  };
}

export function formatListingsForAI(listings: Listing[]): string {
  if (!listings.length) return "(no listings yet)";
  return listings
    .map(
      (l) =>
        `${l.date} | ${l.time} | "${l.item}" | €${l.price} | ${l.type} | ${l.category ?? "-"} | ${l.condition ?? "-"} | Views: ${l.views ?? "-"} | Favs: ${l.favourites ?? "-"} | Msgs: ${l.messages ?? "-"} | Sold: ${l.sold ? "Yes" : "No"}`,
    )
    .join("\n");
}