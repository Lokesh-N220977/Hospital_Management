import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { Search, Plus, Download, Calendar, Pill } from "lucide-react"
import { useState } from "react"

const prescriptions = [
  { id: 1, patient: "John Doe", date: "March 10, 2026", medicine: "Amlodipine 5mg", dosage: "1-0-1", duration: "30 Days", status: "Active" },
  { id: 2, patient: "Jane Smith", date: "March 12, 2026", medicine: "Metformin 500mg", dosage: "1-1-1", duration: "90 Days", status: "Active" },
  { id: 3, patient: "Robert Brown", date: "March 05, 2026", medicine: "Atorvastatin 20mg", dosage: "0-0-1", duration: "30 Days", status: "Active" },
  { id: 4, patient: "Alice Cooper", date: "February 28, 2026", medicine: "Lisinopril 10mg", dosage: "1-0-0", duration: "60 Days", status: "Expired" },
  { id: 5, patient: "Samuel Jackson", date: "March 02, 2026", medicine: "Amoxicillin 500mg", dosage: "1-0-1", duration: "7 Days", status: "Completed" },
]

function Prescriptions() {
  const [newPrescModal, setNewPrescModal] = useState(false)
  const [viewPrescModal, setViewPrescModal] = useState(false)
  const [selectedPresc, setSelectedPresc] = useState<any>(null)

  const openViewModal = (presc: any) => {
    setSelectedPresc(presc)
    setViewPrescModal(true)
  }

  const handleDownload = () => {
    alert("Downloading PDF document...")
  }

  return (
    <DoctorLayout>
      <div className="pd-page">
        <div className="pd-header">
          <div className="pd-header-content">
            <h1 className="pd-page-title">Prescriptions</h1>
            <p className="pd-page-sub">View and manage all medications prescribed to your patients.</p>
          </div>
          <div className="pd-header-actions">
            <div className="pd-search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search by patient or medicine..." />
            </div>
            <button className="pd-action-btn-primary" onClick={() => setNewPrescModal(true)}>
              <Plus size={18} />
              <span>New Prescription</span>
            </button>
          </div>
        </div>

        <div className="pd-prescriptions-grid">
          {prescriptions.map((presc) => (
            <div key={presc.id} className="pd-card pd-presc-card">
              <div className="pd-presc-header">
                <div className="pd-presc-icon-wrap">
                  <Pill size={24} />
                </div>
                <div className="pd-presc-meta">
                  <h3 className="pd-presc-patient">{presc.patient}</h3>
                  <span className="pd-presc-date">{presc.date}</span>
                </div>
              </div>
              
              <div className="pd-presc-body">
                <div className="pd-medicine-info">
                  <p className="pd-medicine-name">{presc.medicine}</p>
                  <p className="pd-medicine-dosage">Dosage: {presc.dosage}</p>
                </div>
                <div className="pd-presc-details">
                  <div className="pd-detail-item">
                    <Calendar size={14} />
                    <span>{presc.duration}</span>
                  </div>
                  <span className={`pd-status-pill pd-status--${presc.status.toLowerCase()}`}>
                    {presc.status}
                  </span>
                </div>
              </div>

              <div className="pd-presc-footer">
                <button className="pd-presc-btn-secondary" onClick={handleDownload}>
                  <Download size={16} />
                  <span>Download PDF</span>
                </button>
                <button className="pd-presc-btn-primary" onClick={() => openViewModal(presc)}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Prescription Modal */}
      {newPrescModal && (
        <div className="pd-modal-overlay">
          <div className="pd-modal">
            <h3>New Prescription</h3>
            <p className="pd-modal-desc">Create a new prescription for a patient.</p>
            <div className="pd-form-grid" style={{ marginBottom: 16 }}>
              <div className="pd-field">
                <label>Patient ID / Name</label>
                <input type="text" className="pd-input" placeholder="Search patient..." />
              </div>
              <div className="pd-field">
                <label>Medicine Name</label>
                <input type="text" className="pd-input" placeholder="e.g. Paracetamol 500mg" />
              </div>
              <div className="pd-field">
                <label>Dosage</label>
                <input type="text" className="pd-input" placeholder="e.g. 1-0-1" />
              </div>
              <div className="pd-field">
                <label>Duration</label>
                <input type="text" className="pd-input" placeholder="e.g. 5 Days" />
              </div>
            </div>
            <div className="pd-field">
              <label>Special Instructions</label>
              <textarea className="pd-textarea" placeholder="Take after food..." style={{ minHeight: "80px" }} />
            </div>
            <div className="pd-modal-actions" style={{ marginTop: 24 }}>
              <button className="pd-action-btn-secondary" onClick={() => setNewPrescModal(false)}>Cancel</button>
              <button className="pd-action-btn-primary" onClick={() => { alert("Prescription Created!"); setNewPrescModal(false); }}>Save Prescription</button>
            </div>
          </div>
        </div>
      )}

      {/* View Prescription Modal */}
      {viewPrescModal && selectedPresc && (
        <div className="pd-modal-overlay">
          <div className="pd-modal">
            <h3>Prescription Details</h3>
            <p className="pd-modal-desc">Prescribed to {selectedPresc.patient} on {selectedPresc.date}</p>
            
            <div className="pd-card" style={{ background: "#f8fafc", padding: "20px", marginTop: "16px", marginBottom: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>MEDICINE</label>
                  <p style={{ fontWeight: 600, color: "#1e293b", margin: "4px 0 0 0" }}>{selectedPresc.medicine}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>DOSAGE</label>
                  <p style={{ fontWeight: 600, color: "#1e293b", margin: "4px 0 0 0" }}>{selectedPresc.dosage}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>DURATION</label>
                  <p style={{ fontWeight: 600, color: "#1e293b", margin: "4px 0 0 0" }}>{selectedPresc.duration}</p>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>STATUS</label>
                  <p style={{ fontWeight: 600, color: "#1e293b", margin: "4px 0 0 0" }}>{selectedPresc.status}</p>
                </div>
              </div>
              <div style={{ marginTop: "16px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>INSTRUCTIONS</label>
                <p style={{ fontSize: "0.9rem", color: "#475569", margin: "4px 0 0 0" }}>Take one tablet in the morning and one at night after meals. Drink plenty of water. Please continue this medication strictly for the prescribed duration to ensure full recovery.</p>
              </div>
            </div>

            <div className="pd-modal-actions">
              <button className="pd-action-btn-secondary" onClick={() => setViewPrescModal(false)}>Close</button>
              <button className="pd-action-btn-primary" onClick={handleDownload}><Download size={16} /> Download Copy</button>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}

export default Prescriptions
