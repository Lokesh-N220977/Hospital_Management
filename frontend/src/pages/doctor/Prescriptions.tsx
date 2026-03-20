import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { Search, PlusCircle, Download, Calendar, Pill, X, CheckCircle, Clock, Loader2, User } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { 
    getPortalProfile, 
    getIssuedPrescriptions, 
    issuePrescription, 
    getDoctorPatients 
} from "../../services/doctorService"

function Prescriptions() {
  const [prescList, setPrescList] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [viewPrescModal, setViewPrescModal] = useState(false)
  const [selectedPresc, setSelectedPresc] = useState<any>(null)
  const [patientSearch, setPatientSearch] = useState("")
  const [showPatientList, setShowPatientList] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  const formRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const [newPresc, setNewPresc] = useState({
    medicine: "",
    strength: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: ""
  })

  useEffect(() => {
    const initData = async () => {
      setLoading(true)
      try {
        const prof = await getPortalProfile()
        setProfile(prof)
        
        if (prof?.doctor_id) {
          const [prescs, pats] = await Promise.all([
            getIssuedPrescriptions(prof.doctor_id),
            getDoctorPatients(prof.doctor_id)
          ])
          setPrescList(prescs || [])
          setPatients(pats || [])
        }
      } catch (err) {
        console.error("Failed to load prescriptions data:", err)
      } finally {
        setLoading(false)
      }
    }
    initData()
  }, [])

  // Handle incoming state from Dashboard
  useEffect(() => {
    if (location.state?.openForm) {
      setShowNewForm(true)
    }
  }, [location.state])

  const openViewModal = (presc: any) => {
    setSelectedPresc(presc)
    setViewPrescModal(true)
  }

  const handleDownload = (prescId: string) => {
    window.open(`http://localhost:8000/api/v1/prescriptions/${prescId}/download`, '_blank');
  }

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient)
    setPatientSearch(patient.name)
    setShowPatientList(false)
  }

  const handleAddPrescription = async () => {
    if (!selectedPatient || !newPresc.medicine || !newPresc.dosage) {
      return alert("Please select a patient and provide medicine details.")
    }

    setIsSubmitting(true)
    try {
      const payload = {
        patient_id: selectedPatient.id,
        patient_name: selectedPatient.name,
        doctor_id: profile.doctor_id,
        doctor_name: profile.name,
        medicine: newPresc.medicine,
        strength: newPresc.strength,
        dosage: newPresc.dosage,
        frequency: newPresc.frequency || "Daily",
        duration: newPresc.duration,
        instructions: newPresc.instructions
      }

      const res = await issuePrescription(payload)
      
      if (res) {
        // Success Animation & State Update
        const updatedList = await getIssuedPrescriptions(profile.doctor_id)
        setPrescList(updatedList)
        setShowNewForm(false)
        setNewPresc({ medicine: "", strength: "", dosage: "", frequency: "", duration: "", instructions: "" })
        setSelectedPatient(null)
        setPatientSearch("")
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      alert("Failed to issue prescription. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DoctorLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
          <Loader2 className="animate-spin" size={48} color="#0dcb6e" />
        </div>
      </DoctorLayout>
    )
  }

  return (
    <DoctorLayout>
      <div className="pd-page">
        <div className="pd-header">
          <div className="pd-header-content">
            <h1 className="pd-page-title">Digital Prescription Hub</h1>
            <p className="pd-page-sub">Directly issue pharmacological orders to patient records.</p>
          </div>
          <div className="pd-header-actions">
            <button
              className="pd-action-btn-primary"
              onClick={() => setShowNewForm(true)}
              style={{ padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <PlusCircle size={20} />
              <span>Issue New Order</span>
            </button>
          </div>
        </div>

        {/* Prescription Cards Grid */}
        <div className="pd-prescriptions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {prescList.length === 0 ? (
            <div className="pd-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
               <Pill size={48} style={{ margin: '0 auto 16px', color: '#94a3b8' }} />
               <h3 style={{ fontWeight: 800, color: '#475569' }}>No prescriptions issued yet</h3>
               <p style={{ color: '#64748b' }}>Start by clicking the "Issue New Order" button.</p>
            </div>
          ) : prescList.map((presc) => (
            <div key={presc.id} className="pd-card pd-presc-card" style={{ 
              transition: 'all 0.3s ease',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}>
              <div style={{ 
                height: '4px', 
                background: presc.status === 'Active' ? 'linear-gradient(90deg, #10b981, #3b82f6)' : '#cbd5e1' 
              }} />
              
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                      <User size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{presc.patient_name}</h3>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>ID: {presc.patient_id?.substring(0,8)}...</p>
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    padding: '4px 10px', 
                    borderRadius: '20px',
                    background: presc.status === 'Active' ? '#f0fdf4' : '#f1f5f9',
                    color: presc.status === 'Active' ? '#166534' : '#475569',
                    textTransform: 'uppercase'
                  }}>
                    {presc.status}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #f1f5f9' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{presc.medicine} {presc.strength}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      <strong style={{ color: '#475569' }}>Dosage:</strong> {presc.dosage}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      <strong style={{ color: '#475569' }}>Dur:</strong> {presc.duration}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <Calendar size={14} />
                     <span>{presc.date}</span>
                   </div>
                   <div style={{ display: 'flex', gap: '8px' }}>
                     <button className="pd-action-btn-secondary" style={{ padding: '6px', borderRadius: '8px' }} onClick={() => handleDownload(presc.id)}>
                       <Download size={16} />
                     </button>
                     <button 
                        onClick={() => openViewModal(presc)}
                        style={{ padding: '6px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                     >
                       DETAILS
                     </button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* In-page New Prescription Form */}
        {showNewForm && (
          <div id="new-prescription-form" className="pd-modal-overlay" style={{ zIndex: 1000 }}>
            <div className="pd-modal" style={{ maxWidth: '700px', width: '95%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Issue Clinical Prescription</h2>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Fill in medication details for the patient's pharmacological record.</p>
                </div>
                <button onClick={() => setShowNewForm(false)} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="pd-field" style={{ gridColumn: '1 / -1', position: 'relative' }}>
                  <label style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>Search Patient</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="pd-input"
                      placeholder="Type patient name..."
                      style={{ paddingLeft: '48px' }}
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value)
                        setShowPatientList(true)
                      }}
                      onFocus={() => setShowPatientList(true)}
                    />
                  </div>
                  {showPatientList && (
                    <div className="pd-card" style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                      maxHeight: '200px', overflowY: 'auto', padding: '8px', marginTop: '8px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0'
                    }}>
                      {patients
                        .filter(p => !patientSearch || p.name?.toLowerCase().includes(patientSearch.toLowerCase()))
                        .map((p, i) => (
                          <div
                            key={i}
                            className="pd-break-item"
                            style={{ padding: '12px', cursor: 'pointer', borderRadius: '8px', marginBottom: '4px' }}
                            onClick={() => handleSelectPatient(p)}
                          >
                            <div style={{ fontWeight: 700 }}>{p.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ID: {p.id}</div>
                          </div>
                        ))
                      }
                      {patients.length === 0 && <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No patients found</div>}
                    </div>
                  )}
                </div>

                <div className="pd-field">
                  <label style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>Medicine Name</label>
                  <input
                    type="text"
                    className="pd-input"
                    placeholder="e.g. Paracetamol"
                    value={newPresc.medicine}
                    onChange={(e) => setNewPresc({ ...newPresc, medicine: e.target.value })}
                  />
                </div>
                <div className="pd-field">
                  <label style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>Strength/Pack</label>
                  <input
                    type="text"
                    className="pd-input"
                    placeholder="e.g. 500mg"
                    value={newPresc.strength}
                    onChange={(e) => setNewPresc({ ...newPresc, strength: e.target.value })}
                  />
                </div>
                <div className="pd-field">
                  <label style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>Dosage (e.g. 1-0-1)</label>
                  <input
                    type="text"
                    className="pd-input"
                    placeholder="Morning-Noon-Night"
                    value={newPresc.dosage}
                    onChange={(e) => setNewPresc({ ...newPresc, dosage: e.target.value })}
                  />
                </div>
                <div className="pd-field">
                  <label style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>Duration</label>
                  <input
                    type="text"
                    className="pd-input"
                    placeholder="e.g. 7 Days"
                    value={newPresc.duration}
                    onChange={(e) => setNewPresc({ ...newPresc, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="pd-field">
                <label style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>Usage Instructions</label>
                <textarea
                  className="pd-textarea"
                  placeholder="e.g. Take after meals with lukewarm water..."
                  style={{ minHeight: "100px" }}
                  value={newPresc.instructions}
                  onChange={(e) => setNewPresc({ ...newPresc, instructions: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button className="pd-action-btn-secondary" onClick={() => setShowNewForm(false)}>Discard Draft</button>
                <button
                  className="pd-action-btn-primary"
                  style={{ minWidth: '180px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  onClick={handleAddPrescription}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <span>Digital Sign & Issue</span>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Prescription Modal */}
      {viewPrescModal && selectedPresc && (
        <div className="pd-modal-overlay">
          <div className="pd-modal" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800 }}>Rx Prescription Record</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Authorized by Dr. {selectedPresc.doctor_name}</p>
              </div>
              <button onClick={() => setViewPrescModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ border: '2px solid #f1f5f9', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
               <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.05 }}>
                 <Pill size={120} />
               </div>
               
               <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Patient</label>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 700, fontSize: '1.1rem' }}>{selectedPresc.patient_name}</p>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Medicine</label>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 700 }}>{selectedPresc.medicine} {selectedPresc.strength}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Dosage</label>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 700 }}>{selectedPresc.dosage}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Duration</label>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 700 }}>{selectedPresc.duration}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Date</label>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 700 }}>{selectedPresc.date}</p>
                  </div>
               </div>

               <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Instructions</label>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>{selectedPresc.instructions || "No specific instructions provided. Follow standard dosage."}</p>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button className="pd-action-btn-secondary" style={{ flex: 1 }} onClick={() => setViewPrescModal(false)}>Close</button>
              <button className="pd-action-btn-primary" style={{ flex: 1 }} onClick={() => handleDownload(selectedPresc?.id)}><Download size={18} /> Get PDF</button>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}

export default Prescriptions
