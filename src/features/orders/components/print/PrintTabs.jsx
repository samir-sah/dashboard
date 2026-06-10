'use client'

import ShippingLabel from './ShippingLabel'
import TaxInvoice from './TaxInvoice'

/**
 * PrintTabs — Renders document preview based on active tab.
 * Tab triggers are now in PrintHeader for a unified header experience.
 *
 * The preview is wrapped in a document-like container that mimics
 * viewing a real document on a desk — subtle shadow, paper-like surface.
 *
 * All wrapper chrome is hidden on print — only the content remains.
 */
export default function PrintTabs({ order, activeTab, onPrint }) {
  const isLabel = activeTab === 'label'

  return (
    <div>
      {/* ── Format Info Bar ─────────────────────────── */}
      <div className="print-hide flex items-center justify-between px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg mb-5" data-print="hide">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isLabel ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
          <span className="text-xs font-medium text-neutral-500">
            {isLabel
              ? '4×6 in · Thermal Label · Zebra / TSC / XPrinter compatible'
              : 'A4 · GST-Compliant Tax Invoice · Standard printer'
            }
          </span>
        </div>
        <span className="text-[10px] text-neutral-400 font-medium">
          Preview
        </span>
      </div>

      {/* ── Document Preview Container ──────────────── */}
      <div className="print-preview-container">

        {/* Shipping Label */}
        {isLabel && (
          <div className="flex justify-center py-8 print:py-0 print:block">
            <div className="print-preview-card bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.06)] border border-neutral-200/80 p-10 print:shadow-none print:border-0 print:p-0 print:rounded-none print:bg-transparent">
              <ShippingLabel order={order} />
            </div>
          </div>
        )}

        {/* Tax Invoice */}
        {!isLabel && (
          <div className="py-8 print:py-0">
            <div className="print-preview-card bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.06)] border border-neutral-200/80 p-10 print:shadow-none print:border-0 print:p-0 print:rounded-none print:bg-transparent max-w-[210mm] mx-auto">
              <TaxInvoice order={order} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
