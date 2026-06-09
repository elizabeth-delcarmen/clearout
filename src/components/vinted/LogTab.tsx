import { useState } from "react";
import { useListings } from "@/hooks/useListings";
import { CATEGORIES, CONDITIONS } from "@/lib/listingOptions";
import { isVintedUrl, scrapeVintedListing } from "@/lib/vintedScraper";
import { AutoGrowTextarea } from "./AutoGrowTextarea";

type Props = { onSaved: () => void };

const todayStr = () => new Date().toISOString().slice(0, 10);
const nowStr = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const labelCls = "block text-label uppercase tracking-[1px] text-muted-foreground mb-1.5 font-sans-ui";
const inputCls =
  "w-full rounded-[10px] border-[1.5px] border-border bg-background px-3 py-2.5 text-sm font-sans-ui focus:border-primary";

export function LogTab({ onSaved }: Props) {
  const { add } = useListings();
  const [url, setUrl] = useState("");
  const [fetchStatus, setFetchStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("New listing");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(nowStr());
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  const handleUrlChange = async (val: string) => {
    setUrl(val);
    if (!isVintedUrl(val)) {
      if (fetchStatus !== "idle") setFetchStatus("idle");
      return;
    }
    setFetchStatus("loading");
    const result = await scrapeVintedListing(val);
    if (result.ok) {
      setItem(result.item);
      setPrice(result.price);
      if (result.condition) setCondition(result.condition);
      setFetchStatus("ok");
    } else {
      setFetchStatus("error");
    }
  };

  const ready = item.trim() && price.trim() && category && condition;

  const submit = async () => {
    if (!ready || state !== "idle") return;
    setState("saving");
    try {
      await add({
        item: item.trim(),
        price: parseFloat(price),
        type,
        category,
        condition,
        date,
        time,
        views: null,
        favourites: null,
        messages: null,
        sold: false,
        sold_when: null,
        notes: notes.trim() || null,
      });
      setState("saved");
      setUrl("");
      setFetchStatus("idle");
      setItem("");
      setPrice("");
      setType("New listing");
      setCategory("");
      setCondition("");
      setDate(todayStr());
      setTime(nowStr());
      setNotes("");
      setTimeout(() => {
        setState("idle");
        onSaved();
      }, 1000);
    } catch {
      setState("idle");
    }
  };

  const btnColor =
    state === "saved"
      ? "bg-success text-success-foreground"
      : ready
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-muted-foreground cursor-not-allowed";

  return (
    <div className="safe-x safe-b py-4 space-y-4">
      <div>
        <label className={labelCls}>Vinted listing URL (optional)</label>
        <input
          className={inputCls}
          placeholder="https://www.vinted.co.uk/items/…"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
        />
        {fetchStatus === "loading" && (
          <p className="mt-1.5 text-xs text-muted-foreground animate-pulse font-sans-ui">Fetching listing…</p>
        )}
        {fetchStatus === "ok" && (
          <p className="mt-1.5 text-xs text-green-600 dark:text-green-400 font-sans-ui">
            ✓ Name and price filled in{condition ? " — condition too" : ""}
          </p>
        )}
        {fetchStatus === "error" && (
          <p className="mt-1.5 text-xs text-destructive font-sans-ui">Could not fetch — fill in manually below</p>
        )}
      </div>
      <div>
        <label className={labelCls}>Item name</label>
        <input
          className={inputCls}
          placeholder="e.g. Green Zara jacket"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Price (€)</label>
          <input
            type="number"
            inputMode="decimal"
            className={inputCls}
            placeholder="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
            <option>New listing</option>
            <option>Relist</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Category</label>
        <select
          className={inputCls}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select…</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>Condition</label>
        <select
          className={inputCls}
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="">Select…</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Date</label>
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Time</label>
          <input type="time" className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Notes (optional)</label>
        <AutoGrowTextarea
          className={inputCls}
          placeholder="e.g. sold early, price drop, platform event…"
          value={notes}
          onChange={setNotes}
        />
      </div>
      <button
        disabled={!ready || state !== "idle"}
        onClick={submit}
        className={`w-full rounded-[12px] py-[15px] text-[16px] font-extrabold transition-colors ${btnColor}`}
      >
        {state === "saved" ? "✓ Saved!" : state === "saving" ? "Saving…" : "Save listing"}
      </button>
      <div className="rounded-[12px] bg-primary/10 p-3.5">
        <div className="text-sm font-bold text-primary font-sans-ui">⏱ Remember</div>
        <div className="text-sm text-muted-foreground font-sans-ui leading-relaxed mt-1">
          Come back after 24hrs to log views, favourites and messages in the Entries tab.
        </div>
      </div>
    </div>
  );
}