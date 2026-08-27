import Image from 'next/image'
import { ShieldCheck } from 'lucide-react'

import { LoginForm } from '@/components/login-form'

export const metadata = {
  title: 'Synera — Admin Login',
  description: 'Sign in to the Synera admin dashboard',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col lg:flex-row">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:w-1/2 xl:w-[55%]">
        {/* molecular dot motif echoing the logo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'radial-gradient(currentColor 1.5px, transparent 1.5px)',
            backgroundSize: '26px 26px',
            color: 'var(--color-accent)',
          }}
        />
        {/* soft golden glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
        />
        {/* angled corner echoing the website shape */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rotate-45 rounded-[3rem] border border-primary-foreground/10"
        />

        <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-16">
          <Image
            src="/synera-logo.png"
            alt="Synera"
            width={180}
            height={48}
            style={{ objectFit: 'contain', objectPosition: 'left' }}
            priority
            className="brightness-0 invert"
          />

          <div className="max-w-xl">
            <p className="mb-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Business Admin Portal
            </p>
            <h2 className="text-balance text-4xl font-bold leading-[1.1] xl:text-5xl">
              Precision in{' '}
              <span className="relative whitespace-nowrap text-accent">
                every beat
                <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-accent/60" />
              </span>
              <br />
              starts here.
            </h2>
            <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-primary-foreground/70">
              Sign in to manage your business — orders, customers, and insights,
              all from one calm, focused workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-primary-foreground/60">
            <span className="h-px w-10 bg-accent/60" />
            Synera · Admin Console
          </div>
        </div>
      </section>

      {/* Form panel */}
      <section className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-12 sm:px-10">
        {/* faint dotted texture echoing the logo motif */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(var(--color-primary) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* soft accent corner glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
        />

        <div className="relative z-10 w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Image
              src="/synera-logo.png"
              alt="Synera"
              width={160}
              height={42}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-xl shadow-primary/5 sm:p-9">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-accent"
            />
            <LoginForm />
          </div>

          {/* Trust note */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Protected by OTP-based two-factor verification
          </div>
        </div>
      </section>
    </main>
  )
}
