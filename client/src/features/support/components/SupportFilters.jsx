import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";

export default function SupportFilters({ 
  searchQuery, 
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="p-4 border-b border-border flex flex-wrap items-center gap-4 justify-between bg-white">
      <div className="relative flex-1 min-w-[200px] lg:max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search size={15} className="text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Ticket ID, Customer, Device..."
          className={cn(
            "h-10 w-full rounded-xl border border-border bg-background pl-9 pr-4 text-[13.5px] text-foreground shadow-xs transition-all",
            "outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-500/10",
            "placeholder:text-muted-foreground"
          )}
        />
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative min-w-[140px]">
          <span className="absolute -top-1.5 left-3 px-1 bg-white text-[9px] font-bold uppercase tracking-wider text-muted-foreground z-10 pointer-events-none">
            Status
          </span>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="h-10 text-[13.5px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative min-w-[140px]">
          <span className="absolute -top-1.5 left-3 px-1 bg-white text-[9px] font-bold uppercase tracking-wider text-muted-foreground z-10 pointer-events-none">
            Priority
          </span>
          <Select value={priorityFilter} onValueChange={onPriorityChange}>
            <SelectTrigger className="h-10 text-[13.5px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative min-w-[160px]">
          <span className="absolute -top-1.5 left-3 px-1 bg-white text-[9px] font-bold uppercase tracking-wider text-muted-foreground z-10 pointer-events-none">
            Sort
          </span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-10 text-[13.5px]">
              <SelectValue placeholder="Sort tickets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated-desc">Recently Updated</SelectItem>
              <SelectItem value="updated-asc">Least Recently Updated</SelectItem>
              <SelectItem value="created-desc">Newest Created</SelectItem>
              <SelectItem value="created-asc">Oldest Created</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
