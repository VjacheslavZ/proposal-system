import type { Category } from "@/generated/prisma/enums";
import { CATEGORIES } from "@/lib/categories";
import { formatDate, formatPrice } from "@/lib/format";

export type ItineraryItem = {
  id: string;
  category: Category;
  title: string;
  description: string;
  scheduled_at: string | Date;
  price: number;
};

function groupByDay(items: ItineraryItem[]) {
  const sorted = [...items].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const days = new Map<string, ItineraryItem[]>();
  for (const item of sorted) {
    const day = formatDate(item.scheduled_at, { weekday: "long", month: "long", day: "numeric" });
    days.set(day, [...(days.get(day) ?? []), item]);
  }
  return [...days];
}

/** Day-by-day timeline of itinerary items, shared by the concierge preview and the member view. */
export function Itinerary({ items }: { items: ItineraryItem[] }) {
  return (
    <ol className="space-y-12">
      {groupByDay(items).map(([day, dayItems]) => (
        <li key={day}>
          <h3 className="font-serif text-2xl text-stone-900">{day}</h3>
          <ul className="mt-6 space-y-8 border-l border-stone-200 pl-6 sm:pl-8">
            {dayItems.map((item) => {
              const { icon: Icon, label } = CATEGORIES[item.category];
              return (
                <li key={item.id} className="relative">
                  {/* Timeline marker on the left rule. */}
                  <span
                    aria-hidden
                    className="absolute top-1.5 -left-[calc(1.5rem+4.5px)] size-2 rounded-full bg-amber-700/70 ring-4 ring-stone-50 sm:-left-[calc(2rem+4.5px)]"
                  />
                  <div className="flex items-baseline justify-between gap-6">
                    <p className="flex items-center gap-2 text-xs tracking-[0.2em] text-stone-500 uppercase">
                      <span className="text-stone-700">{formatDate(item.scheduled_at, { timeStyle: "short" })}</span>
                      <span aria-hidden>·</span>
                      <Icon className="size-3.5" aria-hidden />
                      {label}
                    </p>
                    <p className="shrink-0 text-sm text-stone-700 tabular-nums">{formatPrice(item.price)}</p>
                  </div>
                  <p className="mt-2 font-serif text-xl text-stone-900">{item.title}</p>
                  {item.description && <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.description}</p>}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}
