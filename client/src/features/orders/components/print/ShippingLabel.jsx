'use client'

import { forwardRef, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { extractOrderData } from "@/features/orders/components/dashboard/OrderLabel"
import { COMPANY_INFO } from '@/config/company.config'

const fmtDate = (d) => {
  if (!d) return '—'
  try {
    const dt = new Date(d)
    return dt.toISOString().split('T')[0] 
  } catch {
    return String(d)
  }
}

function Barcode({ value, height = 85, barWidth = 2, margin = 0 }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!value || !svgRef.current) return

    import('jsbarcode')
      .then((mod) => {
        try {
          const JsBarcode = mod.default ?? mod
          JsBarcode(svgRef.current, String(value), {
            format: 'CODE128',
            height,
            width: barWidth,
            margin,
            displayValue: true,
            fontSize: 15,
            textMargin: 8,
            fontOptions: 'bold',
            font: 'monospace',
            lineColor: '#000000',
            background: '#ffffff',
            text: String(value).toUpperCase()
          })
        } catch (_) {}
      })
      .catch(() => {})
  }, [value, height, barWidth, margin])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ maxWidth: '100%', maxHeight: '100%' }} />
    </div>
  )
}

const ShippingLabel = forwardRef(function ShippingLabel({ order, className }, ref) {
  const d = extractOrderData(order)
  const raw = order?._raw ?? order

  const addr = d.customer?.address ?? {}

  // Fallback to tracking number logic to ensure barcode section is always visible
  // Using actual data if it exists, otherwise standard fallback 
  const awb = raw?.trackingNumber || raw?.awb || 'AWB' + String(d.orderId ?? '').slice(-10).toUpperCase()

  const actualWeight = raw?.weight ? `${raw.weight} KG` : '2.5 KG' 
  const dimensions = raw?.dimensions || '12cmx12cmx12cm'
  
  const remarks = raw?.notes || raw?.customerNotes || d.notes?.customer || d.notes?.special || null

  const seller = COMPANY_INFO ?? {}
  const sellerAddr = seller.address ?? {}

  const shippingDate = raw?.shippingDate ? fmtDate(raw.shippingDate) : fmtDate(d.orderDate)

  // Print CSS is handled globally by src/styles/print.css — no inline overrides needed

  const BORDER_WIDTH = '3px'
  const BORDER_COLOR = '#000'
  const BORDER = `${BORDER_WIDTH} solid ${BORDER_COLOR}`
  const THIN_BORDER = `1px solid ${BORDER_COLOR}`

  return (
      <div
        ref={ref}
        className={cn('shipping-label-content', className)}
        style={{
          width: '4in',
          height: '6in',
          border: BORDER,
          borderRadius: '0',
          boxSizing: 'border-box',
          background: '#fff',
          color: '#000',
          fontFamily: "Arial, Helvetica, sans-serif",
          lineHeight: '1.25',
          display: 'flex',
          flexDirection: 'column',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          overflow: 'hidden' 
        }}
      >
        {/* SECTION 1: TOP SPLIT (45%) */}
        <div style={{ display: 'flex', height: '45%', borderBottom: BORDER, minHeight: 0 }}>
          
          {/* LEFT 58% - SHIP TO */}
          <div style={{ flex: '0 0 58%', borderRight: BORDER, padding: '12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{
                background: '#000',
                color: '#fff',
                fontWeight: '900',
                fontSize: '18px',
                padding: '6px 14px',
                borderRadius: '0',
                display: 'inline-block'
              }}>
                SHIP TO:
              </span>
            </div>
            
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', color: '#000' }}>
              <div>{d.customer?.name || '—'}</div>
              {addr.addressLine1 && <div>{addr.addressLine1},</div>}
              {addr.street && <div>{addr.street},</div>}
              {addr.area && <div>{addr.area},</div>}
              {(addr.city || addr.state || addr.pincode) && (
                <div>
                  {[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                </div>
              )}
              {addr.country && <div>{addr.country}</div>}
              {d.customer?.phone && <div>Phone: {d.customer.phone}</div>}
            </div>
          </div>

          {/* RIGHT 42% - FROM */}
          <div style={{ flex: '0 0 42%', padding: '12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px', color: '#000' }}>
              FROM:
            </div>
            
            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', color: '#444' }}>
              <div>{seller.name || '—'}</div>
              {sellerAddr.addressLine1 && <div>{sellerAddr.addressLine1},</div>}
              {sellerAddr.street && <div>{sellerAddr.street},</div>}
              {sellerAddr.area && <div>{sellerAddr.area},</div>}
              {(sellerAddr.city || sellerAddr.state || sellerAddr.pincode) && (
                <div>
                  {[sellerAddr.city, sellerAddr.state, sellerAddr.pincode].filter(Boolean).join(', ')}
                </div>
              )}
              {sellerAddr.country && <div>{sellerAddr.country}</div>}
            </div>
          </div>
        </div>

        {/* SECTION 2: MIDDLE SPLIT (25%) */}
        <div style={{ display: 'flex', height: '25%', flex: '0 0 auto', borderBottom: BORDER }}>
          
          {/* LEFT SIDE - COMPACT TABLE */}
          <div style={{ flex: '0 0 58%', borderRight: BORDER, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flex: 1, borderBottom: THIN_BORDER, alignItems: 'center', padding: '0 12px' }}>
              <div style={{ fontWeight: 'bold', width: '100px', fontSize: '11px' }}>ORDER ID:</div>
              <div style={{ fontSize: '12px' }}>{d.orderId}</div>
            </div>
            <div style={{ display: 'flex', flex: 1, borderBottom: THIN_BORDER, alignItems: 'center', padding: '0 12px' }}>
              <div style={{ fontWeight: 'bold', width: '100px', fontSize: '11px' }}>WEIGHT:</div>
              <div style={{ fontSize: '12px' }}>{actualWeight}</div>
            </div>
            <div style={{ display: 'flex', flex: 1, borderBottom: THIN_BORDER, alignItems: 'center', padding: '0 12px' }}>
              <div style={{ fontWeight: 'bold', width: '100px', fontSize: '11px' }}>DIMENSIONS:</div>
              <div style={{ fontSize: '12px' }}>{dimensions}</div>
            </div>
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', padding: '0 12px' }}>
              <div style={{ fontWeight: 'bold', width: '100px', fontSize: '11px' }}>SHIPPING DATE:</div>
              <div style={{ fontSize: '12px' }}>{shippingDate}</div>
            </div>
          </div>

          {/* RIGHT SIDE - REMARKS */}
          <div style={{ flex: '0 0 42%', padding: '12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>
              REMARKS:
            </div>
            <div style={{ fontSize: '12px', color: '#000', textTransform: 'uppercase' }}>
              {remarks ? remarks : 'NO REMARKS'}
            </div>
          </div>
        </div>

        {/* SECTION 3: BARCODE (30%) */}
        <div style={{ height: '30%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px' }}>
          {awb ? (
             <Barcode value={awb} />
          ) : (
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#999' }}>NO BARCODE DATA</div>
          )}
        </div>

      </div>
  )
})

export default ShippingLabel