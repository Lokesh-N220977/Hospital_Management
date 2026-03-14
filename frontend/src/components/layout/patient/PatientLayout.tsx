import { useState } from "react"
import PatientSidebar from "./PatientSidebar"
import PatientNavbar from "./PatientNavbar"

type Props = {
  children: React.ReactNode
}

function PatientLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="pl-wrapper">
      <PatientSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="pl-main">
        <PatientNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="pl-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default PatientLayout
