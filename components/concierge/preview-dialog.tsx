"use client";

import { Eye } from "lucide-react";
import { Itinerary, type ItineraryItem } from "@/components/proposal/itinerary";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";

type Props = {
  memberName: string;
  villa: string;
  items: ItineraryItem[];
  total: number;
};

export function PreviewDialog({ memberName, villa, items, total }: Props) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" disabled={items.length === 0}>
            <Eye aria-hidden />
            Preview
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Proposal for {memberName}</DialogTitle>
          <DialogDescription>{villa} — this is what the member will see.</DialogDescription>
        </DialogHeader>
        <Itinerary items={items} />
        <div className="flex items-baseline justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-2xl font-semibold tabular-nums">{formatPrice(total)}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
