import { z } from "zod";
import { Category, ProposalStatus } from "@/generated/prisma/enums";

export const proposalItemInputSchema = z.object({
  category: z.enum(Category),
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(1000).default(""),
  scheduled_at: z.iso.datetime({ offset: true }),
  /** Price in USD cents. */
  price: z.int().min(0),
});

export const createProposalSchema = z.object({
  reservation_id: z.string().min(1),
  items: z.array(proposalItemInputSchema).min(1, "Add at least one item"),
});

/** Draft is the initial state, so it cannot be set through an update. */
export const updateProposalStatusSchema = z.object({
  status: z.enum([ProposalStatus.sent, ProposalStatus.approved, ProposalStatus.paid]),
});

export type ProposalItemInput = z.infer<typeof proposalItemInputSchema>;
export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type UpdateProposalStatusInput = z.infer<typeof updateProposalStatusSchema>;
