import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { useParams, useNavigate } from "react-router-dom"
import { 
  ArrowLeft, CheckCircle, Activity, FileText, Pill, 
  History, Plus, Trash2 
} from "lucide-react"
import { useState } from "react"

function Consultation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("notes")
  
  // id will be used for patient data loading in future
  console.log("Loading consultation for patient:", id)

  return (
    <DoctorLayout>
      <div className="pd-page">
        {/* Header with Back button and Patient Quick Info */}
        <div className="pd-header-top">
          <button className="pd-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back to Schedule
          </button>
          <div className="pd-header-actions">
            <button className="pd-action-btn-primary" onClick={() => navigate("/doctor/dashboard")}>
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
            {/* Quick overview of previous vitals */}
            <div className="pd-mini-vital">
              <span className="pd-mv-label">BP</span>
              <span className="pd-mv-val">120/80</span>
            </div>
            <div className="pd-mini-vital">
              <span className="pd-mv-label">Temp</span>
              <span className="pd-mv-val">98.6°F</span>
            </div>
          </div>
        </div>

        <div className="pd-consultation-layout">
          {/* Main Workspace Tabs */}
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

          {/* Tab Content Areas */}
          <main className="pd-consultation-content">
            {activeTab === "notes" && (
              <div className="pd-card-grid">
                <div className="pd-card pd-full-width">
                  <h3 className="pd-card-subtitle">Chief Complaints & History</h3>
                  <textarea className="pd-textarea-large" placeholder="Enter patient complaints and subjective history..."></textarea>
                </div>
                <div className="pd-card">
                  <h3 className="pd-card-subtitle">Physical Examination</h3>
                  <textarea className="pd-textarea" placeholder="Type examination findings..."></textarea>
                </div>
                <div className="pd-card">
                  <h3 className="pd-card-subtitle">Diagnosis (ICD-10)</h3>
                  <div className="pd-diagnosis-input-wrap">
                    <input type="text" className="pd-input" placeholder="Search ICD-10 code..." />
                    <button className="pd-add-btn"><Plus size={18} /></button>
                  </div>
                  <div className="pd-selected-tags">
                    <span className="pd-tag">I10 - Hypertension <XCircleSmall /></span>
                    <span className="pd-tag">E11 - Type 2 Diabetes <XCircleSmall /></span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "vitals" && (
              <div className="pd-card">
                <h3 className="pd-card-subtitle">Patient Vital Signs</h3>
                <div className="pd-vitals-grid-consult">
                  <VitalField label="BP" unit="mmHg" placeholder="120/80" />
                  <VitalField label="Heart Rate" unit="bpm" placeholder="72" />
                  <VitalField label="Temp" unit="°F" placeholder="98.6" />
                  <VitalField label="SpO2" unit="%" placeholder="98" />
                  <VitalField label="Weight" unit="kg" placeholder="70" />
                  <VitalField label="Height" unit="cm" placeholder="175" />
                </div>
              </div>
            )}

            {activeTab === "presc" && (
              <div className="pd-card">
                <div className="pd-card-header">
                  <h3 className="pd-card-subtitle">Active Prescriptions</h3>
                  <button className="pd-action-btn-primary pd-btn-sm"><Plus size={16} /> Add Med</button>
                </div>
                <div className="pd-presc-table-wrap">
                  <table className="pd-tiny-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Duration</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Amlodipine 5mg</td>
                        <td>1-0-1 (After Food)</td>
                        <td>30 Days</td>
                        <td><button className="text-red-500"><Trash2 size={16} /></button></td>
                      </tr>
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

function VitalField({ label, unit, placeholder }: any) {
  return (
    <div className="pd-vital-field">
      <label>{label}</label>
      <div className="pd-vital-input-group">
        <input type="text" placeholder={placeholder} />
        <span>{unit}</span>
      </div>
    </div>
  )
}

function XCircleSmall() {
  return <span style={{ marginLeft: '6px', cursor: 'pointer', color: '#ef4444' }}>×</span>
}

export default Consultation
