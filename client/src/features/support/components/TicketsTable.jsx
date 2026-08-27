import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import TicketStatusBadge from "./TicketStatusBadge";
import TicketPriorityBadge from "./TicketPriorityBadge";

export default function TicketsTable({
  tickets,
  loading = false,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) {
  const router = useRouter();

  const handleRowClick = (id) => {
    router.push(`/support/${id}`);
  };

  return (
    <div className="bg-white rounded-b-xl overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold text-left pl-4">TICKET ID</TableHead>
              <TableHead className="font-semibold">ISSUE</TableHead>
              <TableHead className="font-semibold">CUSTOMER</TableHead>
              <TableHead className="font-semibold text-center">PRIORITY</TableHead>
              <TableHead className="font-semibold text-center">STATUS</TableHead>
              <TableHead className="font-semibold text-center">UPDATED AT</TableHead>
              <TableHead className="font-semibold text-center">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Loading tickets...
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No tickets found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow 
                  key={ticket.id} 
                  className="cursor-pointer group"
                  onClick={() => handleRowClick(ticket.id)}
                >
                  <TableCell className="p-4 pl-4 font-medium text-indigo-600">
                    {ticket.id}
                  </TableCell>
                  <TableCell className="p-4 text-foreground max-w-[400px] truncate" title={ticket.subject}>
                    {ticket.subject}
                  </TableCell>
                  <TableCell className="p-4 text-muted-foreground">
                    {ticket.customer.name}
                  </TableCell>
                  <TableCell className="p-4 text-center">
                    <TicketPriorityBadge priority={ticket.priority} />
                  </TableCell>
                  <TableCell className="p-4 text-center">
                    <TicketStatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell className="p-4 text-sm text-muted-foreground text-center">
                    {ticket.updatedAt}
                  </TableCell>
                  <TableCell className="p-4 text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1 bg-transparent hover:bg-muted font-medium text-xs rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(ticket.id);
                      }}
                    >
                      View Details <ChevronRight className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination UI */}
      {totalItems > 0 && (
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing <span className="font-medium text-foreground">{(currentPage - 1) * 10 + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * 10, totalItems)}</span> of <span className="font-medium text-foreground">{totalItems}</span> tickets
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="w-8 h-8 rounded-md"
            >
              <ChevronLeft className="size-4" />
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .map(pageNum => (
                <Button 
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"} 
                  size="icon" 
                  className={`w-8 h-8 rounded-md ${currentPage === pageNum ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}`}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              ))
            }

            <Button 
              variant="outline" 
              size="icon" 
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className="w-8 h-8 rounded-md"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
