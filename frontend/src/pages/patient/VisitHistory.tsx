import { useState, useEffect } from "react"
import PatientLayout from "../../components/layout/patient/PatientLayout"
import {
  Clock, FileText, Pill, ChevronDown,
  Search, Download, Star, CheckCircle2,
  Calendar, Loader2
} from "lucide-react"
import { getPatientVisitHistory, getPrescriptionUrl } from "../../services/visitService"

interface Visit {
  _id: string
  doctor_id: string
  doctor_name: string
  specialization: string
  diagnosis: string
  medicines: string[]
  notes: string
  appointment_id: string
  date?: string // Added from appointment if available
  duration?: string // Example: "20 min"
  rating?: number // Example: 5
  patient_name?: string
  type?: string
}

function VisitHistory() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const data = await getPatientVisitHistory()
      // Sort visits by ID (descending) as a proxy for date if date isn't in record
      setVisits(data.sort((a: any, b: any) => b._id.localeCompare(a._id)))
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to fetch visit history")
    } finally {
      setLoading(false)
    }
  }

  const filtered = visits.filter(v =>
    v.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
    v.specialization.toLowerCase().includes(search.toLowerCase()) ||
    v.diagnosis.toLowerCase().includes(search.toLowerCase())
  )

  const handleDownload = (visitId: string, type: string = "visit") => {
    window.open(getPrescriptionUrl(visitId, type), '_blank')
  }

  // Generate a consistent color/avatar based on doctor name
  const getDocInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']
  const getColor = (name: string) => colors[name.length % colors.length]

  return (
    <PatientLayout>
      <div className="vh-page">

        {/* Header */}
        <div className="vh-header">
          <div>
            <h2 className="vh-title">Visit History</h2>
            <p className="vh-sub">Your complete medical visit records</p>
          </div>
          <button className="vh-export-btn" onClick={() => window.print()}>
            <Download size={16} /> Print Records
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <Loader2 className="animate-spin" size={40} color="#3b82f6" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#ef4444' }}>
            <FileText size={48} />
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="vh-stats-row">
              {[
                { label: "Total Visits", value: visits.length, color: "#3b82f6" },
                { label: "Doctors Seen", value: new Set(visits.map(v => v.doctor_name)).size, color: "#10b981" },
                { label: "Medications", value: visits.reduce((s, v) => s + v.medicines.length, 0), color: "#8b5cf6" },
                { label: "Diagnosis Types", value: new Set(visits.map(v => v.diagnosis)).size, color: "#f59e0b" },
              ].map(({ label, value, color }) => (
                <div className="vh-stat" key={label}>
                  <span className="vh-stat-val" style={{ color }}>{value}</span>
                  <span className="vh-stat-label">{label}</span>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="vh-search-wrap" style={{ display: visits.length > 0 ? 'flex' : 'none' }}>
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
                <div className="vh-entry" key={visit._id}>
                  <div className="vh-timeline-line">
                    <div className="vh-dot" style={{ background: getColor(visit.doctor_name) }} />
                    {idx < filtered.length - 1 && <div className="vh-line" />}
                  </div>

                  <div className="vh-card">
                    <div
                      className="vh-card-top"
                      onClick={() => setExpanded(expanded === visit._id ? null : visit._id)}
                    >
                      <div className="vh-avatar" style={{ background: getColor(visit.doctor_name) }}>
                        {getDocInitials(visit.doctor_name)}
                      </div>
                      <div className="vh-card-meta">
                        <div className="vh-meta-top">
                          <h4 className="vh-doc-name">{visit.doctor_name}</h4>
                          <span className="vh-specialty">{visit.specialization}</span>
                        </div>
                        <p className="vh-diagnosis">{visit.diagnosis}</p>
                        
                        <div style={{ margin: '8px 0', padding: '6px 12px', background: '#f8fafc', borderRadius: '6px', display: 'inline-block', border: '1px solid #e2e8f0' }}>
                           <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Patient:</span>
                           <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginLeft: '6px' }}>{visit.patient_name || 'Primary Account'}</span>
                        </div>

                        <div className="vh-meta-row" style={{ marginTop: '4px' }}>
                          <span><Calendar size={13} /> {visit.date || "Recent"}</span>
                          <span><Clock size={13} /> {visit.duration || "20 min"}</span>
                          <span>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={i < (visit.rating || 5) ? "#f59e0b" : "none"}
                                color={i < (visit.rating || 5) ? "#f59e0b" : "#cbd5e1"}
                              />
                            ))}
                          </span>
                        </div>
                      </div>
                      <button className="vh-expand-btn">
                        <ChevronDown
                          size={18}
                          style={{
                            transform: expanded === visit._id ? "rotate(180deg)" : "none",
                            transition: "0.3s"
                          }}
                        />
                      </button>
                    </div>

                    <div className={`vh-expanded${expanded === visit._id ? " vh-expanded-open" : ""}`}>
                      <div className="vh-expand-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                        <div className="vh-expand-section">
                          <h5 className="vh-expand-hd"><Pill size={15} /> Medicines Provided</h5>
                          <ul className="vh-meds-list">
                            {visit.medicines.map((m, i) => (
                              <li key={i}><CheckCircle2 size={13} /> {m}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="vh-notes">
                          <h5 className="vh-expand-hd"><FileText size={15} /> Clinical Notes</h5>
                          <p className="vh-notes-text">{visit.notes || "No common notes provided."}</p>
                        </div>
                      </div>
                      <button 
                        className="vh-download-btn"
                        onClick={() => handleDownload(visit._id, visit.type)}
                      >
                        <Download size={14} /> View Digital Prescription
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filtered.length === 0 && !loading && (
                <div className="vh-empty" style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                    <FileText size={48} opacity={0.3} />
                  </div>
                  <p>No visit records found in your history.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PatientLayout>
  )
}

export default VisitHistory