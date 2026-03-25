import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { Search, PlusCircle, Download, Calendar, Pill, X, CheckCircle, Clock, Loader2, User } from "lucide-react"
import { useState, useEffect } from "react"
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
    window.open(`/prescription/${prescId}/print`, '_blank');
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
              style={{ padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)' }}
            >
              <PlusCircle size={20} />
              <span>Issue New Order</span>
            </button>
          </div>
        </div>

        {/* Prescription Cards Grid */}
        <div className="pd-prescriptions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', marginTop: '30px', minHeight: '200px' }}>
          {!prescList || prescList.length === 0 ? (
            <div className="pd-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', background: 'rgba(248, 250, 252, 0.8)', border: '2px dashed #cbd5e1', borderRadius: '24px' }}>
               <Pill size={64} style={{ margin: '0 auto 16px', color: '#94a3b8', opacity: 0.5 }} />
               <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#475569' }}>No prescriptions issued yet</h3>
               <p style={{ color: '#64748b', maxWidth: '400px', margin: '8px auto' }}>Start by clicking the "Issue New Order" button to provide clinical medication guidance to your patients.</p>
            </div>
          ) : prescList.map((presc) => (
            <div key={presc.id} className="pd-presc-card">
              <div style={{ 
                height: '6px', 
                background: presc.status === 'Active' ? 'linear-gradient(90deg, #10b981, #3b82f6)' : '#cbd5e1' 
              }} />
              
              <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '22px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                      <User size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.3px' }}>{presc.patient_name || "Unknown Patient"}</h3>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Reg ID: {String(presc.patient_id || "").substring(0,8)}</p>
                    </div>
                  </div>
                  <span className={`pd-presc-status-badge ${presc.status === 'Active' ? 'active' : 'completed'}`}>
                    {presc.status}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', marginBottom: '24px', border: '1.5px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                      <Pill size={16} />
                    </div>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{presc.medicine}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#fff', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{presc.strength}</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dosage Protocol</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={12} /> {presc.dosage}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>{presc.duration}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                     <Calendar size={14} />
                     <span>{presc.date}</span>
                   </div>
                   <div style={{ display: 'flex', gap: '12px' }}>
                     <button 
                        className="pd-action-icon-btn" 
                        title="Download Document"
                        style={{ width: '40px', height: '40px', borderRadius: '12px', border: '2px solid #f1f5f9' }}
                        onClick={(e) => { e.stopPropagation(); handleDownload(presc.id); }}
                     >
                       <Download size={18} />
                     </button>
                     <button 
                        onClick={() => openViewModal(presc)}
                        style={{ padding: '10px 24px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 8px 15px rgba(30, 41, 59, 0.15)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#0f172a'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#1e293b'; }}
                     >
                       OPEN
                     </button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Minimal New Prescription Form */}
        {showNewForm && (
          <div className="pd-modal-overlay">
            <div className="pd-modal" style={{ maxWidth: '450px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>New Prescription</h3>
                <button 
                  onClick={() => setShowNewForm(false)} 
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Patient Search */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Select Patient</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search patient..."
                      style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value)
                        setShowPatientList(true)
                      }}
                    />
                    {selectedPatient && !showPatientList && (
                       <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#10b981' }}><CheckCircle size={16}/></span>
                    )}
                  </div>
                  
                  {showPatientList && (
                    <div style={{ marginTop: '4px', maxHeight: '150px', overflowY: 'auto', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', position: 'absolute', width: '100%', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      {Array.isArray(patients) && patients.length > 0 ? (
                        patients.filter(p => !patientSearch || (p.name && p.name.toLowerCase().includes(patientSearch.toLowerCase()))).map((p, i) => (
                          <div
                            key={i}
                            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}
                            onClick={() => handleSelectPatient(p)}
                          >
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {p.id}</div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>No patients found</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Medicine & Dosage Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Medicine</label>
                    <input 
                      type="text" placeholder="Compound name" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                      value={newPresc.medicine} onChange={(e) => setNewPresc({ ...newPresc, medicine: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Strength</label>
                    <input 
                      type="text" placeholder="e.g. 500mg" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                      value={newPresc.strength} onChange={(e) => setNewPresc({ ...newPresc, strength: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Dosage</label>
                    <input 
                      type="text" placeholder="e.g. 1-0-1" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                      value={newPresc.dosage} onChange={(e) => setNewPresc({ ...newPresc, dosage: e.target.value })} 
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Duration</label>
                    <input 
                      type="text" placeholder="e.g. 5 days" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                      value={newPresc.duration} onChange={(e) => setNewPresc({ ...newPresc, duration: e.target.value })} 
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Instructions</label>
                    <textarea 
                      placeholder="Notes for the patient..." 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'none', height: '60px' }}
                      value={newPresc.instructions} onChange={(e) => setNewPresc({ ...newPresc, instructions: e.target.value })} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    onClick={() => setShowNewForm(false)} 
                    style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddPrescription} disabled={isSubmitting}
                    style={{ flex: 1, padding: '12px', background: '#0dcb6e', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Issue Prescription"}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Prescription Modal */}
      {viewPrescModal && selectedPresc && (
        <div className="pd-modal-overlay-premium">
          <div className="pd-premium-modal" style={{ maxWidth: '550px', padding: '50px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                   <div style={{ width: '32px', height: '4px', borderRadius: '10px', background: '#3b82f6' }}></div>
                   <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px' }}>Clinical Record</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.2px' }}>Digital Prescription</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Authorized by Dr. {selectedPresc.doctor_name}</p>
              </div>
              <button 
                onClick={() => setViewPrescModal(false)} 
                style={{ background: '#f8fafc', border: '1.5px solid #f1f5f9', padding: '10px', borderRadius: '14px', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.3s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#1e293b'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ border: '2px solid #f1f5f9', borderRadius: '28px', padding: '32px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(to bottom, #ffffff, #fcfdfe)' }}>
               <div style={{ position: 'absolute', right: '-30px', bottom: '-20px', opacity: 0.04, transform: 'rotate(-15deg)' }}>
                 <Pill size={160} color="#10b981" />
               </div>
               
               <div style={{ marginBottom: '28px' }}>
                  <label className="pd-label-premium" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Patient Name</label>
                  <p style={{ margin: '0', fontWeight: 800, fontSize: '1.25rem', color: '#1e293b' }}>{selectedPresc.patient_name}</p>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                  <div>
                    <label className="pd-label-premium" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Medication</label>
                    <p style={{ margin: '0', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}><Pill size={14} color="#3b82f6" /> {selectedPresc.medicine}</p>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', marginTop: '6px', display: 'inline-block' }}>{selectedPresc.strength}</span>
                  </div>
                  <div>
                    <label className="pd-label-premium" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Dosage</label>
                    <p style={{ margin: '0', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} color="#f59e0b" /> {selectedPresc.dosage}</p>
                  </div>
                  <div>
                    <label className="pd-label-premium" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Course Duration</label>
                    <p style={{ margin: '0', fontWeight: 700, color: '#1e293b' }}>{selectedPresc.duration}</p>
                  </div>
                  <div>
                    <label className="pd-label-premium" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Issue Date</label>
                    <p style={{ margin: '0', fontWeight: 700, color: '#1e293b' }}>{selectedPresc.date}</p>
                  </div>
               </div>

               <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1.5px dashed #e2e8f0' }}>
                  <label className="pd-label-premium" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Administrative Guidance</label>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, fontWeight: 500 }}>{selectedPresc.instructions || "No specific administration instructions provided. Follow standard clinical protocols."}</p>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
              <button 
                className="pd-action-btn-secondary" 
                style={{ flex: 1, padding: '16px', borderRadius: '18px', fontWeight: 800 }} 
                onClick={() => setViewPrescModal(false)}
              >
                Close Record
              </button>
              <button 
                className="pd-action-btn-primary" 
                style={{ flex: 1.2, padding: '16px', borderRadius: '18px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', fontWeight: 900, boxShadow: '0 15px 30px rgba(16, 185, 129, 0.25)' }} 
                onClick={() => handleDownload(selectedPresc?.id)}
              >
                <Download size={20} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}

export default Prescriptions
