import { useCallback, useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Listing = {
  id: string;
  created_at: string;
  item: string;
  price: number;
  type: string;
  category: string;
  condition: string;
  date: string;
  time: string;
  views: string | null;
  favourites: string | null;
  messages: string | null;
  sold: boolean;
  sold_when: string | null;
  notes: string | null;
};

export type NewListing = Omit<Listing, "id" | "created_at">;

let _listings: Listing[] = [];
let _loading = true;
const _subs = new Set<() => void>();
let _fetched = false;

const notify = () => _subs.forEach((s) => s());

const fetchAll = async () => {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });
  if (!error && data) _listings = data as Listing[];
  _loading = false;
  notify();
};

export const resetListings = () => {
  _listings = [];
  _loading = true;
  _fetched = false;
  notify();
};
export const loadListings = () => {
  _fetched = true;
  fetchAll();
};

export function useListings() {
  const subscribe = useCallback((cb: () => void) => {
    _subs.add(cb);
    return () => {
      _subs.delete(cb);
    };
  }, []);
  const listings = useSyncExternalStore(
    subscribe,
    () => _listings,
    () => _listings,
  );
  const loading = useSyncExternalStore(
    subscribe,
    () => _loading,
    () => _loading,
  );

  useEffect(() => {
    if (!_fetched) {
      _fetched = true;
      fetchAll();
    }
  }, []);

  const refetch = useCallback(fetchAll, []);

  const add = async (l: Partial<NewListing>) => {
    const { error } = await supabase.from("listings").insert(l as never);
    if (error) throw error;
    await fetchAll();
  };

  const update = async (id: string, patch: Partial<Listing>) => {
    const { error } = await supabase.from("listings").update(patch as never).eq("id", id);
    if (error) throw error;
    await fetchAll();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) throw error;
    await fetchAll();
  };

  return { listings, loading, refetch, add, update, remove };
}