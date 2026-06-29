'use client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 shrink-0">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-9 h-9 mr-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all outline-none"
              aria-label="User account"
            >
              SG
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-56 mt-1 rounded-xl shadow-md border border-gray-100 p-1">
            <div className="px-3 py-2.5 flex flex-col">
              <span className="text-sm font-semibold text-gray-900 truncate">Suprokash Goswami</span>
              <span className="text-xs text-slate-500 truncate mt-0.5">Admin</span>
            </div>
            <DropdownMenuSeparator className="bg-gray-100" />
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="text-slate-500 group focus:bg-red-50 focus:text-red-600 cursor-pointer flex items-center gap-2 p-2 rounded-md transition-colors"
            >
              <LogOut size={16} className="text-slate-400 group-focus:text-red-600 transition-colors" />
              <span className="font-medium">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
