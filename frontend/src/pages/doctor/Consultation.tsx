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
              <div className="pd-card">
                <div className="pd-card-header">
                  <h3 className="pd-card-subtitle">Add New Prescription</h3>
                </div>
                <div className="pd-form-grid" style={{ marginBottom: 20 }}>
                  <div className="pd-field">
                    <label>Medicine Name</label>
                    <input
                      type="text"
                      className="pd-input"
                      placeholder="e.g. Paracetamol 500mg"
                      value={medInput.name}
                      onChange={(e) => setMedInput({ ...medInput, name: e.target.value })}
                    />
                  </div>
                  <div className="pd-field">
                    <label>Dosage</label>
                    <input
                      type="text"
                      className="pd-input"
                      placeholder="e.g. 1-0-1"
                      value={medInput.dosage}
                      onChange={(e) => setMedInput({ ...medInput, dosage: e.target.value })}
                    />
                  </div>
                  <div className="pd-field">
                    <label>Duration</label>
                    <input
                      type="text"
                      className="pd-input"
                      placeholder="e.g. 5 Days"
                      value={medInput.duration}
                      onChange={(e) => setMedInput({ ...medInput, duration: e.target.value })}
                    />
                  </div>
                  <div className="pd-field" style={{ justifyContent: 'flex-end', display: 'flex' }}>
                    <button className="pd-action-btn-primary" style={{ height: '48px', width: '100%' }} onClick={addMedicine}>
                      <Plus size={18} /> Add Medicine
                    </button>
                  </div>
                </div>

                <div className="pd-presc-table-wrap">
                  <table className="pd-tiny-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Duration</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((m, i) => (
                        <tr key={i}>
                          <td>{m.name}</td>
                          <td>{m.dosage}</td>
                          <td>{m.duration}</td>
                          <td><button className="pd-text-danger" onClick={() => removeMedicine(i)}><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                      {medicines.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No medicines added yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
