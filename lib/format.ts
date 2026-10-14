// Time zones are intentionally ignored: dates are stored as UTC "wall-clock" values
// and always formatted in UTC, so they display exactly as the concierge entered them.

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(cents: number): string {
  return usd.format(cents / 100);
}

export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }): string {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, { dateStyle: "medium", timeStyle: "short" });
}

/** A compact range such as "Dec 15 – 22, 2027". */
export function formatDateRange(start: Date | string, end: Date | string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).formatRange(new Date(start), new Date(end));
}
