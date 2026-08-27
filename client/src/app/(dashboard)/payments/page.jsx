'use client'
import { useEffect, useState } from 'react'
import PaymentKPIs from '@/features/payments/components/PaymentKPIs'
import PaymentsTable from '@/features/payments/components/PaymentsTable'
import { paymentService } from '@/features/payments/services'

export default function PaymentsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await paymentService.getPaymentStats()
        setStats(statsRes)
      } catch (error) {
        console.error('Failed to fetch payment dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="max-w-[1400px] w-full pb-10">
      {loading ? (
        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      ) : (
        <PaymentKPIs stats={stats} />
      )}

      <PaymentsTable />
    </div>
  )
}
