import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-errors";
import { getCurrentReservation } from "@/lib/services/reservations";

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await getCurrentReservation());
});
