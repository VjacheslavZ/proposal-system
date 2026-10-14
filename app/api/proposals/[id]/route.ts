import { NextResponse } from "next/server";
import { readJson, withErrorHandling } from "@/lib/api-errors";
import { getProposal, updateProposalStatus } from "@/lib/services/proposals";
import { updateProposalStatusSchema } from "@/lib/validation";

export const GET = withErrorHandling(async (_request: Request, ctx: RouteContext<"/api/proposals/[id]">) => {
  const { id } = await ctx.params;
  return NextResponse.json(await getProposal(id));
});

export const PATCH = withErrorHandling(async (request: Request, ctx: RouteContext<"/api/proposals/[id]">) => {
  const { id } = await ctx.params;
  const { status } = updateProposalStatusSchema.parse(await readJson(request));
  return NextResponse.json(await updateProposalStatus(id, status));
});
