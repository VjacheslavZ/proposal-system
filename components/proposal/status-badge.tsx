import type { ProposalStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ProposalStatus, string> = {
  draft: "bg-stone-100 text-stone-700",
  sent: "bg-sky-100 text-sky-800",
  approved: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return <Badge className={cn("capitalize", STATUS_STYLES[status])}>{status}</Badge>;
}
