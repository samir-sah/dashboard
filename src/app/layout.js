import { Montserrat } from 'next/font/google'
import './globals.css'
import Sidebar from "@/components/shared/Sidebar"
import Navbar from "@/components/shared/Navbar"

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'Mavoix Dashboard',
  description: 'Mavoix Admin Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} bg-gray-50`} suppressHydrationWarning>        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-7">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}