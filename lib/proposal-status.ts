import { ProposalStatus } from "@/generated/prisma/enums";

/** A proposal only moves forward one step at a time: draft → sent → approved → paid. */
const NEXT_STATUS: Record<ProposalStatus, ProposalStatus | null> = {
  draft: ProposalStatus.sent,
  sent: ProposalStatus.approved,
  approved: ProposalStatus.paid,
  paid: null,
};

export function canTransition(from: ProposalStatus, to: ProposalStatus): boolean {
  return NEXT_STATUS[from] === to;
}
