import BaselineInsights from "@/components/BaselineInsights";
import { useListings } from "@/hooks/useListings";
import { computeStats } from "@/lib/stats";

export function StatsTab() {
  const { listings } = useListings();
  const stats = computeStats(listings);

  if (stats.totalWithData < 2) {
    return (
      <>
        <div className="safe-x safe-b py-4">
          <div className="bg-card rounded-[14px] border border-border p-6 text-center">
            <div className="text-[28px]">📈</div>
            <div className="text-[13px] text-muted-foreground font-sans-ui mt-2">
              Log at least 2 items with 24hr data to see insights
            </div>
          </div>
        </div>
        <BaselineInsights />
      </>
    );
  }

  return (
    <>
      <div className="safe-x safe-b py-4 grid grid-cols-2 gap-2.5 min-w-0">
        <Card label="Best upload time" value={stats.bestHour ?? "—"} sub={`avg ${stats.bestHourAvg} views`} color="text-primary" />
        <Card label="Best day" value={stats.bestDay ?? "—"} sub={`avg ${stats.bestDayAvg} views`} color="text-primary" />
        <Card label="Sell rate" value={`${stats.sellRate}%`} sub={`${stats.soldCount} of ${stats.totalWithData} items`} color="text-success" />
        <Card label="New vs Relist" value={`N: ${stats.newAvg}`} sub={`R: ${stats.relistAvg} views`} color="text-warn" />
        <Card label="Best category" value={stats.bestCategory ?? "—"} sub={`avg ${stats.bestCategoryAvg} views`} color="text-primary" />
        <Card label="Best condition" value={stats.bestCondition ?? "—"} sub={`avg ${stats.bestConditionAvg} views`} color="text-primary" />
      </div>
      <BaselineInsights />
    </>
  );
}

function Card({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-card rounded-[14px] border border-border p-3.5">
      <div className="text-[10px] font-bold uppercase tracking-[1px] text-muted-foreground font-sans-ui">{label}</div>
      <div className={`text-[20px] font-extrabold mt-1 ${color}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground font-sans-ui mt-0.5">{sub}</div>
    </div>
  );
}