import { connection } from "next/server";
import { Suspense } from "react";
import { ProposalBuilder } from "@/components/concierge/proposal-builder";
import { ProposalsTable } from "@/components/concierge/proposals-table";
import { TripHeader } from "@/components/concierge/trip-header";
import { listProposals } from "@/lib/services/proposals";
import { getCurrentReservation } from "@/lib/services/reservations";

async function Dashboard() {
  // better-sqlite3 is synchronous, so opt out of prerendering to always read fresh data.
  await connection();
  const [reservation, proposals] = await Promise.all([getCurrentReservation(), listProposals()]);

  return (
    <>
      <TripHeader reservation={reservation} />
      <ProposalBuilder
        reservationId={reservation.id}
        memberName={reservation.member.name}
        memberEmail={reservation.member.email}
        villa={reservation.villa}
        arrivalDate={reservation.arrival_date}
        departureDate={reservation.departure_date}
      />
      <ProposalsTable proposals={proposals} />
    </>
  );
}

export default function ConciergeDashboardPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-8">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}
