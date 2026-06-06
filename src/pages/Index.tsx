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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[480px] min-h-screen bg-background flex flex-col">
        <Header needsDataCount={needs} />
        <Tabs active={tab} onChange={setTab} entryCount={listings.length} />
        <div className="flex-1">
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
