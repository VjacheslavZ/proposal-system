import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-errors";
import { sendProposal } from "@/lib/services/proposals";

export const POST = withErrorHandling(async (_request: Request, ctx: RouteContext<"/api/proposals/[id]/send">) => {
  const { id } = await ctx.params;
  return NextResponse.json(await sendProposal(id));
});
