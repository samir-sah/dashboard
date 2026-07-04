'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Printer, Download, FileText, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import StatusBadge from "@/components/shared/StatusBadge"

/**
 * PrintHeader — Compact, polished page header for Print Center.
 * Inspired by Shopify/Stripe admin headers.
 * Scrolls naturally with the page (not sticky).
 * Hidden entirely on print.
 */
export default function PrintHeader({ orderId, customerName, status, activeTab, onTabChange, onPrint }) {
  const router = useRouter()
  const docLabel = activeTab === 'label' ? 'Shipping Label' : 'Tax Invoice'

  return (
    <div className="print-hide" data-print="hide">
      {/* ── Top Bar ──────────────────────────────────── */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 shrink-0 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
            >
              <ArrowLeft size={16} />
            </Button>

            <div className="h-5 w-px bg-neutral-200 shrink-0" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-semibold text-neutral-900 truncate">
                  Print Center
                </h1>
                <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  #{orderId}
                </span>
                <StatusBadge status={status} />
              </div>
              {customerName && (
                <p className="text-xs text-neutral-500 truncate mt-0.5">{customerName}</p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrint}
              className="gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900"
              title="Save as PDF using browser print dialog"
            >
              <Download size={14} />
              Save PDF
            </Button>

            <Button
              size="sm"
              onClick={onPrint}
              className="gap-1.5 text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800"
            >
              <Printer size={14} />
              Print {docLabel}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────── */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="px-6 flex gap-0">
          {[
            { key: 'label', label: 'Shipping Label', icon: Tag },
            { key: 'invoice', label: 'Tax Invoice', icon: FileText },
          ].map(({ key, label, icon: Icon }) => {
            const active = activeTab === key
            return (
              <button
                key={key}
                onClick={() => onTabChange(key)}
                className={`
                  relative flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors
                  border-b-2 -mb-px cursor-pointer
                  ${active
                    ? 'text-neutral-900 border-neutral-900'
                    : 'text-neutral-400 border-transparent hover:text-neutral-600 hover:border-neutral-300'
                  }
                `}
              >
                <Icon size={14} className={active ? 'text-neutral-700' : 'text-neutral-400'} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
