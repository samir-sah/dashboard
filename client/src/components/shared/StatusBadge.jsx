'use client'

const statusStyles = {
  // ✅ exact backend values
  Pending:    { bg: '#f3f4f6', color: '#6b7280',  border: '#e5e7eb' },
  'In Cart':  { bg: '#f4f4f5', color: '#52525b',  border: '#d4d4d8' },
  Confirmed:  { bg: '#f1f5f9', color: '#334155',  border: '#e2e8f0' },
  Processing: { bg: '#e0e7ff', color: '#4338ca',  border: '#c7d2fe' },
  Shipped:    { bg: '#fef3c7', color: '#b45309',  border: '#fde68a' },
  Delivered:  { bg: '#dcfce7', color: '#15803d',  border: '#bbf7d0' },
  Cancelled:  { bg: '#fee2e2', color: '#dc2626',  border: '#fecaca' },

  // payment statuses
  Paid:       { bg: '#dcfce7', color: '#15803d',  border: '#bbf7d0' },
  Completed:  { bg: '#dcfce7', color: '#15803d',  border: '#bbf7d0' },
  Refunded:   { bg: '#ffedd5', color: '#c2410c',  border: '#fed7aa' },
  Failed:     { bg: '#fee2e2', color: '#dc2626',  border: '#fecaca' },
  created:    { bg: '#f3f4f6', color: '#6b7280',  border: '#e5e7eb' },
  authorized: { bg: '#dbeafe', color: '#1d4ed8',  border: '#bfdbfe' },
  captured:   { bg: '#dcfce7', color: '#15803d',  border: '#bbf7d0' },
  failed:     { bg: '#fee2e2', color: '#dc2626',  border: '#fecaca' },
  refunded:   { bg: '#ffedd5', color: '#c2410c',  border: '#fed7aa' },
  partially_refunded: { bg: '#fef9c3', color: '#a16207', border: '#fde68a' },

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
