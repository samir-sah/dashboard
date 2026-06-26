"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
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
          className="mt-4 text-indigo-600 font-medium hover:text-indigo-700 text-sm"
        >
          ← Back to Tickets
        </button>
      </div>
    );
  }

  if (ticketQuery.isLoading || !ticketQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading ticket details...</p>
      </div>
    );
  }

  const ticket = ticketQuery.data;

  return (
    <div className="max-w-[1400px] w-full pb-10">
      <button 
        onClick={() => router.push('/support')}
        className="flex items-center gap-2 text-[14px] text-indigo-600 font-medium hover:text-indigo-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </button>

      <TicketHeaderCard ticket={ticket} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (65% width approx) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <IssueDetailsCard ticket={ticket} />
          <ActivityTimeline timeline={ticket.timeline} />
        </div>

        {/* Right Column (35% width approx) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <CustomerInfoCard customer={ticket.customer} />
          <DeviceInfoCard device={ticket.device} />
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
    </div>
  );
}
