import { useState } from "react";
import { Header } from "@/components/vinted/Header";
import { Tabs, type TabKey } from "@/components/vinted/Tabs";
import { LogTab } from "@/components/vinted/LogTab";
import { EntriesTab } from "@/components/vinted/EntriesTab";
import { StatsTab } from "@/components/vinted/StatsTab";
import { AdvisorTab } from "@/components/vinted/AdvisorTab";
import { useListings } from "@/hooks/useListings";

const Index = () => {
  const [tab, setTab] = useState<TabKey>("log");
  const { listings } = useListings();
  const needs = listings.filter((l) => !l.views && !l.sold).length;

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background">
      <div className="mx-auto w-full max-w-[480px] min-h-screen min-h-[100dvh] bg-background flex flex-col overflow-x-hidden">
        <Header needsDataCount={needs} />
        <Tabs active={tab} onChange={setTab} entryCount={listings.length} />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          {tab === "log" && <LogTab onSaved={() => setTab("entries")} />}
          {tab === "entries" && <EntriesTab />}
          {tab === "insights" && <StatsTab />}
          {tab === "advisor" && <AdvisorTab />}
        </div>
      </div>
    </div>
  );
};

export default Index;
