'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { extractOrderData } from "@/features/orders/components/dashboard/OrderLabel"
import { COMPANY_INFO, GST_CONFIG } from '@/config/company.config'

/* ─── Helpers ──────────────────────────────────────────────── */
const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const money = n => `₹${(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const genInvoiceNo = (orderId) => `INV-${new Date().getFullYear()}-${orderId?.toString().slice(-6) ?? '000000'}`

/**
 * TaxInvoice — A4 GST-compliant Tax Invoice
 *
 * Architecture:
 *   - Tailwind for layout, spacing, typography, colors, borders
 *   - Inline style ONLY for maxWidth: '210mm' (physical print dimension)
 */
const TaxInvoice = forwardRef(function TaxInvoice({ order, className }, ref) {
  const d = extractOrderData(order)
  const raw = order?._raw ?? order
  const addr = d.customer.address
  const billingAddr = raw?.customer?.billingAddress ?? addr
  const invoiceNo = raw?.invoiceNumber ?? genInvoiceNo(d.orderId)
  const invoiceDate = raw?.invoiceDate ?? d.orderDate ?? new Date().toISOString()

  // GST calculations — use per-item taxRate from backend, fall back to global config
  const isInter = GST_CONFIG.isInterState
  const subtotal = d.summary.subtotal
  // Use per-item taxRate (all items have the same rate for single-device business)
  const gstRate = d.items[0]?.taxRate ?? GST_CONFIG.defaultRate
  const totalGst = Math.round(subtotal * (gstRate / 100))
  const cgst = isInter ? 0 : Math.round(totalGst / 2)
  const sgst = isInter ? 0 : Math.round(totalGst / 2)
  const igst = isInter ? totalGst : 0
  const grandTotal = subtotal + d.summary.shipCost - d.summary.disc + totalGst

  const formatAddr = (a) => a
    ? [a.addressLine1, a.street, a.city, a.state, a.pincode, a.country].filter(Boolean).join(', ')
    : 'Not provided'

  /* ── Reusable classnames ────────────────────────────── */
  const sectionLabel = 'text-[9px] font-extrabold tracking-widest text-neutral-500 mb-1.5 uppercase'
  const metaLabel = 'font-bold text-neutral-500 min-w-[90px] text-[11px]'
  const metaValue = 'font-semibold text-xs'
  const leftAlignTh = 'text-left'
  const rightAlignTh = 'text-right'

  return (
    <div
      ref={ref}
      className={cn(
        'tax-invoice-content',
        'mx-auto bg-white text-neutral-900 text-xs leading-relaxed font-sans',
        className
      )}
      style={{ maxWidth: '210mm' }}
    >
      {/* ═══ INVOICE OUTER BORDER ═══════════════════ */}
      <div className="inv-frame border-2 border-neutral-900">

        {/* ── HEADER ─────────────────────────────── */}
        <div className="inv-header px-6 py-5 border-b-2 border-neutral-900 flex justify-between items-start">
          <div>
            <h1 className="text-[22px] font-black tracking-tight mb-0.5">
              {COMPANY_INFO.name}
            </h1>
            <p className="text-[11px] text-neutral-500 max-w-70 leading-snug">
              {formatAddr(COMPANY_INFO.address)}
            </p>
            <div className="mt-2 text-[11px]">
              <span className="font-bold text-neutral-500">GSTIN: </span>
              <span className="font-semibold">{COMPANY_INFO.gstin}</span>
              <span className="mx-2 text-neutral-300">|</span>
              <span className="font-bold text-neutral-500">PAN: </span>
              <span className="font-semibold">{COMPANY_INFO.pan}</span>
            </div>
            <div className="text-[11px]">
              <span className="font-bold text-neutral-500">Email: </span>
              <span>{COMPANY_INFO.email}</span>
              <span className="mx-2 text-neutral-300">|</span>
              <span className="font-bold text-neutral-500">Phone: </span>
              <span>{COMPANY_INFO.phone}</span>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-[28px] font-black tracking-[2px] text-neutral-900">
              TAX INVOICE
            </h2>
            <div className="text-[10px] text-neutral-400 mt-0.5">Original for Recipient</div>
          </div>
        </div>

        {/* ── INVOICE + ORDER DETAILS ────────────── */}
        <div className="inv-meta px-6 py-3.5 border-b border-neutral-200 grid grid-cols-2 gap-3">
          <div>
            {[
              ['Invoice No.', invoiceNo],
              ['Invoice Date', fmt(invoiceDate)],
              ['Order ID', `#${d.orderId}`],
            ].map(([label, val]) => (
              <div key={label} className="flex gap-2 mb-1">
                <span className={metaLabel}>{label}:</span>
                <span className={metaValue}>{val}</span>
              </div>
            ))}
          </div>
          <div>
            {[
              ['Order Date', fmt(d.orderDate)],
              ['Payment', d.summary.paymentMethod],
              ['Pay Status', d.summary.paymentStatus],
            ].map(([label, val]) => (
              <div key={label} className="flex gap-2 mb-1">
                <span className={metaLabel}>{label}:</span>
                <span className={metaValue}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BUYER / SHIPPING INFO ──────────────── */}
        <div className="inv-addresses px-6 py-3.5 border-b border-neutral-200 grid grid-cols-2 gap-6">
          {/* Bill To */}
          <div>
            <div className={sectionLabel}>Bill To</div>
            <div className="font-bold text-sm mb-0.5">{d.customer.name}</div>
            <div className="text-[11px] text-neutral-600 leading-relaxed">
              {formatAddr(billingAddr)}
            </div>
            {d.customer.phone && <div className="text-[11px] mt-0.5">Phone: {d.customer.phone}</div>}
            {d.customer.email && <div className="text-[11px]">Email: {d.customer.email}</div>}
          </div>
          {/* Ship To */}
          <div>
            <div className={sectionLabel}>Ship To</div>
            <div className="font-bold text-sm mb-0.5">{d.customer.name}</div>
            <div className="text-[11px] text-neutral-600 leading-relaxed">
              {formatAddr(addr)}
            </div>
          </div>
        </div>

        {/* ── PRODUCT TABLE ──────────────────────── */}
        <div className="inv-table">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-neutral-100 border-b-2 border-neutral-900 border-t">
                {['#', 'Product', 'SKU', 'HSN/SAC', 'Qty', 'Unit Price', `GST (${gstRate}%)`, 'Tax Amt', 'Total'].map(col => {
                  const isRight = !['#', 'Product', 'SKU', 'HSN/SAC'].includes(col)
                  return (
                    <th
                      key={col}
                      className={cn(
                        'px-3 py-2.5 font-extrabold text-[9px] tracking-wider uppercase text-neutral-500 whitespace-nowrap',
                        isRight ? rightAlignTh : leftAlignTh
                      )}
                    >
                      {col}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {d.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-6 text-center text-neutral-400">No items</td>
                </tr>
              ) : d.items.map((item, i) => {
                const itemTax = Math.round(item.lineTotal * (gstRate / 100))
                const itemTotal = item.lineTotal + itemTax
                return (
                  <tr key={i} className={cn('border-b border-neutral-100', i % 2 === 1 && 'bg-neutral-50')}>
                    <td className="px-3 py-2.5 text-neutral-400 font-mono">{i + 1}</td>
                    <td className="px-3 py-2.5 font-semibold max-w-[180px]">{item.name}</td>
                    <td className="px-3 py-2.5 font-mono text-neutral-500 text-[10px]">{item.sku}</td>
                    <td className="px-3 py-2.5 font-mono text-neutral-500 text-[10px]">{item.hsnCode}</td>
                    <td className="px-3 py-2.5 text-right font-bold">{item.qty}</td>
                    <td className="px-3 py-2.5 text-right font-mono">{money(item.price)}</td>
                    <td className="px-3 py-2.5 text-right text-neutral-500">{gstRate}%</td>
                    <td className="px-3 py-2.5 text-right font-mono">{money(itemTax)}</td>
                    <td className="px-3 py-2.5 text-right font-bold font-mono">{money(itemTotal)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── INVOICE SUMMARY ────────────────────── */}
        <div className="inv-summary border-t-2 border-neutral-900 px-6 py-4 flex justify-end">
          <div className="min-w-[280px]">
            {[
              ['Subtotal', money(subtotal)],
              ['Shipping Charges', d.summary.shipCost === 0 ? 'FREE' : money(d.summary.shipCost)],
              ...(d.summary.disc > 0 ? [['Discount', `- ${money(d.summary.disc)}`]] : []),
              ...(cgst > 0 ? [['CGST', money(cgst)]] : []),
              ...(sgst > 0 ? [['SGST', money(sgst)]] : []),
              ...(igst > 0 ? [['IGST', money(igst)]] : []),
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-1 text-xs">
                <span className="text-neutral-500">{label}</span>
                <span className={cn(
                  'font-semibold font-mono',
                  label === 'Shipping Charges' && d.summary.shipCost === 0 && 'text-emerald-600'
                )}>
                  {val}
                </span>
              </div>
            ))}
            <div className="border-t-2 border-neutral-900 mt-2 pt-2 flex justify-between text-base font-black">
              <span>Grand Total</span>
              <span className="font-mono">{money(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* ── AMOUNT IN WORDS ────────────────────── */}
        <div className="inv-words border-t border-neutral-200 px-6 py-2.5 text-[11px]">
          <span className="font-bold text-neutral-500">Amount in words: </span>
          <span className="font-semibold italic">
            Rupees {numberToWords(Math.round(grandTotal))} Only
          </span>
        </div>

        {/* ── FOOTER: TERMS + SIGNATURE ──────────── */}
        <div className="inv-footer border-t-2 border-neutral-900 px-6 py-5 grid grid-cols-2 gap-6">
          {/* Terms */}
          <div>
            <div className={sectionLabel}>Terms & Conditions</div>
            <ol className="m-0 pl-3.5 text-[10px] text-neutral-500 leading-relaxed list-decimal">
              {COMPANY_INFO.terms.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ol>
          </div>
          {/* Signature */}
          <div className="text-right">
            <div className={sectionLabel}>For {COMPANY_INFO.name}</div>
            <div className="h-12.5 border-b border-neutral-300 mb-1" />
            <div className="text-[10px] font-semibold text-neutral-500">Authorized Signatory</div>
          </div>
        </div>

        {/* ── DECLARATION ────────────────────────── */}
        <div className="inv-declaration border-t border-neutral-200 px-6 py-2.5 text-center text-[10px] text-neutral-400 leading-relaxed">
          <p className="mb-1">
            This invoice is electronically generated and does not require a physical signature.
          </p>
          <p className="font-semibold text-neutral-500">
            Thank you for your business! — {COMPANY_INFO.name}
          </p>
        </div>

      </div>
    </div>
  )
})

/**
 * Simple number-to-words converter for Indian currency
 */
function numberToWords(num) {
  if (num === 0) return 'Zero'
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function convert(n) {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '')
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '')
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '')
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '')
  }

  return convert(num)
}

export default TaxInvoice
