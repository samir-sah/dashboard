'use client'
import { LogOut, Search } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { API_CONFIG } from '@/config/api.config'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar({ onMenuClick }) {
  const router = useRouter()
  const pathname = usePathname()
  const title = pathname.split('/').filter(Boolean).at(0) || 'dashboard'
  const pageTitle = title.charAt(0).toUpperCase() + title.slice(1)

  const handleSignOut = async () => {
    try {
      const res = await fetch(`${API_CONFIG.baseURL}/api/auth-dashboard/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Logout failed')
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      router.push('/login')
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-border bg-background/92 px-5 backdrop-blur lg:px-7">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Synera</p>
        <h1 className="truncate text-xl font-semibold text-ink">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden h-10 min-w-[260px] items-center gap-2 rounded-full border border-border bg-surface-2 px-3 text-sm text-muted-foreground lg:flex">
          <Search size={16} className="text-faint" />
          <span className="truncate">Search workspace</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] text-sm font-semibold text-white shadow-[var(--shadow-lift)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              aria-label="User account"
            >
              SG
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={10} className="mt-1 w-56 rounded-[1.1rem] border border-border p-1 shadow-[var(--shadow-soft)]">
            <div className="px-3 py-2.5 flex flex-col">
              <span className="truncate text-sm font-semibold text-ink">Suprokash Goswami</span>
              <span className="mt-0.5 truncate text-xs text-muted-foreground">Admin</span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="group flex cursor-pointer items-center gap-2 rounded-xl p-2 text-muted-foreground transition-colors focus:bg-red-50 focus:text-red-600"
            >
              <LogOut size={16} className="text-faint transition-colors group-focus:text-red-600" />
              <span className="font-medium">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
