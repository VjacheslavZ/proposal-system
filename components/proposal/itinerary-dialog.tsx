"use client";

import { Itinerary, type ItineraryItem } from "@/components/proposal/itinerary";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";

type Props = {
  /** The element that opens the dialog, e.g. a `<Button>`. */
  trigger: React.ReactElement;
  title: string;
  description: string;
  items: ItineraryItem[];
  total: number;
};

/** Shows an itinerary the way the member sees it: used for the draft preview and for viewing saved proposals. */
export function ItineraryDialog({ trigger, title, description, items, total }: Props) {
  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
