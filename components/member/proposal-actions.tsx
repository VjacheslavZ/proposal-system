"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { ProposalStatus } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

/** The next step the member can take for each status. */
const ACTIONS: Partial<Record<ProposalStatus, { label: string; next: ProposalStatus; hint: string }>> = {
  sent: {
    label: "Approve",
    next: "approved",
    hint: "Approve the itinerary to continue to payment.",
  },
  approved: {
    label: "Pay & Lock In",
    next: "paid",
    hint: "Itinerary approved. Complete payment to secure every reservation.",
  },
};

export function ProposalActions({ proposalId, status }: { proposalId: string; status: ProposalStatus }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const action = ACTIONS[status];
  if (!action) return null;

  async function submit(next: ProposalStatus) {
    setPending(true);
    try {
      await apiRequest(`/api/proposals/${proposalId}`, { method: "PATCH", body: { status: next } });
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="text-center">
      <p className="text-sm text-stone-600">{action.hint}</p>
      <Button
        disabled={pending}
        onClick={() => submit(action.next)}
        className="mt-5 h-12 rounded-full bg-stone-900 px-10 text-sm tracking-[0.2em] text-stone-50 uppercase hover:bg-stone-800"
      >
        {pending ? "One moment…" : action.label}
      </Button>
    </div>
  );
}
