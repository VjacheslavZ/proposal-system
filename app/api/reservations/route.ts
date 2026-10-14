import { connection, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-errors";
import { getCurrentReservation } from "@/lib/services/reservations";

export const GET = withErrorHandling(async () => {
  await connection(); // always read fresh data instead of prerendering
  return NextResponse.json(await getCurrentReservation());
});
