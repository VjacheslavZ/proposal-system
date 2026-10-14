import { NextResponse } from "next/server";
import { readJson, withErrorHandling } from "@/lib/api-errors";
import { getProposal, updateProposalStatus } from "@/lib/services/proposals";
import { updateProposalStatusSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_request: Request, { params }: Params) => {
  const { id } = await params;
  return NextResponse.json(await getProposal(id));
});

export const PATCH = withErrorHandling(async (request: Request, { params }: Params) => {
  const { id } = await params;
  const { status } = updateProposalStatusSchema.parse(await readJson(request));
  return NextResponse.json(await updateProposalStatus(id, status));
});
