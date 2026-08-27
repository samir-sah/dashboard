'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Phone } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/label'
import { API_CONFIG } from '@/config/api.config'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

const RESEND_SECONDS = 30

async function readApiResponse(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Authentication request failed')
  }
  return data
}

export function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const timerRef = useRef(null)

  const cleanPhone = phone.replace(/\D/g, '')
  const isValidPhone = cleanPhone.length === 10

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function startCountdown() {
    setSecondsLeft(RESEND_SECONDS)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  async function handleSendOtp(e) {
    e?.preventDefault()
    if (!isValidPhone) {
      toast.error('Enter a valid 10-digit mobile number.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_CONFIG.baseURL}/api/auth-dashboard/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber: cleanPhone }),
      })
      await readApiResponse(res)
      setStep('otp')
      setOtp('')
      startCountdown()
      toast.success(`OTP sent to +91 ${cleanPhone}`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e) {
    e?.preventDefault()
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit code.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_CONFIG.baseURL}/api/auth-dashboard/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber: cleanPhone, otp }),
      })
      await readApiResponse(res)
      toast.success('Verified! Redirecting to your dashboard...')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (secondsLeft > 0) return
    if (!isValidPhone) {
      toast.error('Enter a valid 10-digit mobile number.')
      return
    }
    setLoading(true)
    setOtp('')
    try {
      const res = await fetch(`${API_CONFIG.baseURL}/api/auth-dashboard/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber: cleanPhone }),
      })
      await readApiResponse(res)
      startCountdown()
      toast.success('A new OTP has been sent.')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoLogin() {
    setLoading(true)
    try {
      const res = await fetch(`${API_CONFIG.baseURL}/api/auth-dashboard/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      await readApiResponse(res)
      toast.success('Demo login successful! Redirecting...')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {step === 'phone' ? 'Admin Sign In' : 'Step 2 of 2'}
        </p>
        <h1 className="mt-2 text-pretty text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {step === 'phone' ? 'Welcome back' : 'Verify your number'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {step === 'phone'
            ? 'Sign in to your Synera admin dashboard with your registered mobile number.'
            : `Enter the 6-digit code we sent to +91 ${cleanPhone}.`}
        </p>
      </div>

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <div className="flex items-stretch overflow-hidden rounded-md border border-input bg-card focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
              <span className="flex items-center gap-1.5 border-r border-input bg-secondary px-3 text-sm font-medium text-secondary-foreground">
                <Phone className="h-4 w-4" />
                +91
              </span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                }
                className="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              We&apos;ll send a one-time password to this number.
            </p>
          </div>

          <Button
            type="submit"
            disabled={!isValidPhone || loading}
            className="h-11 w-full text-sm font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </Button>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-input" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleDemoLogin}
            className="h-11 w-full text-sm font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Demo Login (No OTP)'
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="otp">One-time password</Label>
            <InputOTP
              id="otp"
              maxLength={6}
              value={otp}
              onChange={setOtp}
              containerClassName="justify-between"
            >
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-12 w-12 rounded-md border-input text-base"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            type="submit"
            disabled={otp.length !== 6 || loading}
            className="h-11 w-full text-sm font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Sign in'
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Change number
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={secondsLeft > 0 || loading}
              className="font-semibold text-primary transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:text-muted-foreground"
            >
              {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
        By continuing you agree to Synera&apos;s{' '}
        <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">
          Terms
        </a>{' '}
        and{' '}
        <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}
