import { Badge } from "@/components/ui/Badge";

export default function TicketPriorityBadge({ priority }) {
  const getStyles = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-200 border-transparent";
      case "medium":
      case "med":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent";
      case "low":
        return "bg-surface-elevated text-foreground hover:bg-surface-elevated border-transparent";
      default:
        return "bg-surface-elevated text-foreground hover:bg-surface-elevated border-transparent";
    }
  };

  const getLabel = (priority) => {
    if (!priority) return "UNKNOWN";
    const p = priority.toLowerCase();
    if (p === "medium" || p === "med") return "MED";
    return p.toUpperCase();
  };

  return (
    <Badge className={getStyles(priority)} variant="outline">
      {getLabel(priority)}
    </Badge>
  );
}
