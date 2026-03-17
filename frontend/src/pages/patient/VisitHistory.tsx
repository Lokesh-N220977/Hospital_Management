import { useState } from "react"
import PatientLayout from "../../components/layout/patient/PatientLayout"
import {
  Clock, FileText, Pill, ChevronDown,
  Search, Download, Star, CheckCircle2
} from "lucide-react"

const visits = [
  {
    id: "V001", doctor: "Dr. Anil Kumar", specialty: "Orthopedics",
    date: "Oct 15, 2024", duration: "25 min", avatar: "AK",
    diagnosis: "Mild knee osteoarthritis", color: "#10b981",
    medications: ["Diclofenac 50mg", "Calcium supplement"],
    notes: "Patient advised physiotherapy sessions twice weekly. Follow-up in 4 weeks.",
    tests: ["X-Ray Knee", "Blood CBC"],
    rating: 5,
  },
  {
    id: "V002", doctor: "Dr. Kiran Desai", specialty: "Pediatrics",
    date: "Nov 10, 2024", duration: "15 min", avatar: "KD",
    diagnosis: "Upper respiratory tract infection", color: "#f59e0b",
    medications: ["Amoxicillin 500mg", "Paracetamol 500mg", "Vitamin C"],
    notes: "Rest recommended. Plenty of fluids. Follow-up if fever persists beyond 3 days.",
    tests: ["Throat swab"],
    rating: 4,
  },
  {
    id: "V003", doctor: "Dr. Rahul Sharma", specialty: "Cardiology",
    date: "Sep 5, 2024", duration: "30 min", avatar: "RS",
    diagnosis: "Hypertension Stage 1", color: "#3b82f6",
    medications: ["Amlodipine 5mg", "Losartan 50mg"],
    notes: "BP monitoring daily. Low-sodium diet. No strenuous exercise until next review.",
    tests: ["ECG", "Echocardiogram", "Lipid profile"],
    rating: 5,
  },
  {
    id: "V004", doctor: "Dr. Priya Mehta", specialty: "Dermatology",
    date: "Aug 20, 2024", duration: "20 min", avatar: "PM",
    diagnosis: "Atopic dermatitis", color: "#8b5cf6",
    medications: ["Hydrocortisone cream", "Cetirizine 10mg"],
    notes: "Avoid harsh soaps. Use moisturizer twice daily. Patch test recommended.",
    tests: ["Skin patch test"],
    rating: 4,
  },
]

function VisitHistory() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const filtered = visits.filter(v =>
    v.doctor.toLowerCase().includes(search.toLowerCase()) ||
    v.specialty.toLowerCase().includes(search.toLowerCase()) ||
    v.diagnosis.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PatientLayout>
      <div className="vh-page">

        {/* Header */}
        <div className="vh-header">
          <div>
            <h2 className="vh-title">Visit History</h2>
            <p className="vh-sub">Your complete medical visit records</p>
          </div>
          <button className="vh-export-btn">
            <Download size={16} /> Export PDF
          </button>
        </div>

        {/* Stats */}
        <div className="vh-stats-row">
          {[
            { label: "Total Visits", value: visits.length, color: "#3b82f6" },
            { label: "Doctors Seen", value: new Set(visits.map(v => v.doctor)).size, color: "#10b981" },
            { label: "Medications", value: visits.reduce((s, v) => s + v.medications.length, 0), color: "#8b5cf6" },
            { label: "Tests Done", value: visits.reduce((s, v) => s + v.tests.length, 0), color: "#f59e0b" },
          ].map(({ label, value, color }) => (
            <div className="vh-stat" key={label}>
              <span className="vh-stat-val" style={{ color }}>{value}</span>
              <span className="vh-stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="vh-search-wrap">
          <Search size={16} />
          <input
            type="text"
            className="vh-search"
            placeholder="Search by doctor, specialty or diagnosis..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Timeline */}
        <div className="vh-timeline">
          {filtered.map((visit, idx) => (
            <div className="vh-entry" key={visit.id}>
              <div className="vh-timeline-line">
                <div className="vh-dot" style={{ background: visit.color }} />
                {idx < filtered.length - 1 && <div className="vh-line" />}
              </div>

              <div className="vh-card">
                <div
                  className="vh-card-top"
                  onClick={() => setExpanded(expanded === visit.id ? null : visit.id)}
                >
                  <div className="vh-avatar" style={{ background: visit.color }}>
                    {visit.avatar}
                  </div>
                  <div className="vh-card-meta">
                    <div className="vh-meta-top">
                      <h4 className="vh-doc-name">{visit.doctor}</h4>
                      <span className="vh-specialty">{visit.specialty}</span>
                    </div>
                    <p className="vh-diagnosis">{visit.diagnosis}</p>
                    <div className="vh-meta-row">
                      <span><Clock size={13} /> {visit.date}</span>
                      <span><Clock size={13} /> {visit.duration}</span>
                      <span>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < visit.rating ? "#f59e0b" : "none"}
                            color={i < visit.rating ? "#f59e0b" : "#cbd5e1"}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                  <button className="vh-expand-btn">
                    <ChevronDown
                      size={18}
                      style={{
                        transform: expanded === visit.id ? "rotate(180deg)" : "none",
                        transition: "0.3s"
                      }}
                    />
                  </button>
                </div>

                <div className={`vh-expanded${expanded === visit.id ? " vh-expanded-open" : ""}`}>
                  <div className="vh-expand-grid">
                    <div className="vh-expand-section">
                      <h5 className="vh-expand-hd"><Pill size={15} /> Medications</h5>
                      <ul className="vh-meds-list">
                        {visit.medications.map(m => (
                          <li key={m}><CheckCircle2 size={13} /> {m}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="vh-expand-section">
                      <h5 className="vh-expand-hd"><FileText size={15} /> Tests Ordered</h5>
                      <ul className="vh-meds-list">
                        {visit.tests.map(t => (
                          <li key={t}><CheckCircle2 size={13} /> {t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="vh-notes">
                    <h5 className="vh-expand-hd"><FileText size={15} /> Doctor's Notes</h5>
                    <p className="vh-notes-text">{visit.notes}</p>
                  </div>
                  <button className="vh-download-btn">
                    <Download size={14} /> Download Prescription
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="vh-empty">
              <FileText size={48} />
              <p>No visit records found</p>
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  )
}

export default VisitHistory