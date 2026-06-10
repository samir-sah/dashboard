'use client'
import { Bell, User } from 'lucide-react'

export default function Navbar({ onMenuClick }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 shrink-0">
      <div className="flex items-center gap-2">
        <button
          className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-slate-500 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
        <button
          className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-slate-500 hover:bg-gray-100 transition-colors"
          aria-label="User account"
        >
          <User size={16} />
        </button>
      </div>
    </header>
  )
}