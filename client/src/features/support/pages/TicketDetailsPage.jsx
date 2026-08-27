"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Separator } from "@/components/ui/separator";
import TicketHeaderCard from "../components/TicketHeaderCard";
import IssueDetailsCard from "../components/IssueDetailsCard";
import CustomerInfoCard from "../components/CustomerInfoCard";
import DeviceInfoCard from "../components/DeviceInfoCard";
import TicketActionsCard from "../components/TicketActionsCard";
import ActivityTimeline from "../components/ActivityTimeline";
import {
  addTicketNote,
  assignTicket,
  getSupportEngineers,
  getTicketById,
  resolveTicket,
  updateTicketStatus,
} from "../services/supportService";

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.ticketId;
  const queryClient = useQueryClient();

  const ticketQuery = useQuery({
    queryKey: ["support", "ticket", ticketId],
    queryFn: () => getTicketById(ticketId),
    enabled: Boolean(ticketId),
  });

  const engineersQuery = useQuery({
    queryKey: ["support", "engineers"],
    queryFn: getSupportEngineers,
  });

  const refreshTicket = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["support", "ticket", ticketId] }),
      queryClient.invalidateQueries({ queryKey: ["support", "tickets"] }),
      queryClient.invalidateQueries({ queryKey: ["support", "stats"] }),
    ]);
  };

  const assignMutation = useMutation({
    mutationFn: (assignedTo) => assignTicket(ticketId, assignedTo),
    onSuccess: refreshTicket,
  });

  const statusMutation = useMutation({
    mutationFn: (payload) => updateTicketStatus(ticketId, payload),
    onSuccess: refreshTicket,
  });

  const noteMutation = useMutation({
    mutationFn: (description) => addTicketNote(ticketId, description),
    onSuccess: refreshTicket,
  });

  const resolveMutation = useMutation({
    mutationFn: (resolutionNotes) => resolveTicket(ticketId, resolutionNotes),
    onSuccess: refreshTicket,
  });

  const actionError =
    assignMutation.error ||
    statusMutation.error ||
    noteMutation.error ||
    resolveMutation.error;

  if (ticketQuery.error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-500 font-medium">Failed to load ticket</p>
        <p className="mt-2 text-muted-foreground text-sm">{ticketQuery.error.message}</p>
        <button
          onClick={() => router.push('/support')}
          className="mt-4 text-brand-700 font-medium hover:text-brand-800 text-sm"
        >
          ← Back to Tickets
        </button>
      </div>
    );
  }

  if (ticketQuery.isLoading || !ticketQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading ticket details...</p>
      </div>
    );
  }

  const ticket = ticketQuery.data;

  return (
    <div className="max-w-[1400px] w-full pb-10">
      <button 
        onClick={() => router.push('/support')}
        className="flex items-center gap-2 text-[14px] text-brand-700 font-medium hover:text-brand-800 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </button>

      <TicketHeaderCard ticket={ticket} />

      <Tabs defaultValue="issue">
        {/* Tab bar + content in a 2-column grid: tabs on left, actions always visible on right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
          
          {/* Left: Tab bar + tab content */}
          <div>
            <div className="bg-background rounded-t-2xl border border-b-0 px-5">
              <TabsList className="bg-transparent h-auto p-0 gap-0 rounded-none">
                {[
                  ['issue', 'Issue Details'],
                  ['customer', 'Customer & Device'],
                  ['timeline', 'Activity Timeline'],
                ].map(([key, label]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="px-5 py-3.5 text-sm bg-transparent shadow-none rounded-none border-b-2 -mb-px data-[state=active]:text-brand-700 data-[state=active]:border-brand-700 data-[state=active]:font-semibold data-[state=active]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-transparent"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <Separator className="mb-5" />

            <TabsContent value="issue" className="mt-0">
              <IssueDetailsCard ticket={ticket} />
            </TabsContent>

            <TabsContent value="customer" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CustomerInfoCard customer={ticket.customer} />
                <DeviceInfoCard device={ticket.device} />
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <ActivityTimeline timeline={ticket.timeline} />
            </TabsContent>
          </div>

          {/* Right: Ticket Actions — always visible */}
          <div className="sticky top-6">
            <TicketActionsCard
              ticket={ticket}
              engineers={engineersQuery.data || []}
              onAssign={(assignedTo) => assignMutation.mutateAsync(assignedTo)}
              onMarkInProgress={() => statusMutation.mutateAsync({ status: "In Progress" })}
              onAddNote={(description) => noteMutation.mutateAsync(description)}
              onResolve={(resolutionNotes) => resolveMutation.mutateAsync(resolutionNotes)}
              onClose={(payload) => statusMutation.mutateAsync({ status: "Closed", ...payload })}
              isPending={
                assignMutation.isPending ||
                statusMutation.isPending ||
                noteMutation.isPending ||
                resolveMutation.isPending
              }
              error={actionError?.message}
            />
          </div>
        </div>
      </Tabs>
    </div>
  );
}
