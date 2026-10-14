import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-errors";
import { sendProposal } from "@/lib/services/proposals";

type Params = { params: Promise<{ id: string }> };

export const POST = withErrorHandling(async (_request: Request, { params }: Params) => {
  const { id } = await params;
  return NextResponse.json(await sendProposal(id));
});
