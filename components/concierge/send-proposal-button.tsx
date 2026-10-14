"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

export function SendProposalButton({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function send() {
    startTransition(async () => {
      try {
        await apiRequest(`/api/proposals/${proposalId}/send`, { method: "POST" });
        toast.success("Proposal sent");
        router.refresh();
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }

  return (
    <Button size="sm" disabled={pending} onClick={send}>
      <Send aria-hidden />
      Send
    </Button>
  );
}
