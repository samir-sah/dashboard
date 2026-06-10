'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Users, TrendingUp,
  Package, CreditCard, BarChart2, HeadphonesIcon, Settings,
} from 'lucide-react'

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

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="w-55 min-w-55 h-screen bg-white border-gray-200 flex flex-col">

      {/* Logo — h-16 matches navbar height for perfect top alignment */}
      <div className="h-16 flex items-center px-5 border-b border-gray-200 shrink-0">
        <Image
          src="/LOGO-H.png"
          alt="Mavoix"
          width={120}
          height={32}
          style={{ objectFit: 'contain', objectPosition: 'left' }}
          priority
        />
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}>
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors
              ${isActive(href)
                ? 'bg-[#eeecfb] text-[#5048e5] font-semibold'
                : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon size={18} strokeWidth={isActive(href) ? 2.2 : 1.8} aria-hidden="true" />
              {label}
            </div>
          </Link>
        ))}
      </nav>

      {/* Bottom: Settings + User */}
      <div className="border-t border-gray-200 px-3 py-3 flex flex-col gap-0.5">
        <Link href="/settings">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors
            ${isActive('/settings')
              ? 'bg-[#eeecfb] text-[#5048e5] font-semibold'
              : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <Settings size={18} strokeWidth={isActive('/settings') ? 2.2 : 1.8} aria-hidden="true" />
            Settings
          </div>
        </Link>

        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            SG
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Suprokash Goswami</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
        </div>
      </div>

    </aside>
  )
}