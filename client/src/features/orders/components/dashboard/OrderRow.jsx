import { Eye, Pencil, Printer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/shared/StatusBadge'
import ActionBtn   from './ActionBtn'

export default function OrderRow({ order, isLast }) {
  const router = useRouter()
  return (
    <tr className="order-row"
      style={{ borderBottom: isLast ? 'none' : '1px solid #f3f4f6', transition: 'background 0.15s' }}>
      <td style={{ padding: '15px 20px' }}>
        <span onClick={() => router.push(`/orders/${order.id}`)}
          style={{ color: '#4f46e5', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
          #{order.id}
        </span>
      </td>
      <td style={{ padding: '15px 20px', fontSize: '13.5px', color: '#6b7280', whiteSpace: 'nowrap' }}>{order.date}</td>
      <td style={{ padding: '15px 20px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>{order.customer}</td>
      <td style={{ padding: '15px 20px', fontSize: '14px', color: '#374151', whiteSpace: 'nowrap' }}>₹{order.amount.toLocaleString('en-IN')}</td>
      <td style={{ padding: '15px 20px' }}><StatusBadge status={order.status} /></td>
      <td style={{ padding: '15px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ActionBtn icon={Eye}     label="View Order"   onClick={() => router.push(`/orders/${order.id}`)}       hoverBg="#eef2ff" hoverColor="#4f46e5" />
          <ActionBtn icon={Pencil}  label="Edit Details" onClick={() => router.push(`/orders/${order.id}/edit`)} hoverBg="#fefce8" hoverColor="#a16207" />
          <ActionBtn icon={Printer} label="Print Center" onClick={() => router.push(`/orders/${order.id}/print`)} hoverBg="#f0fdf4" hoverColor="#15803d" />
        </div>
      </td>
    </tr>
  )
}