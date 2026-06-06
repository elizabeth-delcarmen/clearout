export type TabKey = "log" | "entries" | "insights" | "advisor";

type Props = {
  active: TabKey;
  onChange: (t: TabKey) => void;
  entryCount: number;
};

export function Tabs({ active, onChange, entryCount }: Props) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "log", label: "➕ Log" },
    { key: "entries", label: `📋 (${entryCount})` },
    { key: "insights", label: "📈 Stats" },
    { key: "advisor", label: "🤖 Advisor" },
  ];
  return (
    <div className="sticky top-[88px] z-10 flex min-w-0 bg-card border-b border-border">
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`min-w-0 flex-1 py-3 text-[12px] font-sans-ui transition-colors ${
              isActive
                ? "text-primary font-extrabold border-b-[2.5px] border-primary"
                : "text-muted-foreground font-medium"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}