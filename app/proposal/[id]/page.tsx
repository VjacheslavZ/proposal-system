import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PaidConfirmation } from "@/components/member/paid-confirmation";
import { ProposalActions } from "@/components/member/proposal-actions";
import { ProposalHero } from "@/components/member/proposal-hero";
import { Itinerary } from "@/components/proposal/itinerary";
import { ApiError } from "@/lib/api-errors";
import { formatPrice } from "@/lib/format";
import { getProposal } from "@/lib/services/proposals";

type Params = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Your itinerary · Exclusive Resorts" };

async function findSentProposal(id: string) {
  try {
    const proposal = await getProposal(id);
    // Drafts are internal to the concierge team.
    return proposal.status === "draft" ? null : proposal;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

async function MemberProposal({ params }: Params) {
  const { id } = await params;
  const proposal = await findSentProposal(id);
  if (!proposal) notFound();

  const itinerary = (
    <section className="rounded-3xl border border-stone-200 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-10">
      <h2 className="mb-8 text-center text-xs tracking-[0.3em] text-stone-500 uppercase">Your itinerary</h2>
      <Itinerary items={proposal.items} />
      <div className="mt-10 flex items-baseline justify-between border-t border-stone-200 pt-6">
        <span className="text-xs tracking-[0.3em] text-stone-500 uppercase">Total</span>
        <span className="font-serif text-4xl text-stone-900 tabular-nums">{formatPrice(proposal.total)}</span>
      </div>
    </section>
  );

  if (proposal.status === "paid") {
    return (
      <>
        <PaidConfirmation proposal={proposal} />
        {itinerary}
      </>
    );
  }

  return (
    <>
      <ProposalHero reservation={proposal.reservation} />
      {itinerary}
      <ProposalActions proposalId={proposal.id} status={proposal.status} />
    </>
  );
}

export default function MemberProposalPage({ params }: Params) {
  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 via-amber-50/50 to-stone-100">
      <main className="mx-auto max-w-3xl space-y-12 px-4 py-16 sm:px-6 sm:py-24">
        <Suspense fallback={<p className="text-center font-serif text-xl text-stone-500 italic">Preparing your itinerary…</p>}>
          <MemberProposal params={params} />
        </Suspense>
      </main>
    </div>
  );
}
