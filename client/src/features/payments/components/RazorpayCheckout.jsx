'use client'
import { useEffect, useState } from 'react'
import { paymentService } from '@/features/payments/services'

const RAZORPAY_SCRIPT_ID = 'razorpay-checkout-js'
const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

export default function RazorpayCheckout({ orderId, customer, onSuccess, onError, className, disabled, children }) {
  const [scriptReady, setScriptReady] = useState(() => typeof window !== 'undefined' && Boolean(window.Razorpay))
  const [scriptError, setScriptError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    if (window.Razorpay) return undefined

    const handleLoad = () => {
      if (window.Razorpay) {
        setScriptReady(true)
        setScriptError('')
      } else {
        setScriptError('Razorpay checkout script loaded, but checkout was not initialized.')
      }
    }

    const handleError = () => {
      setScriptReady(false)
      setScriptError('Failed to load Razorpay checkout script. Check internet/ad blocker access to checkout.razorpay.com.')
    }

    let script = document.getElementById(RAZORPAY_SCRIPT_ID)

    if (!script) {
      script = document.createElement('script')
      script.id = RAZORPAY_SCRIPT_ID
      script.src = RAZORPAY_SCRIPT_SRC
      script.async = true
      document.body.appendChild(script)
    }

    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)

    return () => {
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
    }
  }, [])

  useEffect(() => {
    if (scriptError) onError?.(new Error(scriptError))
  }, [scriptError, onError])

  const openCheckout = async () => {
    if (!scriptReady || !window.Razorpay) {
      onError?.(new Error(scriptError || 'Razorpay checkout is still loading.'))
      return
    }

    try {
      setLoading(true)
      const res = await paymentService.createRazorpayOrder(orderId)
      const paymentOrder = res.data || res

      const checkout = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Mavoix',
        description: `Order ${paymentOrder.orderId}`,
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: customer?.name || '',
          email: customer?.email || '',
          contact: customer?.phone || '',
        },
        handler: async (response) => {
          try {
            const verifyRes = await paymentService.verifyPayment(response)
            onSuccess?.({
              ...(verifyRes.data || verifyRes),
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            })
          } catch (error) {
            onError?.(error)
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      })

      checkout.on('payment.failed', (response) => {
        setLoading(false)
        onError?.(new Error(response.error?.description || 'Payment failed'))
      })

      checkout.open()
    } catch (error) {
      setLoading(false)
      onError?.(error)
    }
  }

  const label = loading
    ? 'Opening...'
    : scriptError
      ? 'Razorpay unavailable'
      : !scriptReady
        ? 'Loading Razorpay...'
        : (children || 'Pay Now')

  return (
    <button
      type="button"
      onClick={openCheckout}
      disabled={disabled || !scriptReady || loading || Boolean(scriptError)}
      className={className}
      title={scriptError || (!scriptReady ? 'Loading Razorpay checkout script...' : undefined)}
    >
      {label}
    </button>
  )
}
