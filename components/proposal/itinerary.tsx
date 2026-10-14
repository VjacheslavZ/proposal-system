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

/** Day-by-day list of itinerary items, shared by the concierge preview and the member view. */
export function Itinerary({ items }: { items: ItineraryItem[] }) {
  return (
    <div className="space-y-10">
      {groupByDay(items).map(([day, dayItems]) => (
        <section key={day}>
          <h3 className="mb-4 border-b border-stone-200 pb-2 font-serif text-xl text-stone-900">{day}</h3>
          <ul className="space-y-6">
            {dayItems.map((item) => {
              const { icon: Icon, label } = CATEGORIES[item.category];
              return (
                <li key={item.id} className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs tracking-widest text-stone-500 uppercase">
                      {formatDate(item.scheduled_at, { timeStyle: "short" })} · {label}
                    </p>
                    <p className="mt-1 font-medium text-stone-900">{item.title}</p>
                    {item.description && <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.description}</p>}
                  </div>
                  <p className="shrink-0 text-stone-900 tabular-nums">{formatPrice(item.price)}</p>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
