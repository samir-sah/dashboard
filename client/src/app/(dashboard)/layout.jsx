import Sidebar from "@/components/shared/Sidebar"
import Navbar from "@/components/shared/Navbar"
import Providers from "./providers"

export default function DashboardLayout({ children }) {
  return (
    <Providers>
      <div className="flex h-screen gap-4 overflow-hidden bg-surface-2 p-4">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] border border-border bg-background shadow-[var(--shadow-soft)]">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-5 lg:p-7">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  )
}
