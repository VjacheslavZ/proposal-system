import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { SendProposalButton } from "@/components/concierge/send-proposal-button";
import { StatusBadge } from "@/components/proposal/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { ProposalListItem } from "@/lib/services/proposals";

export function ProposalsTable({ proposals }: { proposals: ProposalListItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposals</CardTitle>
      </CardHeader>
      <CardContent>
        {proposals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No proposals yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell>{formatDateTime(proposal.created_at)}</TableCell>
                  <TableCell>
                    <StatusBadge status={proposal.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{proposal.item_count}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(proposal.total)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {proposal.sent_at ? formatDateTime(proposal.sent_at) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {proposal.status === "draft" ? (
                      <SendProposalButton proposalId={proposal.id} />
                    ) : (
                      <Link
                        href={`/proposal/${proposal.id}`}
                        target="_blank"
                        className={buttonVariants({ size: "sm", variant: "outline" })}
                      >
                        Member view
                        <ExternalLink aria-hidden />
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
