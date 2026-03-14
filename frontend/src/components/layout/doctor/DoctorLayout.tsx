import { useState } from "react"
import DoctorSidebar from "./DoctorSidebar"
import DoctorNavbar from "./DoctorNavbar"

type Props = {
  children: React.ReactNode
}

function DoctorLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="pl-wrapper">
      <DoctorSidebar 
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="pl-main">
        <DoctorNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="pl-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DoctorLayout
