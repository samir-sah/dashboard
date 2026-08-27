'use client'

export default function FailureLogs({ failures }) {
  if (!failures || failures.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-500 text-sm">
        No failed payment logs available.
      </div>
    );
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900">Failed Payment Logs</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-xs font-semibold text-gray-500 tracking-wider">
              <th className="px-6 py-3">PAYMENT ID</th>
              <th className="px-6 py-3">CUSTOMER</th>
              <th className="px-6 py-3">ERROR CODE</th>
              <th className="px-6 py-3">ERROR REASON</th>
              <th className="px-6 py-3">DATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {failures.map((log, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.paymentId}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.customerName}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-md">
                    {log.errorCode}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.errorReason}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
