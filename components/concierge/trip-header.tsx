import { CalendarDays, MapPin } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { CurrentReservation } from "@/lib/services/reservations";

const DAY_MS = 24 * 60 * 60 * 1000;

export function TripHeader({ reservation }: { reservation: CurrentReservation }) {
  const nights = Math.round((reservation.departure_date.getTime() - reservation.arrival_date.getTime()) / DAY_MS);

  return (
    <header className="rounded-xl border bg-card p-6">
      <p className="text-sm text-muted-foreground">
        Upcoming trip · {reservation.member.name} · {reservation.member.email}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{reservation.villa}</h1>
      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <span className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" aria-hidden />
          {reservation.destination}
        </span>
        <span className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
          <span>
            Arrive <strong>{formatDate(reservation.arrival_date, { dateStyle: "full" })}</strong>
          </span>
          <span className="text-muted-foreground">→</span>
          <span>
            Depart <strong>{formatDate(reservation.departure_date, { dateStyle: "full" })}</strong>
          </span>
        </span>
        <span className="text-muted-foreground">{nights} nights</span>
      </div>
    </header>
  );
}
