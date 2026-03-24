import { useState, useEffect } from "react"
import PatientSidebar from "./PatientSidebar"
import PatientNavbar from "./PatientNavbar"
import { useTheme } from "../../../hooks/useTheme"

type Props = {
  children: React.ReactNode
}

function PatientLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [prefKey, setPrefKey] = useState(0)
  const { theme } = useTheme()

  useEffect(() => {
    const handlePrefChange = () => setPrefKey(prev => prev + 1)
    window.addEventListener('patient-prefs-changed', handlePrefChange)
    window.addEventListener('theme-change', handlePrefChange)
    return () => {
      window.removeEventListener('patient-prefs-changed', handlePrefChange)
      window.removeEventListener('theme-change', handlePrefChange)
    }
  }, [])

  const fontSize = localStorage.getItem('patient-font-size') || 'Normal'
  const fontClass = `font-size-${fontSize.toLowerCase().replace(' ', '-')}`
  const themeClass = theme === 'dark' ? 'dark' : ''

  return (
    <div key={prefKey} className={`pl-wrapper patient-portal ${fontClass} ${themeClass}`.trim()}>
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

