'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Users, Package, CreditCard,
  BarChart2, HeadphonesIcon, ChevronLeft, ChevronRight,
} from 'lucide-react'
import SyneraWordmark from '@/components/synera-wordmark'

const navItems = [
  { label: 'Dashboard', href: '/dashboard',  icon: LayoutDashboard },
  { label: 'Orders',    href: '/orders',     icon: ShoppingCart },
  { label: 'Customers', href: '/customers',  icon: Users },
  { label: 'Inventory', href: '/inventory',  icon: Package },
  { label: 'Payments',  href: '/payments',   icon: CreditCard },
  { label: 'Reports',   href: '/reports',    icon: BarChart2 },
  { label: 'Support',   href: '/support',    icon: HeadphonesIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(() => (
    typeof window !== 'undefined' &&
    window.localStorage.getItem('synera-sidebar-collapsed') === 'true'
  ))

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current
      window.localStorage.setItem('synera-sidebar-collapsed', String(next))
      return next
    })
  }

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <aside
      className={`flex h-[calc(100vh-2rem)] shrink-0 flex-col rounded-[1.35rem] border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[var(--shadow-soft)] transition-all duration-200 ease-out ${collapsed ? 'w-[5.25rem]' : 'w-[17.5rem]'}`}
    >

      <div className={`flex h-[72px] shrink-0 items-center border-b border-sidebar-border ${collapsed ? 'justify-center px-3' : 'justify-between px-5'}`}>
        {!collapsed && <SyneraWordmark className="origin-left scale-[0.78]" />}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="grid size-9 place-items-center rounded-full border border-border bg-background text-muted-foreground shadow-xs transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}>
            <div className={`group flex items-center gap-3 rounded-full px-3 py-2.5 text-sm cursor-pointer transition-all duration-200 ease-out
              ${isActive(href)
                ? 'bg-brand-50 text-brand-800 font-semibold shadow-[inset_0_0_0_1px_var(--brand-100)]'
                : 'text-muted-foreground font-medium hover:bg-surface-2 hover:text-ink'
              }`}
            >
              <span className={`grid size-8 shrink-0 place-items-center rounded-full transition-colors ${isActive(href) ? 'bg-brand-700 text-white' : 'bg-transparent text-faint group-hover:text-brand-700'}`}>
                <Icon size={18} strokeWidth={isActive(href) ? 2.2 : 1.8} aria-hidden="true" />
              </span>
              {!collapsed && <span className="truncate">{label}</span>}
            </div>
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <div className={`flex items-center gap-3 rounded-[1.1rem] bg-surface-2 px-3 py-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] text-xs font-semibold text-white shadow-[var(--shadow-lift)]">
            SG
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">Suprokash Goswami</p>
              <p className="text-xs font-medium text-muted-foreground">Admin</p>
            </div>
          )}
        </div>
      </div>

    </aside>
  )
}
