'use client'

const statusStyles = {
  // ✅ exact backend values
  Pending:    { bg: '#f3f4f6', color: '#6b7280',  border: '#e5e7eb' },
  Confirmed:  { bg: '#dbeafe', color: '#1d4ed8',  border: '#bfdbfe' },
  Dispatched: { bg: '#fef9c3', color: '#a16207',  border: '#fde68a' },
  Shipping:   { bg: '#ffedd5', color: '#c2410c',  border: '#fed7aa' },
  Delivered:  { bg: '#dcfce7', color: '#15803d',  border: '#bbf7d0' },
  Cancelled:  { bg: '#fee2e2', color: '#dc2626',  border: '#fecaca' },

  // payment statuses
  Paid:       { bg: '#dcfce7', color: '#15803d',  border: '#bbf7d0' },
  Completed:  { bg: '#dcfce7', color: '#15803d',  border: '#bbf7d0' },
  Refunded:   { bg: '#ffedd5', color: '#c2410c',  border: '#fed7aa' },
  Failed:     { bg: '#fee2e2', color: '#dc2626',  border: '#fecaca' },

  // legacy/fallback values
  'In Transit': { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  Shipped:    { bg: '#ffedd5', color: '#c2410c',  border: '#fed7aa' },
  Processing: { bg: '#f3e8ff', color: '#7c3aed',  border: '#e9d5ff' },
}

export default function StatusBadge({ status }) {
  const s = statusStyles[status] ?? { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '99px',
      fontSize: '12px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      backgroundColor: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {status}
    </span>
  )
}