'use client'
import StatusBadge from '@/components/shared/StatusBadge'

export default function RefundHistory({ refunds }) {
  if (!refunds || refunds.length === 0) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border text-center text-muted-foreground text-sm">
        No refunds have been initiated for this payment.
      </div>
    );
  }

  const formatCurrency = (val) => `₹${(val / 100).toLocaleString('en-IN')}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-surface-2/70">
        <h3 className="text-sm font-semibold text-ink">Refund History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-card border-b border-border text-xs font-semibold text-muted-foreground ">
              <th className="px-6 py-3">REFUND ID</th>
              <th className="px-6 py-3">AMOUNT</th>
              <th className="px-6 py-3">STATUS</th>
              <th className="px-6 py-3">REASON</th>
              <th className="px-6 py-3">DATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {refunds.map(refund => (
              <tr key={refund.refundId} className="hover:bg-surface-2/70 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-ink">{refund.refundId}</td>
                <td className="px-6 py-4 text-sm font-medium text-ink">{formatCurrency(refund.amount)}</td>
                <td className="px-6 py-4"><StatusBadge status={refund.status} /></td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{refund.reason || '—'}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(refund.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
