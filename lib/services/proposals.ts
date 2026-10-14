import type { Prisma } from "@/generated/prisma/client";
import { ProposalStatus } from "@/generated/prisma/enums";
import { ApiError, notFound } from "@/lib/api-errors";
import { formatDate, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { canTransition } from "@/lib/proposal-status";
import type { CreateProposalInput } from "@/lib/validation";

const DAY_MS = 24 * 60 * 60 * 1000;
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

const proposalInclude = {
  items: { orderBy: { scheduled_at: "asc" } },
  reservation: { include: { member: true } },
} as const;

function sumPrices(items: { price: number }[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}

export async function createProposal(input: CreateProposalInput) {
  const reservation = await prisma.reservation.findUnique({ where: { id: input.reservation_id } });
  if (!reservation) throw notFound("Reservation not found");

  // Items must fall within the stay; the departure day itself is included.
  const stayEnd = reservation.departure_date.getTime() + DAY_MS;
  const outsideStay = input.items.find(({ scheduled_at }) => {
    const time = new Date(scheduled_at).getTime();
    return time < reservation.arrival_date.getTime() || time >= stayEnd;
  });
  if (outsideStay) {
    throw new ApiError(400, "VALIDATION_ERROR", `"${outsideStay.title}" is scheduled outside the reservation dates`);
  }

  return prisma.proposal.create({
    data: {
      reservation_id: reservation.id,
      items: {
        create: input.items.map((item) => ({ ...item, scheduled_at: new Date(item.scheduled_at) })),
      },
    },
    include: proposalInclude,
  });
}

export async function listProposals() {
  const proposals = await prisma.proposal.findMany({
    orderBy: { created_at: "desc" },
    include: { items: { select: { price: true } } },
  });
  return proposals.map(({ items, ...proposal }) => ({
    ...proposal,
    item_count: items.length,
    total: sumPrices(items),
  }));
}

export async function getProposal(id: string) {
  const proposal = await prisma.proposal.findUnique({ where: { id }, include: proposalInclude });
  if (!proposal) throw notFound("Proposal not found");
  return { ...proposal, total: sumPrices(proposal.items) };
}

export type ProposalListItem = Awaited<ReturnType<typeof listProposals>>[number];
export type ProposalDetails = Awaited<ReturnType<typeof getProposal>>;

/**
 * Moves a proposal to the next status. The `where` clause includes the current status,
 * so two concurrent requests cannot both apply the same transition.
 */
async function transition(
  db: Prisma.TransactionClient,
  id: string,
  to: ProposalStatus,
  extraData: { sent_at?: Date } = {},
) {
  const proposal = await db.proposal.findUnique({ where: { id }, select: { status: true } });
  if (!proposal) throw notFound("Proposal not found");

  const invalid = new ApiError(409, "INVALID_STATUS_TRANSITION", `Cannot change status from "${proposal.status}" to "${to}"`);
  if (!canTransition(proposal.status, to)) throw invalid;

  const { count } = await db.proposal.updateMany({
    where: { id, status: proposal.status },
    data: { status: to, ...extraData },
  });
  if (count === 0) throw invalid;
}

/** Marks a draft as sent and records the simulated email. */
export async function sendProposal(id: string) {
  const proposal = await getProposal(id);
  const { reservation } = proposal;
  const link = `${APP_URL}/proposal/${proposal.id}`;
  const bodyPreview = [
    `Dear ${reservation.member.name}, your personal itinerary for ${reservation.villa}`,
    `(${formatDate(reservation.arrival_date)} – ${formatDate(reservation.departure_date)}) is ready:`,
    `${proposal.items.length} ${proposal.items.length === 1 ? "experience" : "experiences"},`,
    `${formatPrice(proposal.total)} total. Review it here: ${link}`,
  ].join(" ");

  await prisma.$transaction(async (tx) => {
    await transition(tx, id, ProposalStatus.sent, { sent_at: new Date() });
    await tx.sentEmail.create({
      data: { proposal_id: id, to_email: reservation.member.email, body_preview: bodyPreview },
    });
  });

  console.log(`[email] To: ${reservation.member.email}\n${bodyPreview}`);
  return getProposal(id);
}

/** Applies a status change requested by the client. Sending goes through `sendProposal`. */
export async function updateProposalStatus(id: string, status: ProposalStatus) {
  if (status === ProposalStatus.sent) return sendProposal(id);
  await transition(prisma, id, status);
  return getProposal(id);
}
