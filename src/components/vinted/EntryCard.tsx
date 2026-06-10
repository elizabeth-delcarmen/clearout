import { useState } from "react";
import { useListings, notesDbValue, type Listing } from "@/hooks/useListings";
import { isReadyFor24hNudge } from "@/lib/listings";
import { CATEGORIES, CONDITIONS } from "@/lib/listingOptions";
import { AutoGrowTextarea } from "./AutoGrowTextarea";

type Props = { listing: Listing };

const labelCls = "block text-label uppercase tracking-[1px] text-muted-foreground mb-1.5 font-sans-ui";
const inputCls =
  "w-full rounded-[8px] border-[1.5px] border-border bg-background px-2 py-2 text-sm font-sans-ui focus:border-primary";

export function EntryCard({ listing }: Props) {
  const { update, remove } = useListings();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const missingData = !listing.views && !listing.sold;
  const readyFor24hNudge = isReadyFor24hNudge(listing);
  const isRelist = listing.type === "Relist";

  const borderClass = missingData ? "border-2 border-warn" : "border-[1.5px] border-border";

  return (
    <div
      className={`bg-card rounded-[14px] ${borderClass} mb-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]`}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-4 flex items-start justify-between gap-3"
      >
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold truncate">{listing.item}</div>
          <div className="text-sm text-muted-foreground font-sans-ui mt-0.5">
            {listing.date} · {listing.time} ·{" "}
            <span className="text-primary font-semibold">€{listing.price}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {listing.category && (
              <span className="text-[10px] font-semibold rounded-[20px] px-2 py-0.5 bg-muted text-muted-foreground font-sans-ui">
                {listing.category}
              </span>
            )}
            {listing.condition && (
              <span className="text-[10px] font-semibold rounded-[20px] px-2 py-0.5 bg-muted text-muted-foreground font-sans-ui">
                {listing.condition}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {readyFor24hNudge && (
            <span className="text-warn-text text-[10px] leading-none" aria-label="Ready for 24h data">
              ●
            </span>
          )}
          <Badge color={isRelist ? "warn" : "primary"}>{isRelist ? "Relist" : "New"}</Badge>
          {listing.sold && <Badge color="success">Sold ✓</Badge>}
          {missingData && <Badge color="warn">Log 24h data</Badge>}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border">
          {readyFor24hNudge && (
            <div className="px-4 pt-3">
              <div className="rounded-[10px] bg-warn/10 px-3 py-2.5 text-sm font-semibold text-warn-text font-sans-ui">
                ⏱ Ready for 24h data — add your views, favourites and messages
              </div>
            </div>
          )}
          <div className="px-4 pb-4">
          {editing ? (
            <EditForm
              listing={listing}
              onCancel={() => setEditing(false)}
              onSave={async (patch) => {
                await update(listing.id, patch);
                setEditing(false);
              }}
            />
          ) : (
            <ViewMode
              listing={listing}
              onEdit={() => setEditing(true)}
              onDelete={() => remove(listing.id)}
              onSave24={async (patch) => update(listing.id, patch)}
            />
          )}
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({
  color,
  children,
}: {
  color: "primary" | "warn" | "success";
  children: React.ReactNode;
}) {
  const map: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    warn: "bg-warn text-warn-foreground",
    success: "bg-success/15 text-success",
  };
  return (
    <span className={`text-[11px] font-bold rounded-[20px] px-2.5 py-0.5 font-sans-ui ${map[color]}`}>
      {children}
    </span>
  );
}

function ViewMode({
  listing,
  onEdit,
  onDelete,
  onSave24,
}: {
  listing: Listing;
  onEdit: () => void;
  onDelete: () => void;
  onSave24: (patch: Partial<Listing>) => Promise<void>;
}) {
  const missing = !listing.views && !listing.sold;

  if (missing) {
    return (
      <>
        <Log24Form listing={listing} onSave={onSave24} />
        {listing.notes && (
          <div className="text-sm font-sans-ui pt-3">
            <span className="text-label uppercase tracking-[1px] text-muted-foreground text-[10px]">
              Notes
            </span>
            <p className="mt-1 text-foreground leading-relaxed whitespace-pre-wrap">{listing.notes}</p>
          </div>
        )}
        <div className="flex gap-3 pt-3">
          <button onClick={onEdit} className="text-sm text-primary font-sans-ui">
            ✏️ Edit
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this entry?")) onDelete();
            }}
            className="text-sm text-destructive font-sans-ui"
          >
            Delete
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="pt-3 space-y-3">
      {listing.views && (
        <div className="grid grid-cols-3 gap-2">
          <StatBox label="👁️ Views" value={listing.views} />
          <StatBox label="❤️ Favs" value={listing.favourites ?? "-"} />
          <StatBox label="💬 Msgs" value={listing.messages ?? "-"} />
        </div>
      )}
      {listing.sold && listing.sold_when && (
        <div className="text-sm font-semibold text-success font-sans-ui">
          ✓ Sold: {listing.sold_when}
        </div>
      )}
      {listing.notes && (
        <div className="text-sm font-sans-ui">
          <span className="text-label uppercase tracking-[1px] text-muted-foreground text-[10px]">
            Notes
          </span>
          <p className="mt-1 text-foreground leading-relaxed whitespace-pre-wrap">{listing.notes}</p>
        </div>
      )}
      <div className="flex gap-3 pt-1">
        <button onClick={onEdit} className="text-sm text-primary font-sans-ui">
          ✏️ Edit
        </button>
        <button
          onClick={() => {
            if (confirm("Delete this entry?")) onDelete();
          }}
          className="text-sm text-destructive font-sans-ui"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background rounded-[10px] py-2.5 text-center">
      <div className="text-[18px] font-extrabold">{value}</div>
      <div className="text-[10px] text-muted-foreground font-sans-ui">{label}</div>
    </div>
  );
}

function Log24Form({
  listing,
  onSave,
}: {
  listing: Listing;
  onSave: (patch: Partial<Listing>) => Promise<void>;
}) {
  const [views, setViews] = useState(listing.views ?? "");
  const [favs, setFavs] = useState(listing.favourites ?? "");
  const [msgs, setMsgs] = useState(listing.messages ?? "");
  const [sold, setSold] = useState(listing.sold);
  const [soldWhen, setSoldWhen] = useState(listing.sold_when ?? "");

  return (
    <div className="mt-3 rounded-[10px] bg-warn/5 p-3 space-y-3">
      <div className="text-sm font-bold text-warn-text font-sans-ui">📊 Log 24hr data</div>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Views" value={views} onChange={setViews} />
        <Field label="Favs" value={favs} onChange={setFavs} />
        <Field label="Msgs" value={msgs} onChange={setMsgs} />
      </div>
      <label className="flex items-center gap-2 text-sm font-sans-ui">
        <input type="checkbox" checked={sold} onChange={(e) => setSold(e.target.checked)} />
        Sold?
      </label>
      {sold && (
        <div>
          <label className={labelCls}>When sold (day + time)</label>
          <input
            className={inputCls}
            placeholder="e.g. Friday 21:30"
            value={soldWhen}
            onChange={(e) => setSoldWhen(e.target.value)}
          />
        </div>
      )}
      <button
        onClick={() =>
          onSave({
            views: views || null,
            favourites: favs || null,
            messages: msgs || null,
            sold,
            sold_when: sold ? soldWhen : null,
          })
        }
        className="w-full rounded-[10px] bg-primary text-primary-foreground py-2.5 font-bold font-sans-ui"
      >
        Save 24hr data
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="number"
        inputMode="numeric"
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function EditForm({
  listing,
  onSave,
  onCancel,
}: {
  listing: Listing;
  onSave: (patch: Partial<Listing>) => Promise<void>;
  onCancel: () => void;
}) {
  const [item, setItem] = useState(listing.item);
  const [price, setPrice] = useState(String(listing.price));
  const [type, setType] = useState(listing.type);
  const [category, setCategory] = useState(listing.category ?? "");
  const [condition, setCondition] = useState(listing.condition ?? "");
  const [date, setDate] = useState(listing.date);
  const [time, setTime] = useState(listing.time);
  const [views, setViews] = useState(listing.views ?? "");
  const [favs, setFavs] = useState(listing.favourites ?? "");
  const [msgs, setMsgs] = useState(listing.messages ?? "");
  const [sold, setSold] = useState(listing.sold);
  const [soldWhen, setSoldWhen] = useState(listing.sold_when ?? "");
  const [notes, setNotes] = useState(listing.notes ?? "");

  return (
    <div className="mt-3 rounded-[10px] bg-primary/5 p-3 space-y-3">
      <div className="text-sm font-bold text-primary font-sans-ui">✏️ Edit entry</div>
      <div>
        <label className={labelCls}>Item name</label>
        <input className={inputCls} value={item} onChange={(e) => setItem(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Price (€)</label>
          <input
            type="number"
            className={inputCls}
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
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Category</label>
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            {category && !CATEGORIES.includes(category as typeof CATEGORIES[number]) && (
              <option value={category}>{category}</option>
            )}
          </select>
        </div>
        <div>
          <label className={labelCls}>Condition</label>
          <select className={inputCls} value={condition} onChange={(e) => setCondition(e.target.value)}>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            {condition && !CONDITIONS.includes(condition as typeof CONDITIONS[number]) && (
              <option value={condition}>{condition}</option>
            )}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
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
      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-[1px] font-sans-ui pt-1">
        24HR DATA
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Views" value={views} onChange={setViews} />
        <Field label="Favs" value={favs} onChange={setFavs} />
        <Field label="Msgs" value={msgs} onChange={setMsgs} />
      </div>
      <label className="flex items-center gap-2 text-sm font-sans-ui">
        <input type="checkbox" checked={sold} onChange={(e) => setSold(e.target.checked)} />
        Sold?
      </label>
      {sold && (
        <div>
          <label className={labelCls}>When sold</label>
          <input
            className={inputCls}
            value={soldWhen}
            onChange={(e) => setSoldWhen(e.target.value)}
          />
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() =>
            onSave({
              item,
              price: parseFloat(price) || 0,
              type,
              category,
              condition,
              date,
              time,
              views: views || null,
              favourites: favs || null,
              messages: msgs || null,
              sold,
              sold_when: sold ? soldWhen : null,
              ...notesDbValue(notes, listing.notes),
            })
          }
          className="flex-1 rounded-[10px] bg-primary text-primary-foreground py-2.5 font-bold font-sans-ui"
        >
          Save changes
        </button>
        <button
          onClick={onCancel}
          className="flex-1 rounded-[10px] bg-background text-muted-foreground border border-border py-2.5 font-bold font-sans-ui"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}