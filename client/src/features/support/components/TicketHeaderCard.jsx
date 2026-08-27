import { Card, CardContent } from "@/components/ui/Card";
import { FileText } from "lucide-react";
import TicketStatusBadge from "./TicketStatusBadge";
import TicketPriorityBadge from "./TicketPriorityBadge";

export default function TicketHeaderCard({ ticket }) {
  if (!ticket) return null;

  return (
    <Card className="mb-6 border border-gray-200 shadow-sm rounded-xl overflow-hidden">
      <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Side: Icon + Title + Dates */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <FileText className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{ticket.id}</h1>
            <div className="flex flex-col text-sm text-gray-500 gap-0.5">
              <span>Created on {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() : '-'}</span>
              <span>Last updated {ticket.updatedAt}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Meta Grid */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-8 md:gap-12">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
            <TicketStatusBadge status={ticket.status} />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Priority</span>
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
          
          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Assigned To</span>
            <span className="text-[15px] font-medium text-gray-900">{ticket.assignedEngineer}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Due Date</span>
            <span className="text-[15px] font-medium text-gray-900">
              {ticket.dueDate ? new Date(ticket.dueDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() : '-'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
