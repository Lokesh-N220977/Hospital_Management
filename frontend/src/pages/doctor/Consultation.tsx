import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft, CheckCircle, Activity, FileText, Pill,
  History, Plus, Trash2, XCircle
} from "lucide-react"
import { useState } from "react"
import { recordVisit } from "../../services/visitService"

function Consultation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("notes")

  // States for consultation data
  const [diagnosis, setDiagnosis] = useState<{ id: string, name: string }[]>([
    { id: "I10", name: "Hypertension" },
    { id: "E11", name: "Type 2 Diabetes" }
  ])
  const [diagInput, setDiagInput] = useState("")

  const [medicines, setMedicines] = useState<{ name: string, dosage: string, duration: string }[]>([
    { name: "Amlodipine 5mg", dosage: "1-0-1 (After Food)", duration: "30 Days" }
  ])
  const [medInput, setMedInput] = useState({ name: "", dosage: "", duration: "" })

  const [notes, setNotes] = useState("")
  const [vitals, setVitals] = useState({
    bp: "120/80", heartRate: "72", temp: "98.6", spo2: "98", weight: "70", height: "175"
  })

  const addDiagnosis = () => {
    if (!diagInput) return
    setDiagnosis([...diagnosis, { id: Date.now().toString(), name: diagInput }])
    setDiagInput("")
  }

  const removeDiagnosis = (id: string) => {
    setDiagnosis(diagnosis.filter(d => d.id !== id))
  }

  const addMedicine = () => {
    if (!medInput.name || !medInput.dosage) return
    setMedicines([...medicines, { ...medInput }])
    setMedInput({ name: "", dosage: "", duration: "" })
  }

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index))
  }

  const handleFinishVisit = async () => {
    try {
      if (!id) return
      await recordVisit({
        appointmentId: id,
        diagnosis: diagnosis.map(d => d.name).join(", "),
        medicines: medicines.map(m => `${m.name} (${m.dosage}, ${m.duration})`),
        notes: notes
      })
      alert("Consultation recorded successfully!")
      navigate("/doctor/schedule")
    } catch (err: any) {
      alert("Error saving consultation: " + err.message)
    }
  }

  return (
    <DoctorLayout>
      <div className="pd-page">
        <div className="pd-header-top">
          <button className="pd-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back to Schedule
          </button>
          <div className="pd-header-actions">
            <button className="pd-action-btn-primary" onClick={handleFinishVisit}>
              <CheckCircle size={18} /> Finish & Save
            </button>
          </div>
        </div>

        <div className="pd-header-patient-info">
          <div className="pd-patient-header-main">
            <div className="pd-avatar-lg">JD</div>
            <div className="pd-patient-header-text">
              <h1 className="pd-page-title">John Doe</h1>
              <div className="pd-visit-badges">
                <span className="pd-visit-badge">Male, 32 yrs</span>
                <span className="pd-visit-badge">Visit: #12 (Follow-up)</span>
              </div>
            </div>
          </div>
          <div className="pd-quick-vitals">
            <div className="pd-mini-vital">
              <span className="pd-mv-label">BP</span>
              <span className="pd-mv-val">{vitals.bp}</span>
            </div>
            <div className="pd-mini-vital">
              <span className="pd-mv-label">Temp</span>
              <span className="pd-mv-val">{vitals.temp}°F</span>
            </div>
          </div>
        </div>

        <div className="pd-consultation-layout">
          <aside className="pd-consultation-tabs">
            {[
              { id: "notes", label: "Clinical Notes", icon: <FileText size={20} /> },
              { id: "vitals", label: "Vital Signs", icon: <Activity size={20} /> },
              { id: "presc", label: "Prescriptions", icon: <Pill size={20} /> },
              { id: "history", label: "Recent History", icon: <History size={20} /> },
            ].map(tab => (
              <button
                key={tab.id}
                className={`pd-consultation-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </aside>

          <main className="pd-consultation-content">
            {activeTab === "notes" && (
              <div className="pd-card-grid">
                <div className="pd-card pd-full-width">
                  <h3 className="pd-card-subtitle">Chief Complaints & History</h3>
                  <textarea
                    className="pd-textarea-large"
                    placeholder="Enter patient complaints and subjective history..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
                <div className="pd-card">
                  <h3 className="pd-card-subtitle">Diagnosis (ICD-10)</h3>
                  <div className="pd-diagnosis-input-wrap">
                    <input
                      type="text"
                      className="pd-input"
                      placeholder="Enter ICD-10 code or name..."
                      value={diagInput}
                      onChange={(e) => setDiagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addDiagnosis()}
                    />
                    <button className="pd-add-btn" onClick={addDiagnosis}><Plus size={18} /></button>
                  </div>
                  <div className="pd-selected-tags">
                    {diagnosis.map(d => (
                      <span key={d.id} className="pd-tag">
                        {d.name}
                        <XCircle size={14} className="pd-tag-remove" onClick={() => removeDiagnosis(d.id)} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "vitals" && (
              <div className="pd-card">
                <h3 className="pd-card-subtitle">Patient Vital Signs</h3>
                <div className="pd-vitals-grid-consult">
                  <VitalField label="BP" unit="mmHg" value={vitals.bp} onChange={(v: any) => setVitals({ ...vitals, bp: v })} />
                  <VitalField label="Heart Rate" unit="bpm" value={vitals.heartRate} onChange={(v: any) => setVitals({ ...vitals, heartRate: v })} />
                  <VitalField label="Temp" unit="°F" value={vitals.temp} onChange={(v: any) => setVitals({ ...vitals, temp: v })} />
                  <VitalField label="SpO2" unit="%" value={vitals.spo2} onChange={(v: any) => setVitals({ ...vitals, spo2: v })} />
                  <VitalField label="Weight" unit="kg" value={vitals.weight} onChange={(v: any) => setVitals({ ...vitals, weight: v })} />
                  <VitalField label="Height" unit="cm" value={vitals.height} onChange={(v: any) => setVitals({ ...vitals, height: v })} />
                </div>
              </div>
            )}

            {activeTab === "presc" && (
              <div className="pd-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1.5px solid #f1f5f9', background: 'linear-gradient(to right, #f8fafc, #fff)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Pill size={18} />
                     </div>
                     <div>
                       <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Issue Prescription</h3>
                       <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Pharmacological orders for current follow-up.</p>
                     </div>
                   </div>
                </div>

                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div className="pd-field">
                      <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '8px', display: 'block' }}>Medicine Name</label>
                      <input
                        type="text"
                        className="pd-input"
                        placeholder="e.g. Paracetamol 500mg"
                        style={{ width: '100%', borderRadius: '10px', padding: '12px', border: '1.5px solid #e2e8f0' }}
                        value={medInput.name}
                        onChange={(e) => setMedInput({ ...medInput, name: e.target.value })}
                      />
                    </div>
                    <div className="pd-field">
                      <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '8px', display: 'block' }}>Dosage Schema</label>
                      <input
                        type="text"
                        className="pd-input"
                        placeholder="e.g. 1-0-1"
                        style={{ width: '100%', borderRadius: '10px', padding: '12px', border: '1.5px solid #e2e8f0' }}
                        value={medInput.dosage}
                        onChange={(e) => setMedInput({ ...medInput, dosage: e.target.value })}
                      />
                    </div>
                    <div className="pd-field">
                      <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '8px', display: 'block' }}>Duration</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          className="pd-input"
                          placeholder="e.g. 5 Days"
                          style={{ flex: 1, borderRadius: '10px', padding: '12px', border: '1.5px solid #e2e8f0' }}
                          value={medInput.duration}
                          onChange={(e) => setMedInput({ ...medInput, duration: e.target.value })}
                        />
                        <button 
                           className="pd-action-btn-primary" 
                           style={{ padding: '0 20px', borderRadius: '10px', background: '#3b82f6', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' }} 
                           onClick={addMedicine}
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pd-presc-table-wrap" style={{ border: '1.5px solid #f1f5f9', borderRadius: '16px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' }}>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Medicine Information</th>
                          <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Timing/Dosage</th>
                          <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Duration</th>
                          <th style={{ textAlign: 'center', padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.map((m, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f8fafc', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fcfdfe'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '16px 20px', fontWeight: 700, color: '#1e293b' }}>{m.name}</td>
                            <td style={{ padding: '16px 20px', color: '#475569' }}><span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>{m.dosage}</span></td>
                            <td style={{ padding: '16px 20px', color: '#475569', fontSize: '0.9rem' }}>{m.duration}</td>
                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                              <button 
                                 style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} 
                                 onClick={() => removeMedicine(i)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {medicines.length === 0 && (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontStyle: 'italic' }}>No pharmacological agents added to this clinical record yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="pd-card">
                <h3 className="pd-card-subtitle">Last 3 Consultations</h3>
                <div className="pd-mini-history">
                  <div className="pd-history-item-mini">
                    <span className="pd-h-date">Mar 02, 2026</span>
                    <div className="pd-h-info">
                      <strong>General Checkup</strong>
                      <p>BP stable, patient advised to maintain low sodium diet.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </DoctorLayout>
  )
}

function VitalField({ label, unit, value, onChange }: any) {
  return (
    <div className="pd-vital-field">
      <label>{label}</label>
      <div className="pd-vital-input-group">
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
        <span>{unit}</span>
      </div>
    </div>
  )
}

export default Consultation
