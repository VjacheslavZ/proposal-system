"use client";

import { Save, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ItemForm } from "@/components/concierge/item-form";
import { PreviewDialog } from "@/components/concierge/preview-dialog";
import type { ItineraryItem } from "@/components/proposal/itinerary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api-client";
import { CATEGORIES } from "@/lib/categories";
import { formatDateTime, formatPrice } from "@/lib/format";

type Props = {
  reservationId: string;
  memberName: string;
  memberEmail: string;
  villa: string;
  arrivalDate: Date;
  departureDate: Date;
};

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

export function ProposalBuilder({ reservationId, memberName, memberEmail, villa, arrivalDate, departureDate }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [pending, setPending] = useState(false);

  const sortedItems = [...items].sort((a, b) => String(a.scheduled_at).localeCompare(String(b.scheduled_at)));
  const total = items.reduce((sum, item) => sum + item.price, 0);

  async function submit(send: boolean) {
    setPending(true);
    try {
      const proposal = await apiRequest<{ id: string }>("/api/proposals", {
        method: "POST",
        body: {
          reservation_id: reservationId,
          items: items.map(({ category, title, description, scheduled_at, price }) => ({
            category,
            title,
            description,
            scheduled_at,
            price,
          })),
        },
      });
      setItems([]);

      if (!send) {
        toast.success("Draft saved");
        return;
      }
      try {
        await apiRequest(`/api/proposals/${proposal.id}/send`, { method: "POST" });
        toast.success(`Proposal sent to ${memberEmail}`);
      } catch (error) {
        toast.error(`Draft saved, but sending failed: ${(error as Error).message}`);
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setPending(false);
      router.refresh();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <Card>
        <CardHeader>
          <CardTitle>Add an item</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemForm
            minDateTime={`${toDateInput(arrivalDate)}T00:00`}
            maxDateTime={`${toDateInput(departureDate)}T23:59`}
            onAdd={(item) => setItems((current) => [...current, item])}
          />
        </CardContent>
      </Card>

      <Card className="lg:sticky lg:top-6 lg:self-start">
        <CardHeader>
          <CardTitle>
            New proposal · {items.length} {items.length === 1 ? "item" : "items"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">Pick a category and add items to build the itinerary.</p>
          ) : (
            <ul className="divide-y">
              {sortedItems.map((item) => (
                <li key={item.id} className="flex items-start gap-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORIES[item.category].label} · {formatDateTime(item.scheduled_at)}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums">{formatPrice(item.price)}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => setItems((current) => current.filter(({ id }) => id !== item.id))}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-baseline justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-semibold tabular-nums">{formatPrice(total)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <PreviewDialog memberName={memberName} villa={villa} items={items} total={total} />
            <Button variant="outline" disabled={items.length === 0 || pending} onClick={() => submit(false)}>
              <Save aria-hidden />
              Save draft
            </Button>
            <Button disabled={items.length === 0 || pending} onClick={() => submit(true)}>
              <Send aria-hidden />
              Send now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
