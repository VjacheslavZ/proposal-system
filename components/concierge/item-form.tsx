"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { Category } from "@/generated/prisma/enums";
import type { ItineraryItem } from "@/components/proposal/itinerary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, CATEGORY_KEYS, ESTIMATED_ACTIVITY_PRICE } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  /** Allowed range for `<input type="datetime-local">`, e.g. "2027-12-15T00:00". */
  minDateTime: string;
  maxDateTime: string;
  onAdd: (item: ItineraryItem) => void;
};

export function ItemForm({ minDateTime, maxDateTime, onAdd }: Props) {
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState(minDateTime.replace("T00:00", "T10:00"));
  const [price, setPrice] = useState("");

  function selectCategory(value: Category) {
    setCategory(value);
    setTitle(CATEGORIES[value].examples[0]);
    setPrice(String(ESTIMATED_ACTIVITY_PRICE / 100));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!category) return;
    onAdd({
      id: crypto.randomUUID(),
      category,
      title: title.trim(),
      description: description.trim(),
      // Time zones are ignored: the entered wall-clock time is stored as UTC.
      scheduled_at: `${scheduledAt}:00.000Z`,
      price: Math.round(Number(price) * 100),
    });
    // Keep the date so the next item for the same day is quick to add.
    setCategory(null);
    setTitle("");
    setDescription("");
    setPrice("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Category</legend>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORY_KEYS.map((key) => {
            const { label, icon: Icon, examples } = CATEGORIES[key];
            const selected = category === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                onClick={() => selectCategory(key)}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={2}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="scheduled-at">Date &amp; time</Label>
          <Input
            id="scheduled-at"
            type="datetime-local"
            required
            min={minDateTime}
            max={maxDateTime}
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Estimated price (USD)</Label>
          <Input
            id="price"
            type="number"
            required
            min={0}
            step={0.01}
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" disabled={!category}>
        <Plus aria-hidden />
        Add to itinerary
      </Button>
    </form>
  );
}
