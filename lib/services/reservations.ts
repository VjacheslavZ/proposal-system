import { notFound } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";

/** The member's next upcoming (or ongoing) reservation. */
export async function getCurrentReservation() {
  const reservation = await prisma.reservation.findFirst({
    where: { departure_date: { gte: new Date() } },
    orderBy: { arrival_date: "asc" },
    include: { member: true },
  });
  if (!reservation) throw notFound("No upcoming reservation found");
  return reservation;
}

export type CurrentReservation = Awaited<ReturnType<typeof getCurrentReservation>>;
