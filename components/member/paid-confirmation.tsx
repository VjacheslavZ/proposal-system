import { Check } from "lucide-react";
import { formatDateRange, formatPrice } from "@/lib/format";
import type { ProposalDetails } from "@/lib/services/proposals";

export function PaidConfirmation({ proposal }: { proposal: ProposalDetails }) {
  const { reservation } = proposal;

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/70 px-6 py-12 text-center shadow-sm backdrop-blur sm:px-12">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
        <Check className="size-6" aria-hidden />
      </div>
      <h2 className="mt-6 font-serif text-4xl text-stone-900">Your itinerary is locked in</h2>
      <p className="mx-auto mt-4 max-w-md text-stone-600">
        Thank you, {reservation.member.name.split(" ")[0]}. Every experience is confirmed for your stay at{" "}
        {reservation.villa}, {formatDateRange(reservation.arrival_date, reservation.departure_date)}. Your concierge
        will be in touch before you arrive.
      </p>
      <p className="mt-8 text-xs tracking-[0.3em] text-stone-500 uppercase">Total paid</p>
      <p className="mt-2 font-serif text-4xl text-stone-900 tabular-nums">{formatPrice(proposal.total)}</p>
    </section>
  );
}
