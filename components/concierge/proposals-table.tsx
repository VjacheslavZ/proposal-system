import { ExternalLink, Eye } from "lucide-react";
import Link from "next/link";
import { SendProposalButton } from "@/components/concierge/send-proposal-button";
import { ItineraryDialog } from "@/components/proposal/itinerary-dialog";
import { StatusBadge } from "@/components/proposal/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatDateRange, formatPrice } from "@/lib/format";
import type { ProposalListItem } from "@/lib/services/proposals";

function DateTimeCell({ value }: { value: Date }) {
  return (
    <>
      <div>{formatDate(value)}</div>
      <div className="text-muted-foreground">{formatDate(value, { timeStyle: "short" })}</div>
    </>
  );
}

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
                <TableHead>Destination</TableHead>
                <TableHead>Arrival – departure</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell>
                    <div>{proposal.reservation.villa}</div>
                    <div className="text-muted-foreground">{proposal.reservation.destination}</div>
                  </TableCell>
                  <TableCell>
                    {formatDateRange(proposal.reservation.arrival_date, proposal.reservation.departure_date)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={proposal.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <div>{formatPrice(proposal.total)}</div>
                    <div className="text-muted-foreground">
                      {proposal.item_count} {proposal.item_count === 1 ? "item" : "items"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DateTimeCell value={proposal.created_at} />
                  </TableCell>
                  <TableCell>{proposal.sent_at ? <DateTimeCell value={proposal.sent_at} /> : "—"}</TableCell>
                  <TableCell className="space-x-2 text-right whitespace-nowrap">
                    <ItineraryDialog
                      trigger={
                        <Button size="sm" variant="outline">
                          <Eye aria-hidden />
                          View
                        </Button>
                      }
                      title={`Proposal for ${proposal.reservation.member.name}`}
                      description={`${proposal.reservation.villa} · ${proposal.status}`}
                      items={proposal.items}
                      total={proposal.total}
                    />
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
