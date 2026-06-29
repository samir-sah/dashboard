import Sidebar from "@/components/shared/Sidebar"
import Navbar from "@/components/shared/Navbar"
import Providers from "./providers"

export default function DashboardLayout({ children }) {
  return (
    <Providers>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-7">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  )
}
