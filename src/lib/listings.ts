import type { Listing } from "@/hooks/useListings";

const MS_24H = 24 * 60 * 60 * 1000;

export function isMetricEmpty(value: string | null | undefined): boolean {
  return value == null || value.trim() === "";
}

export function isReadyFor24hNudge(listing: Listing): boolean {
  if (listing.sold) return false;
  if (
    !isMetricEmpty(listing.views) ||
    !isMetricEmpty(listing.favourites) ||
    !isMetricEmpty(listing.messages)
  ) {
    return false;
  }
  return Date.now() - new Date(listing.created_at).getTime() >= MS_24H;
}
