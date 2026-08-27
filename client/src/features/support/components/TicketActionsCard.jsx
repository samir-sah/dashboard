import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserPlus, Clock, CheckCircle2, X, MessageSquare } from "lucide-react";

const closeReasons = ["Duplicate", "Spam", "Created by Mistake", "Other"];

export default function TicketActionsCard({
  ticket,
  engineers,
  onAssign,
  onMarkInProgress,
  onAddNote,
  onResolve,
  onClose,
  isPending,
  error,
}) {
  const [assignedTo, setAssignedTo] = useState("");
  const [note, setNote] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [closeReason, setCloseReason] = useState("Duplicate");
  const [closeNote, setCloseNote] = useState("");

  const canStart = ticket.status === "Open";
  const canResolve = ticket.status === "In Progress";
  const canClose = ticket.status !== "Closed";
  const canExceptionClose = ticket.status === "Open" || ticket.status === "In Progress";

  const submitAssign = async (event) => {
    event.preventDefault();
    await onAssign(assignedTo.trim());
    setAssignedTo("");
  };

  const submitNote = async (event) => {
    event.preventDefault();
    await onAddNote(note.trim());
    setNote("");
  };

  const submitResolve = async (event) => {
    event.preventDefault();
    await onResolve(resolutionNotes.trim());
    setResolutionNotes("");
  };

  const submitClose = async (event) => {
    event.preventDefault();
    const payload = canExceptionClose
      ? { reason: closeReason, note: closeReason === "Other" ? closeNote.trim() : undefined }
      : {};
    await onClose(payload);
    setCloseNote("");
  };

  return (
    <Card>
      <CardHeader className="pb-4 pt-6 px-6">
        <CardTitle className="text-[17px] font-semibold text-ink">Ticket Actions</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-5">
        {error ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={submitAssign} className="space-y-2">
          <label className="text-[11px] font-semibold text-faint uppercase">
            Assign Engineer
          </label>
          <div className="flex gap-2">
            <select
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
              className="h-9 min-w-0 flex-1 rounded-full border border-border bg-card px-3 text-sm outline-none focus:border-brand-300 focus:ring-3 focus:ring-ring/30"
            >
              <option value="">Select engineer</option>
              {engineers.map((engineer) => (
                <option key={engineer.id} value={engineer.id}>{engineer.name}</option>
              ))}
            </select>
            <Button type="submit" disabled={isPending || !assignedTo.trim()}>
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending || !canStart}
            onClick={onMarkInProgress}
            className="gap-2 w-full justify-start text-brand-700 border-brand-100 hover:bg-brand-50"
          >
            <Clock className="w-4 h-4" /> Mark In Progress
          </Button>
        </div>

        <form onSubmit={submitResolve} className="space-y-2">
          <label className="text-[11px] font-semibold text-faint uppercase">
            Resolution Notes
          </label>
          <textarea
            value={resolutionNotes}
            onChange={(event) => setResolutionNotes(event.target.value)}
            rows={3}
            placeholder="Required to resolve"
            className="w-full rounded-[1.1rem] border border-border bg-card px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-3 focus:ring-ring/30"
          />
          <Button
            type="submit"
            variant="outline"
            disabled={isPending || !canResolve || !resolutionNotes.trim()}
            className="gap-2 w-full text-brand-700 border-brand-100 hover:bg-brand-50"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark Resolved
          </Button>
        </form>

        <form onSubmit={submitClose} className="space-y-2">
          <label className="text-[11px] font-semibold text-faint uppercase">
            Close Ticket
          </label>
          {canExceptionClose ? (
            <>
              <select
                value={closeReason}
                onChange={(event) => setCloseReason(event.target.value)}
                className="h-9 w-full rounded-full border border-border bg-card px-3 text-sm outline-none focus:border-brand-300 focus:ring-3 focus:ring-ring/30"
              >
                {closeReasons.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
              {closeReason === "Other" ? (
                <Input
                  value={closeNote}
                  onChange={(event) => setCloseNote(event.target.value)}
                  placeholder="Short note"
                  className="h-9"
                />
              ) : null}
            </>
          ) : null}
          <Button
            type="submit"
            variant="outline"
            disabled={isPending || !canClose || (closeReason === "Other" && !closeNote.trim())}
            className="gap-2 w-full text-foreground border-border hover:bg-brand-50"
          >
            <X className="w-4 h-4" /> Close Ticket
          </Button>
        </form>

        <form onSubmit={submitNote} className="space-y-2">
          <label className="text-[11px] font-semibold text-faint uppercase">
            Internal Note
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Add internal timeline note"
            className="w-full rounded-[1.1rem] border border-border bg-card px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-3 focus:ring-ring/30"
          />
          <Button type="submit" variant="outline" disabled={isPending || !note.trim()} className="gap-2 w-full">
            <MessageSquare className="w-4 h-4" /> Add Note
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
