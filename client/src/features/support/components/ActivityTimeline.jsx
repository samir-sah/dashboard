import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { FileText, UserPlus, Info, MessageSquare, CheckCircle2 } from "lucide-react";

export default function ActivityTimeline({ timeline }) {
  if (!timeline || !timeline.length) return null;

  const getIconForAction = (action) => {
    const act = action.toLowerCase();
    if (act.includes('created')) return <FileText className="w-4 h-4 text-white" />;
    if (act.includes('assign')) return <UserPlus className="w-4 h-4 text-gray-500" />;
    if (act.includes('status')) return <Info className="w-4 h-4 text-white" />;
    if (act.includes('comment') || act.includes('troubleshooting')) return <MessageSquare className="w-4 h-4 text-gray-500" />;
    if (act.includes('resolv')) return <CheckCircle2 className="w-4 h-4 text-gray-500" />;
    return <Info className="w-4 h-4 text-gray-500" />;
  };

  const getIconBgClass = (action) => {
    const act = action.toLowerCase();
    if (act.includes('created') || act.includes('status')) return "bg-indigo-500 ring-4 ring-indigo-50";
    return "bg-gray-100 ring-4 ring-white border border-gray-200";
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-4 pt-6 px-6">
        <CardTitle className="text-[17px] font-bold text-gray-900">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="relative border-l-2 border-gray-100 ml-[15px] space-y-8 pb-2">
          {timeline.map((item, index) => {
            return (
              <div key={item.id} className="relative pl-8 pr-2 flex justify-between group">
                <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconBgClass(item.action)} z-10`}>
                  {getIconForAction(item.action)}
                </div>
                
                <div className="flex flex-col flex-1 min-w-0 pr-4">
                  <span className="text-[14px] font-bold text-gray-900 mb-1">{item.action}</span>
                  <span className="text-[13px] text-gray-500 leading-snug break-words">
                    {item.description || "-"}
                  </span>
                </div>

                <div className="flex-shrink-0 text-right min-w-[120px] pt-0.5">
                  <span className="text-[12px] font-medium text-gray-500">
                    {item.date ? new Date(item.date).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                    }).toUpperCase() : "-"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
