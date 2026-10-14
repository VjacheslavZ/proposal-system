import { formatDateRange } from "@/lib/format";
import type { ProposalDetails } from "@/lib/services/proposals";

const DAY_MS = 24 * 60 * 60 * 1000;

export function ProposalHero({ reservation }: { reservation: ProposalDetails["reservation"] }) {
  const firstName = reservation.member.name.split(" ")[0];
  const nights = Math.round((reservation.departure_date.getTime() - reservation.arrival_date.getTime()) / DAY_MS);

  return (
    <header className="text-center">
      <p className="text-xs tracking-[0.3em] text-stone-500 uppercase">Exclusive Resorts · Concierge</p>
      <h1 className="mt-6 font-serif text-5xl leading-tight text-balance text-stone-900 sm:text-6xl">
        Your stay at {reservation.villa}
      </h1>
      <p className="mt-4 font-serif text-xl text-balance text-stone-600 italic">
        {firstName}, we have curated a few moments for your time in {reservation.destination}.
      </p>
      <div className="mx-auto mt-8 h-px w-16 bg-stone-300" />
      <p className="mt-8 text-sm tracking-widest text-stone-600 uppercase">
        {formatDateRange(reservation.arrival_date, reservation.departure_date)} · {nights} nights
      </p>
    </header>
  );
}
