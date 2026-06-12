// BaselineInsights.jsx
// Drop this into your Stats tab, below your existing charts.
// Usage: <BaselineInsights />

const PRIMARY = "hsl(var(--primary))";
const BRAND = "hsl(var(--brand))";
const BG = "#F7F5F2";

const days = [
  { day: "Mon", score: 2, label: "Quiet" },
  { day: "Tue", score: 3, label: "OK" },
  { day: "Wed", score: 2, label: "Avoid" },
  { day: "Thu", score: 5, label: "Best" },
  { day: "Fri", score: 4, label: "Great" },
  { day: "Sat", score: 3, label: "OK" },
  { day: "Sun", score: 2, label: "Quiet" },
];

const times = [
  { slot: "Night", hours: "00–06", score: 0 },
  { slot: "Morning", hours: "06–12", score: 2 },
  { slot: "Afternoon", hours: "12–18", score: 3 },
  { slot: "Evening", hours: "18–23", score: 5 },
];

const weeks = [
  { label: "Week 1", dates: "1–7", score: 4, note: "Strong 💰" },
  { label: "Week 2", dates: "8–14", score: 2, note: "Quietest" },
  { label: "Week 3", dates: "15–21", score: 3, note: "" },
  { label: "Week 4", dates: "22+", score: 5, note: "Strongest 🏆" },
];

const categories = [
  { name: "Bags", emoji: "👜", count: 45 },
  { name: "Clothing", emoji: "👗", count: 28 },
  { name: "Books", emoji: "📚", count: 32 },
  { name: "Home & Tech", emoji: "🔌", count: 21 },
  { name: "Stationery", emoji: "✏️", count: 16 },
];

const dayColor = (score) => {
  if (score >= 5) return BRAND;
  if (score >= 4) return "#2EC4B6";
  if (score >= 3) return "#A8DADC";
  if (score >= 2) return "#CBD5E0";
  return "#E8E4DF";
};

const dayTextColor = (score) => (score >= 3 ? "#fff" : "#999");

export default function BaselineInsights() {
  return (
    <div className="font-sans-ui" style={{ padding: "0 16px 32px" }}>

      {/* Section header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 16,
        paddingTop: 24,
        borderTop: "1.5px solid #E8E4DF",
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>Baseline Insights</div>
          <div style={{ fontSize: 15, color: "#666", marginTop: 2 }}>From GDPR export · 179 sales · Aug 2025 – Jun 2026</div>
        </div>
        <div style={{
          background: `${BRAND}15`,
          color: PRIMARY,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding: "4px 8px",
          borderRadius: 6,
        }}>
          Static
        </div>
      </div>

      {/* Sweet spot pill */}
      <div style={{
        background: "#1a1a1a",
        borderRadius: 12,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
      }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <div>
          <div style={{ fontSize: 14, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>Sweet spot</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Thu–Fri · 18:00–21:00 · Week 4</div>
        </div>
      </div>

      {/* Day of week */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Day of week
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {days.map((d) => (
            <div key={d.day} style={{
              flex: 1,
              background: dayColor(d.score),
              borderRadius: 8,
              padding: "8px 2px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: dayTextColor(d.score) }}>{d.day}</div>
              <div style={{ fontSize: 14, color: dayTextColor(d.score), opacity: 0.75, marginTop: 1 }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Time of day */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Time of day
        </div>
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden" }}>
          {times.map((t, i) => (
            <div key={t.slot} style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderBottom: i < times.length - 1 ? "1px solid #F7F5F2" : "none",
              background: t.score === 5 ? `${BRAND}08` : "transparent",
            }}>
              <div style={{ width: 76 }}>
                <span style={{ fontSize: 15, fontWeight: t.score === 5 ? 700 : 400, color: t.score === 5 ? PRIMARY : "#555" }}>
                  {t.slot}
                </span>
                <span style={{ fontSize: 15, color: "#666", marginLeft: 4 }}>{t.hours}h</span>
              </div>
              <div style={{ flex: 1, height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  width: `${(t.score / 5) * 100}%`,
                  height: "100%",
                  background: t.score === 5 ? BRAND : "#C8E6E5",
                  borderRadius: 3,
                }} />
              </div>
              {t.score === 5 && <span style={{ fontSize: 14 }}>🏆</span>}
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 8,
          padding: "10px 12px",
          background: `${BRAND}10`,
          borderRadius: 8,
          fontSize: 15,
          color: "#555",
          lineHeight: 1.5,
        }}>
          💡 Post at <strong>18:00–18:30</strong> to be "new" when the evening rush hits
        </div>
      </div>

      {/* Week of month */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Week of month
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {weeks.map((w) => (
            <div key={w.label} style={{
              flex: 1,
              background: w.score >= 4 ? dayColor(w.score) : "#fff",
              border: w.score < 4 ? "1.5px solid #E8E4DF" : "none",
              borderRadius: 10,
              padding: "10px 6px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: w.score >= 4 ? "#fff" : "#333" }}>{w.label}</div>
              <div style={{ fontSize: 14, color: w.score >= 4 ? "rgba(255,255,255,0.75)" : "#666", marginTop: 1 }}>{w.dates}</div>
              {w.note && (
                <div style={{ fontSize: 14, color: w.score >= 4 ? "#fff" : "#666", marginTop: 3 }}>{w.note}</div>
              )}
              <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 5 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    width: 4, height: 4, borderRadius: "50%",
                    background: i <= w.score
                      ? (w.score >= 4 ? "rgba(255,255,255,0.8)" : BRAND)
                      : (w.score >= 4 ? "rgba(255,255,255,0.25)" : "#ddd"),
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top categories */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Top categories
        </div>
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden" }}>
          {categories.map((c, i) => (
            <div key={c.name} style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderBottom: i < categories.length - 1 ? "1px solid #F7F5F2" : "none",
            }}>
              <span style={{ fontSize: 18 }}>{c.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: i === 0 ? 700 : 400, color: "#333" }}>{c.name}</span>
                  <span style={{ fontSize: 15, color: PRIMARY, fontWeight: 600 }}>{c.count}</span>
                </div>
                <div style={{ height: 4, background: "#eee", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    width: `${(c.count / 45) * 100}%`,
                    height: "100%",
                    background: i === 0 ? BRAND : "#C8E6E5",
                    borderRadius: 2,
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
