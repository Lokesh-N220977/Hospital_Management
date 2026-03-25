import { useState } from "react"
import AdminSidebar from "./AdminSidebar"
import AdminNavbar from "./AdminNavbar"
import { useTheme } from "../../../hooks/useTheme"

type Props = {
  children: React.ReactNode
}

function AdminLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme } = useTheme()

  return (
    <div className={`pl-wrapper admin-wrapper admin-portal ${theme === 'dark' ? 'dark' : ''}`}>
      <AdminSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="pl-main">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="pl-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
