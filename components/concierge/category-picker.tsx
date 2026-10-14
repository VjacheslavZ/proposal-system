"use client";

import type { Category } from "@/generated/prisma/enums";
import { CATEGORIES, CATEGORY_KEYS, ESTIMATED_ACTIVITY_PRICE } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  value: Category | null;
  onChange: (category: Category) => void;
};

/** Selectable category cards, each listing its example activities with the estimated price. */
export function CategoryPicker({ value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Category</legend>
      <div className="grid grid-cols-2 gap-2">
        {CATEGORY_KEYS.map((key) => {
          const { label, icon: Icon, examples } = CATEGORIES[key];
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(key)}
              className={cn(
                "flex flex-col justify-start rounded-lg border p-3 text-left transition-colors hover:bg-muted",
                selected && "border-primary bg-muted ring-1 ring-primary",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon className="size-4" aria-hidden />
                {label}
              </span>
              <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                {examples.map((example) => (
                  <li key={example} className="flex justify-between gap-2">
                    <span>{example}</span>
                    <span className="tabular-nums">~{formatPrice(ESTIMATED_ACTIVITY_PRICE)}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
