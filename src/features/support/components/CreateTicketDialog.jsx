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
      <div className="w-full max-w-xl rounded-lg bg-white shadow-xl border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Create Ticket</h2>
          <button type="button" onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-900">
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
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Customer User ID</label>
              <Input value={form.userId} onChange={updateField("userId")} required className="h-10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Order ID</label>
              <Input value={form.orderId} onChange={updateField("orderId")} className="h-10" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Subject</label>
            <Input value={form.subject} onChange={updateField("subject")} required className="h-10" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Issue Description</label>
            <textarea
              value={form.issue}
              onChange={updateField("issue")}
              required
              rows={4}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-500/10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Category</label>
              <select value={form.category} onChange={updateField("category")} className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm">
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Priority</label>
              <select value={form.priority} onChange={updateField("priority")} className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm">
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-indigo-600 text-white hover:bg-indigo-700">
              Create Ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
