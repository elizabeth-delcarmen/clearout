import { format } from "date-fns";
import { enGB } from "date-fns/locale";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseListingDate(iso: string): Date | null {
  if (!ISO_DATE.test(iso)) return null;
  const d = new Date(iso + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatListingDate(iso: string, now: Date = new Date()): string {
  const d = parseListingDate(iso);
  if (!d) return iso;

  const pattern =
    d.getFullYear() === now.getFullYear() ? "EEE d MMM" : "EEE d MMM yyyy";
  return format(d, pattern, { locale: enGB });
}
