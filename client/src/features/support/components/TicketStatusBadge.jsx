import { Badge } from "@/components/ui/Badge";

export default function TicketStatusBadge({ status }) {
  const getStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-transparent";
      case "in progress":
        return "bg-brand-100 text-brand-900 hover:bg-brand-100 border-transparent";
      case "resolved":
        return "bg-brand-100 text-brand-900 hover:bg-brand-100 border-transparent";
      case "closed":
        return "bg-surface-elevated text-foreground hover:bg-surface-elevated border-transparent";
      default:
        return "bg-surface-elevated text-foreground hover:bg-surface-elevated border-transparent";
    }
  };

  return (
    <Badge className={getStyles(status)} variant="outline">
      {status?.toUpperCase() || "UNKNOWN"}
    </Badge>
  );
}
