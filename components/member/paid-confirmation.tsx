"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";

type Props = {
  firstName: string;
  villa: string;
  /** Pre-formatted stay dates, e.g. "Dec 15 – 22, 2027". */
  dates: string;
  total: number;
};

/** Confirmation popup shown once the proposal is paid; it opens on load and can be reopened. */
export function PaidConfirmation({ firstName, villa, dates, total }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="flex items-center gap-2 text-sm tracking-[0.2em] text-emerald-800 uppercase">
          <Check className="size-4" aria-hidden />
          Paid &amp; locked in
        </p>
        <Button variant="link" className="text-stone-600" onClick={() => setOpen(true)}>
          View confirmation
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          overlayClassName="bg-stone-900/20 duration-500 supports-backdrop-filter:backdrop-blur-md"
          className="gap-0 rounded-3xl bg-stone-50 px-8 py-12 text-center duration-500 data-open:slide-in-from-bottom-8 sm:max-w-lg sm:px-12"
        >
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 animate-in fade-in-0 zoom-in-50 delay-300 duration-700 fill-mode-both">
            <Check className="size-7" aria-hidden />
          </div>
          <DialogTitle className="mt-6 font-serif text-4xl font-normal text-balance text-stone-900">
            Your itinerary is locked in
          </DialogTitle>
          <DialogDescription className="mt-4 text-base leading-relaxed text-stone-600">
            Thank you, {firstName}. Every experience is confirmed for your stay at {villa}, {dates}. Your concierge will
            be in touch before you arrive.
          </DialogDescription>
          <p className="mt-8 text-xs tracking-[0.3em] text-stone-500 uppercase">Total paid</p>
          <p className="mt-2 font-serif text-4xl text-stone-900 tabular-nums">{formatPrice(total)}</p>
          <DialogClose
            render={
              <Button className="mx-auto mt-10 h-12 rounded-full bg-stone-900 px-10 text-sm tracking-[0.2em] text-stone-50 uppercase hover:bg-stone-800" />
            }
          >
            View itinerary
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
