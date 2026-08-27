import { useState } from 'react'

export default function ActionBtn({ icon: Icon, label, onClick, color = '#6b7280', hoverBg = '#f3f4f6', hoverColor = '#374151' }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '32px', height: '32px',
        border: `1px solid ${hovered ? '#d1d5db' : '#e5e7eb'}`,
        borderRadius: '8px',
        backgroundColor: hovered ? hoverBg : '#f9fafb',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hovered ? hoverColor : color,
        transition: 'all 0.15s ease',
        flexShrink: 0,
      }}>
      <Icon size={14} strokeWidth={1.8} />
    </button>
  )
}