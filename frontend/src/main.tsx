import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import { AuthProvider } from "./context/AuthContext"

import "./styles/main.css"

// Remove any stale 'dark' class from <html> — dark theme is scoped to portal layouts only.
// Also migrate old 'theme' key to 'patient-theme' key.
const legacyTheme = localStorage.getItem('theme');
if (legacyTheme) {
  localStorage.setItem('patient-theme', legacyTheme);
  localStorage.removeItem('theme');
}
document.documentElement.classList.remove('dark');

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
