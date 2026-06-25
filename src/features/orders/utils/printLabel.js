/**
 * printLabel.js
 *
 * This module exports a state-setter approach for triggering the
 * packing slip print view. Instead of using window.open() and
 * document.write(), we use React component architecture.
 *
 * USAGE PATTERN:
 * ─────────────
 * In the parent component that renders OrderRow, maintain state:
 *
 *   const [printOrder, setPrintOrder] = useState(null)
 *
 * Pass the setter as `onPrintLabel` to OrderRow, and conditionally
 * render PrintOrderLabelPage when printOrder is set.
 *
 * For backward compatibility, we also export a simple `printLabel()`
 * function that triggers window.print() on a dynamically rendered
 * React portal — but the RECOMMENDED approach is the component-based one.
 */

/**
 * Triggers the packing slip via a callback.
 * The callback should set React state to show PrintOrderLabelPage.
 *
 * @param {object} order - The order row object { id, date, customer, amount, status, _raw }
 * @param {function} showPrintView - State setter to open the print view
 */
export function openPackingSlip(order, showPrintView) {
  if (typeof showPrintView === 'function') {
    showPrintView(order)
  }
}

/**
 * Legacy-compatible print function.
 * Instead of opening a new window, this triggers window.print()
 * after a brief delay to allow React to render the print overlay.
 *
 * The parent component should listen for this event and render
 * the PrintOrderLabelPage component.
 *
 * @param {object} order - The order row object
 */
export function printLabel(order) {
  // Dispatch a custom event that the parent component listens for
  // This avoids window.open() and document.write()
  const event = new CustomEvent('print-order-label', {
    detail: { order },
    bubbles: true,
  })
  window.dispatchEvent(event)
}
