// PostingCheatSheet.jsx
// A floating ⚡ button fixed above your tab bar that slides up a bottom sheet.
// 
// USAGE — two steps:
//
// 1. Import and drop <PostingCheatSheet /> once, anywhere in your root layout
//    (e.g. in App.jsx or your main layout component, outside the tab navigator):
//
//    import PostingCheatSheet from './components/PostingCheatSheet';
//    ...
//    <PostingCheatSheet />
//
// 2. Adjust the `bottom` value on the floating button (currently 80px)
//    to sit just above your tab bar. If your tab bar is taller, increase it.

import { useState, useEffect } from "react";

const PRIMARY = "hsl(var(--primary))";
const BRAND = "hsl(var(--brand))";

const days = [
  { day: "Mon", score: 1 },
  { day: "Tue", score: 5 },
  { day: "Wed", score: 4 },
  { day: "Thu", score: 5 },
  { day: "Fri", score: 3 },
  { day: "Sat", score: 1 },
  { day: "Sun", score: 2 },
];

const rules = {
  good: [
    "Tue–Thu evening 18:00–21:00",
    "Week 1 of the month (1st–7th)",
    "Friday 20:00–22:00 as backup",
    "Account quiet for 48h+",
  ],
  avoid: [
    "Monday — weakest day",
    "Saturday daytime",
    "Week 3 (15th–21st)",
    "After relisting or price drops",
  ],
};

const dayColor = (score) => {
  if (score >= 5) return BRAND;
  if (score >= 4) return "#2EC4B6";
  if (score >= 3) return "#A8DADC";
  if (score >= 2) return "#CBD5E0";
  return "#E8E4DF";
};

const dayTextColor = (score) => (score >= 3 ? "#fff" : "#aaa");

// Get today's day label to highlight it
const getTodayIndex = () => {
  const jsDay = new Date().getDay(); // 0=Sun,1=Mon,...,6=Sat
  // Remap to Mon=0 ... Sun=6
  return jsDay === 0 ? 6 : jsDay - 1;
};

export default function PostingCheatSheet() {
  const [open, setOpen] = useState(false);
  const todayIndex = getTodayIndex();

  // Prevent body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open posting cheat sheet"
        className="cheatsheet-fab"
        style={{
          position: "fixed",
          right: "max(1rem, env(safe-area-inset-right))",
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: BRAND,
          border: "none",
          boxShadow: "0 4px 16px rgba(0,181,173,0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          zIndex: 100,
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        ⚡
      </button>

      {/* ── Backdrop ── */}
      {open && (
        <div
          onClick={handleBackdrop}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {/* ── Bottom sheet ── */}
          <div
            className="font-sans-ui"
            style={{
              width: "100%",
              maxHeight: "85vh",
              background: "#F7F5F2",
              borderRadius: "20px 20px 0 0",
              overflowY: "auto",
              animation: "slideUp 0.25s ease",
              paddingBottom: 32,
            }}
          >
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#D0CBC4" }} />
            </div>

            {/* Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 20px 16px",
            }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>Posting Cheat Sheet</div>
                <div style={{ fontSize: 15, color: "#666", marginTop: 2 }}>From 162 sales · Aug 2025 – Jun 2026</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "#E8E4DF", border: "none",
                  fontSize: 14, cursor: "pointer", color: "#666",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "0 16px" }}>

              {/* Sweet spot */}
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
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Tue–Thu · 18:00–21:00 · Week 1</div>
                </div>
              </div>

              {/* Day strip — today highlighted */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  Day of week
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {days.map((d, i) => (
                    <div key={d.day} style={{
                      flex: 1,
                      background: dayColor(d.score),
                      borderRadius: 8,
                      padding: "8px 2px",
                      textAlign: "center",
                      outline: i === todayIndex ? "2px solid #1a1a1a" : "none",
                      outlineOffset: 2,
                      position: "relative",
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: dayTextColor(d.score) }}>{d.day}</div>
                      {i === todayIndex && (
                        <div style={{
                          position: "absolute",
                          bottom: -6,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 4, height: 4,
                          borderRadius: "50%",
                          background: "#1a1a1a",
                        }} />
                      )}
                    </div>
                  ))}
                </div>
                {/* Today label */}
                <div style={{ textAlign: "center", marginTop: 10, fontSize: 15, color: "#666" }}>
                  Today: <strong style={{ color: dayColor(days[todayIndex].score) === "#E8E4DF" ? "#666" : PRIMARY }}>
                    {days[todayIndex].day}
                  </strong>
                  {days[todayIndex].score >= 4 ? " ✅ Good day to post" : days[todayIndex].score <= 1 ? " ❌ Avoid today" : " — Decent"}
                </div>
              </div>

              {/* Do / Avoid — two columns */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
                {/* Post when */}
                <div style={{ background: "#fff", borderRadius: 12, padding: "12px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, marginBottom: 8 }}>✅ Post when</div>
                  {rules.good.map((r, i) => (
                    <div key={i} style={{ fontSize: 15, color: "#444", marginBottom: 6, lineHeight: 1.4 }}>· {r}</div>
                  ))}
                </div>
                {/* Avoid */}
                <div style={{ background: "#fff", borderRadius: 12, padding: "12px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#E07B6A", marginBottom: 8 }}>❌ Avoid</div>
                  {rules.avoid.map((r, i) => (
                    <div key={i} style={{ fontSize: 15, color: "#444", marginBottom: 6, lineHeight: 1.4 }}>· {r}</div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Animations ── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
