import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import TicketStatusBadge from "./TicketStatusBadge";
import TicketPriorityBadge from "./TicketPriorityBadge";

export default function IssueDetailsCard({ ticket }) {
  if (!ticket) return null;

  return (
    <Card className="mb-6 shadow-sm border border-gray-200">
      <CardHeader className="pb-4 pt-6 px-6">
        <CardTitle className="text-[17px] font-bold text-gray-900">Issue Details</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-7">
        
        {/* Title and Description */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Issue Title</h3>
          <p className="text-[15px] font-medium text-gray-900 mb-4">{ticket.subject || ticket.issue}</p>
          
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
          <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-4">
            <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.issue}</p>
          </div>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Category</span>
            <span className="text-[15px] font-medium text-gray-900">{ticket.category}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Priority</span>
            <div><TicketPriorityBadge priority={ticket.priority} /></div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
            <div><TicketStatusBadge status={ticket.status} /></div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Source</span>
            <span className="text-[15px] font-medium text-gray-900">{ticket.source || "-"}</span>
          </div>
        </div>

        {/* Assignment & Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Assigned Engineer</h3>
            <div className="bg-gray-50/50 border border-gray-200 rounded-lg p-3 text-[14px] text-gray-500">
              {ticket.assignedEngineer}
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Resolution Notes</h3>
            <div className="bg-gray-50/50 border border-gray-200 rounded-lg p-3 text-[14px] text-gray-500">
              {ticket.resolutionNotes || "-"}
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
