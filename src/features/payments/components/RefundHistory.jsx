'use client'
import StatusBadge from '@/components/shared/StatusBadge'

export default function RefundHistory({ refunds }) {
  if (!refunds || refunds.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-500 text-sm">
        No refunds have been initiated for this payment.
      </div>
    );
  }

  const formatCurrency = (val) => `₹${(val / 100).toLocaleString('en-IN')}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900">Refund History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-xs font-semibold text-gray-500 tracking-wider">
              <th className="px-6 py-3">REFUND ID</th>
              <th className="px-6 py-3">AMOUNT</th>
              <th className="px-6 py-3">STATUS</th>
              <th className="px-6 py-3">REASON</th>
              <th className="px-6 py-3">DATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {refunds.map(refund => (
              <tr key={refund.refundId} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{refund.refundId}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(refund.amount)}</td>
                <td className="px-6 py-4"><StatusBadge status={refund.status} /></td>
                <td className="px-6 py-4 text-sm text-gray-600">{refund.reason || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(refund.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
