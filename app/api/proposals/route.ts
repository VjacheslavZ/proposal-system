import { connection, NextResponse } from "next/server";
import { readJson, withErrorHandling } from "@/lib/api-errors";
import { createProposal, listProposals } from "@/lib/services/proposals";
import { createProposalSchema } from "@/lib/validation";

export const GET = withErrorHandling(async () => {
  await connection(); // always read fresh data instead of prerendering
  return NextResponse.json(await listProposals());
});

export const POST = withErrorHandling(async (request: Request) => {
  const input = createProposalSchema.parse(await readJson(request));
  return NextResponse.json(await createProposal(input), { status: 201 });
});
