'use client'

const statusStyles = {
  // ✅ exact backend values
  Pending:    { bg: '#f1f0f9', color: '#5d5d6e',  border: '#e9e8f3' },
  'In Cart':  { bg: '#f1f0f9', color: '#5d5d6e',  border: '#e9e8f3' },
  Confirmed:  { bg: '#ebf6ef', color: '#246646',  border: '#d2e9db' },
  Processing: { bg: '#ebf6ef', color: '#2f8159',  border: '#8bc4a4' },
  Shipped:    { bg: '#fef3c7', color: '#b45309',  border: '#fde68a' },
  Delivered:  { bg: '#d2e9db', color: '#1d5038',  border: '#8bc4a4' },
  Cancelled:  { bg: '#fee2e2', color: '#dc2626',  border: '#fecaca' },

  // payment statuses
  Paid:       { bg: '#d2e9db', color: '#1d5038',  border: '#8bc4a4' },
  Completed:  { bg: '#d2e9db', color: '#1d5038',  border: '#8bc4a4' },
  Refunded:   { bg: '#ffedd5', color: '#c2410c',  border: '#fed7aa' },
  Failed:     { bg: '#fee2e2', color: '#dc2626',  border: '#fecaca' },
  created:    { bg: '#f1f0f9', color: '#5d5d6e',  border: '#e9e8f3' },
  authorized: { bg: '#dbeafe', color: '#1d4ed8',  border: '#ebf6ef' },
  captured:   { bg: '#d2e9db', color: '#1d5038',  border: '#8bc4a4' },
  failed:     { bg: '#fee2e2', color: '#dc2626',  border: '#fecaca' },
  refunded:   { bg: '#ffedd5', color: '#c2410c',  border: '#fed7aa' },
  partially_refunded: { bg: '#fef9c3', color: '#a16207', border: '#fde68a' },

}

export default function StatusBadge({ status }) {
  const s = statusStyles[status] ?? { bg: '#f1f0f9', color: '#5d5d6e', border: '#e9e8f3' }
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
