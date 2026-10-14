"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { Category } from "@/generated/prisma/enums";
import { CategoryPicker } from "@/components/concierge/category-picker";
import type { ItineraryItem } from "@/components/proposal/itinerary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, ESTIMATED_ACTIVITY_PRICE } from "@/lib/categories";

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
  const [scheduledAt, setScheduledAt] = useState("");
  const [price, setPrice] = useState("");

  function selectCategory(value: Category) {
    setCategory(value);
    setTitle(CATEGORIES[value].examples[0]);
    setPrice(String(ESTIMATED_ACTIVITY_PRICE / 100));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // `required` inputs block empty values in the browser; this guards the state as well.
    if (!category || !scheduledAt) return;
    onAdd({
      id: crypto.randomUUID(),
      category,
      title: title.trim(),
      description: description.trim(),
      // Time zones are ignored: the entered wall-clock time is stored as UTC.
      scheduled_at: `${scheduledAt}:00.000Z`,
      price: Math.round(Number(price) * 100),
    });
    setCategory(null);
    setTitle("");
    setDescription("");
    setScheduledAt("");
    setPrice("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CategoryPicker value={category} onChange={selectCategory} />

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
          <Label htmlFor="price">Price (USD)</Label>
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
