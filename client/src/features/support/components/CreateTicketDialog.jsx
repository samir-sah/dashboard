import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const categories = ["Delivery", "Payment", "Product", "Order", "Return", "Refund", "Account", "Other"];
const priorities = ["High", "Medium", "Low"];

const initialForm = {
  userId: "",
  orderId: "",
  subject: "",
  issue: "",
  category: "Product",
  priority: "Medium",
};

export default function CreateTicketDialog({ open, onClose, onSubmit, isPending, error }) {
  const [form, setForm] = useState(initialForm);

  if (!open) return null;

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...form,
      userId: form.userId.trim(),
      orderId: form.orderId.trim() || undefined,
      subject: form.subject.trim(),
      issue: form.issue.trim(),
    });
    setForm(initialForm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-xl rounded-[1.1rem] border border-border bg-card shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Create Ticket</h2>
          <button type="button" onClick={onClose} className="text-sm font-medium text-muted-foreground hover:text-ink">
            Close
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          {error ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-faint">Customer User ID</label>
              <Input value={form.userId} onChange={updateField("userId")} required className="h-10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-faint">Order ID</label>
              <Input value={form.orderId} onChange={updateField("orderId")} className="h-10" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-faint">Subject</label>
            <Input value={form.subject} onChange={updateField("subject")} required className="h-10" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-faint">Issue Description</label>
            <textarea
              value={form.issue}
              onChange={updateField("issue")}
              required
              rows={4}
              className="w-full rounded-[1.1rem] border border-border bg-card px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-3 focus:ring-ring/30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-faint">Category</label>
              <select value={form.category} onChange={updateField("category")} className="h-10 w-full rounded-full border border-border bg-card px-3 text-sm">
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-faint">Priority</label>
              <select value={form.priority} onChange={updateField("priority")} className="h-10 w-full rounded-full border border-border bg-card px-3 text-sm">
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              Create Ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
