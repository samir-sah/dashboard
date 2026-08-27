export default function SkeletonRow({ columns }) {
  const shimmer = {
    backgroundColor: '#f3f4f6', borderRadius: '6px',
    height: '14px', animation: 'shimmer 1.4s ease-in-out infinite'
  }
  return (
    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
      {columns.map(col => (
        <td key={col} style={{ padding: '15px 20px' }}>
          <div style={{ ...shimmer, width: col === 'ACTIONS' ? '100px' : '75%' }} />
        </td>
      ))}
    </tr>
  )
}