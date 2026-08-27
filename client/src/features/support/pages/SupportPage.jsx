"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import SupportStats from "../components/SupportStats";
import SupportFilters from "../components/SupportFilters";
import TicketsTable from "../components/TicketsTable";
import CreateTicketDialog from "../components/CreateTicketDialog";
import { createTicket, getSupportStats, getTickets } from "../services/supportService";

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("updated-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const sortParams = sortBy === "updated-asc"
    ? { sortBy: "updatedAt", sortOrder: "asc" }
    : sortBy === "created-desc"
      ? { sortBy: "createdAt", sortOrder: "desc" }
      : sortBy === "created-asc"
        ? { sortBy: "createdAt", sortOrder: "asc" }
        : { sortBy: "updatedAt", sortOrder: "desc" };

  const { data: stats } = useQuery({
    queryKey: ["support", "stats"],
    queryFn: getSupportStats,
  });

  const {
    data: ticketsResult,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["support", "tickets", currentPage, searchQuery, statusFilter, priorityFilter, sortBy],
    queryFn: () =>
      getTickets({
        page: currentPage,
        limit: 10,
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        ...sortParams,
      }),
    placeholderData: (previousData) => previousData,
  });

  const resetPage = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const tickets = ticketsResult?.tickets || [];
  const totalPages = ticketsResult?.pages || 1;
  const totalItems = ticketsResult?.total || 0;

  const createMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: async () => {
      setCreateOpen(false);
      setCurrentPage(1);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["support", "tickets"] }),
        queryClient.invalidateQueries({ queryKey: ["support", "stats"] }),
      ]);
    },
  });

  return (
    <div className="max-w-[1400px] w-full pb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Support</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage customer support tickets and device-related issues
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-brand-700 hover:bg-brand-800 text-white gap-2">
          <Plus size={16} />
          Create Ticket
        </Button>
      </div>

      <SupportStats stats={stats} />

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
        <SupportFilters 
          searchQuery={searchQuery}
          onSearchChange={resetPage(setSearchQuery)}
          statusFilter={statusFilter}
          onStatusChange={resetPage(setStatusFilter)}
          priorityFilter={priorityFilter}
          onPriorityChange={resetPage(setPriorityFilter)}
          sortBy={sortBy}
          onSortChange={resetPage(setSortBy)}
        />
        {error ? (
          <div className="p-4 text-sm text-red-600 border-b border-red-100 bg-red-50">
            {error.message || "Failed to load support tickets"}
          </div>
        ) : null}
        <TicketsTable 
          tickets={tickets} 
          loading={isLoading || isFetching}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>

      <CreateTicketDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(payload) => createMutation.mutateAsync(payload)}
        isPending={createMutation.isPending}
        error={createMutation.error?.message}
      />
    </div>
  );
}
