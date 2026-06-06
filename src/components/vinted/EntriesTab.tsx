import { useListings } from "@/hooks/useListings";
import { EntryCard } from "./EntryCard";

export function EntriesTab() {
  const { listings, loading } = useListings();

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-sans-ui">Loading…</div>;
  }
  if (!listings.length) {
    return (
      <div className="p-10 text-center font-sans-ui">
        <div className="text-[36px]">👗</div>
        <div className="text-muted-foreground mt-2">No entries yet — go log your first listing!</div>
      </div>
    );
  }
  return (
    <div className="p-4">
      {listings.map((l) => (
        <EntryCard key={l.id} listing={l} />
      ))}
    </div>
  );
}