import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import PatientLayout from "../../components/layout/patient/PatientLayout"
import {
  Search, ChevronRight,
  CheckCircle2, User, Loader2, Activity,
  Zap, Calendar, HeartPulse, ChevronLeft,
  Clock, AlertTriangle, Users
} from "lucide-react"
import { appointmentService, type Doctor } from "../../services/appointment.service"

const specialties = ["All", "Cardiology", "Dermatology", "Orthopedics", "Neurology", "Pediatrics", "Ophthalmology"]

const SYMPTOMS_LIST = [
  { label: "Chest Pain", priority: "EMERGENCY" },
  { label: "Breathing Difficulty", priority: "EMERGENCY" },
  { label: "Unconscious", priority: "EMERGENCY" },
  { label: "High Fever", priority: "URGENT" },
  { label: "Severe Pain", priority: "URGENT" },
  { label: "Cough", priority: "NORMAL" },
  { label: "Cold", priority: "NORMAL" },
  { label: "Headache", priority: "NORMAL" },
  { label: "Body Ache", priority: "NORMAL" }
]

function BookAppointment() {
  const navigate = useNavigate()
  const dateInputRef = useRef<HTMLInputElement>(null)
  
  // 1: Mode/Patient, 2: Criteria, 3: Doctor Selection, 4: Slot/Confirm
  const [step, setStep] = useState(1) 
  const [bookingMode, setBookingMode] = useState<"standard" | "emergency">("standard")
  
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState("")

  // Patient Info
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  
  // Standard Booking
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState("All")
  const [doctorSearch, setDoctorSearch] = useState("")
  
  // Emergency Booking
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [customSymptom, setCustomSymptom] = useState("")
  const [emergencySlot, setEmergencySlot] = useState<any>(null)

  // Selection state
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  
  const [availability, setAvailability] = useState<any[]>([])
  const [backendReason, setBackendReason] = useState<string | null>(null)
  const [backendMessage, setBackendMessage] = useState<string | null>(null)
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([])
  const [selectedSlot, setSelectedSlot] = useState<any>(null)

  const [idempotencyKey] = useState(crypto.randomUUID())

  // Initialization
  useEffect(() => {
    const initData = async () => {
      setLoading(true)
      try {
        const patientsData = await appointmentService.getMyPatients()
        setPatients(patientsData)
        if (patientsData.length > 0) {
          const self = patientsData.find((p: any) => p.created_by === 'self')
          setSelectedPatient(self ? self._id : patientsData[0]._id)
        }
      } catch (err) { setError("Failed to initialize booking data.") }
      finally { setLoading(false) }
    }
    initData()
  }, [])

  // Fetch Doctors for Standard Mode
  useEffect(() => {
    if (bookingMode !== "standard") return;
    const fetchDoctors = async () => {
      setLoading(true)
      try {
        const data = await appointmentService.getDoctors(selectedSpecialty)
        setDoctorsList(data)
      } catch (err) { setError("Failed to fetch doctors.") }
      finally { setLoading(false) }
    }
    fetchDoctors()
  }, [selectedSpecialty, bookingMode])

  // Fetch Slots for Standard mode
  useEffect(() => {
    if (bookingMode === "standard" && selectedDoctor && selectedDate) {
      const fetchAvailability = async () => {
        setLoading(true)
        setAvailability([])
        setBackendReason(null)
        setBackendMessage(null)
        setRecommendedDoctors([])
        setSelectedSlot(null)
        try {
          const res: any = await appointmentService.getHardenedAvailability(
              selectedDoctor._id || selectedDoctor.doctor_id, 
              selectedDate
          )
          // Handle the new response structure
          if (res && res.reason) {
              setAvailability(res.slots || [])
              setBackendReason(res.reason)
              setBackendMessage(res.message)
              
              if ((res.reason === "LEAVE" || res.slots.length === 0) && selectedDoctor.specialization) {
                  // Fetch recommendations of same department
                  const recs = await appointmentService.getDoctors(selectedDoctor.specialization);
                  setRecommendedDoctors(recs.filter((d: any) => (d._id || d.doctor_id) !== (selectedDoctor._id || selectedDoctor.doctor_id)));
              }
          } else {
              setAvailability(res || [])
          }
        } catch (err) { setError("Failed to fetch availability.") }
        finally { setLoading(false) }
      }
      fetchAvailability()
    }
  }, [selectedDoctor, selectedDate, bookingMode])

  const toggleSymptom = (s: string) => {
    if (selectedSymptoms.includes(s)) {
      setSelectedSymptoms(selectedSymptoms.filter((item) => item !== s))
    } else {
      setSelectedSymptoms([...selectedSymptoms, s])
    }
  }

  // Auto-advance logic for Step 1
  const handleModeChange = (mode: "standard" | "emergency") => {
    setBookingMode(mode);
    if (selectedPatient) {
        setStep(2);
    }
  }

  const handlePatientChange = (patientId: string) => {
    setSelectedPatient(patientId);
    if (bookingMode) {
        setStep(2);
    }
  }

  // Auto-advance logic for Step 2
  const handleSpecialtyChange = (spec: string) => {
    setSelectedSpecialty(spec);
    setStep(3);
  }

  // Auto-advance logic for Step 3
  const handleDoctorChange = (doc: any) => {
    setSelectedDoctor(doc);
    setStep(4);
  }

  const handleFetchEmergency = async () => {
      if (selectedSymptoms.length === 0 && !customSymptom) {
          setError("Please select or enter key symptoms.")
          return
      }
      setError("")
      setLoading(true)
      const query = [...selectedSymptoms, customSymptom].filter(Boolean).join(", ")
      try {
          const slot = await appointmentService.getEmergencySlot(query, selectedDate)
          if (slot) {
              setEmergencySlot(slot)
              setStep(3) // Emergency goes straight to review
          } else {
              setError("No emergency slots available matching criteria.")
          }
      } catch (err) {
          setError("Failed to locate emergency slots.")
      } finally {
          setLoading(false)
      }
  }

  const confirmBooking = async () => {
    setBookingLoading(true)
    setError("")

    try {
      let payloadDoctorId = "";
      let payloadSlot = "";
      let payloadDate = selectedDate;
      let payloadSymptoms = [...selectedSymptoms, customSymptom].filter(Boolean);

      if (bookingMode === "emergency" && emergencySlot) {
          payloadDoctorId = emergencySlot.doctor_id;
          payloadSlot = emergencySlot.time;
          payloadDate = emergencySlot.date;
      } else {
          if (!selectedSlot || !selectedDoctor) throw new Error("Missing selection");
          payloadDoctorId = selectedDoctor._id || selectedDoctor.doctor_id;
          payloadSlot = selectedSlot.time;
      }

      const res = await appointmentService.bookHardenedAppointment({
        doctor_id: payloadDoctorId,
        patient_id: selectedPatient!,
        date: payloadDate,
        slot_time: payloadSlot,
        symptoms: payloadSymptoms,
        idempotency_key: idempotencyKey
      })

      if (res?.message) {
        setStep(5) // Success
      } else {
        throw new Error("Invalid response")
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Booking failed! Slot might have just got filled.")
    } finally {
      setBookingLoading(false)
    }
  }

  const renderProgress = () => {
    const totalSteps = bookingMode === "emergency" ? 3 : 4
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', gap: '15px' }}>
        {[...Array(totalSteps)].map((_, i) => {
          const isDone = step > i + 1;
          const isCurrent = step === i + 1;
          const canClick = isDone || (step > 1 && i + 1 < step); 
          return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div 
              onClick={() => canClick && setStep(i + 1)}
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: isDone ? '#10b981' : isCurrent ? '#3b82f6' : '#fff', 
                border: isCurrent || isDone ? 'none' : '2px solid #e2e8f0',
                color: isDone || isCurrent ? '#fff' : '#94a3b8', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 800, 
                fontSize: '1rem',
                transition: '0.3s', 
                cursor: canClick ? 'pointer' : 'default', 
                boxShadow: isCurrent ? '0 0 15px rgba(59,130,246,0.3)' : 'none' 
              }}>
              {isDone ? <CheckCircle2 size={24} /> : i + 1}
            </div>
            {i < totalSteps - 1 && <div style={{ height: '3px', width: '40px', background: isDone ? '#10b981' : '#e2e8f0', transition: '0.3s' }} />}
          </div>
        )})}
      </div>
    )
  }

  if (step === 5) {
      return (
          <PatientLayout>
              <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                      <CheckCircle2 size={40} />
                  </div>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Appointment Confirmed!</h1>
                  <p style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '40px' }}>Your booking has been successfully protected and locked.</p>
                  <button onClick={() => navigate('/patient/appointments')} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem', borderRadius: '12px' }}>
                      View My Appointments
                  </button>
              </div>
          </PatientLayout>
      )
  }

  return (
    <PatientLayout>
      <div className="pt-page" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>Book Appointment</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>Select your preferred mode and provider to secure your health slot.</p>
        </div>

        {renderProgress()}

        <div style={{ minHeight: '500px' }}>
            {error && (
            <div style={{ padding: '16px', background: '#fef2f2', color: '#991b1b', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, border: '1px solid #fee2e2' }}>
                <Activity size={20} /> {error}
            </div>
            )}

            {/* STEP 1: INITIAL BOOKING MODE & PATIENT SELECTION */}
            {step === 1 && (
            <div className="pt-card" style={{ animation: 'slideUp 0.4s', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '25px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap size={24} color="#3b82f6" /> 1. Booking Type
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div onClick={() => handleModeChange("standard")} style={{ padding: '30px', borderRadius: '20px', border: bookingMode === 'standard' ? '2.5px solid #3b82f6' : '1.5px solid #e2e8f0', cursor: 'pointer', background: bookingMode === 'standard' ? '#eff6ff' : '#fff', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: bookingMode === 'standard' ? 'scale(1.02)' : 'none', position: 'relative' }}>
                        {bookingMode === 'standard' && <div style={{ position: 'absolute', top: '15px', right: '15px' }}><CheckCircle2 color="#3b82f6" size={20} /></div>}
                        <Calendar size={36} color={bookingMode === 'standard' ? '#3b82f6' : '#94a3b8'} style={{ marginBottom: '15px' }} />
                        <h4 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b' }}>Standard Booking</h4>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '8px', lineHeight: 1.5 }}>Select specialist, doctor, and specific schedule natively.</p>
                    </div>
                    <div onClick={() => handleModeChange("emergency")} style={{ padding: '30px', borderRadius: '20px', border: bookingMode === 'emergency' ? '2.5px solid #ef4444' : '1.5px solid #e2e8f0', cursor: 'pointer', background: bookingMode === 'emergency' ? '#fef2f2' : '#fff', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: bookingMode === 'emergency' ? 'scale(1.02)' : 'none', position: 'relative' }}>
                        {bookingMode === 'emergency' && <div style={{ position: 'absolute', top: '15px', right: '15px' }}><CheckCircle2 color="#ef4444" size={20} /></div>}
                        <Zap size={36} color={bookingMode === 'emergency' ? '#ef4444' : '#94a3b8'} style={{ marginBottom: '15px' }} />
                        <h4 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b' }}>Emergency Slot</h4>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '8px', lineHeight: 1.5 }}>Skip to the fastest possible global slot instantly.</p>
                    </div>
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '25px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={24} color="#3b82f6" /> 2. Who is this for?
                </h3>
                {loading && patients.length === 0 ? <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" size={32} color="#3b82f6" /></div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {patients.map(p => (
                    <div key={p._id} onClick={() => handlePatientChange(p._id)} style={{ padding: '24px', borderRadius: '20px', border: selectedPatient === p._id ? '2.5px solid #3b82f6' : '1.5px solid #e2e8f0', cursor: 'pointer', background: selectedPatient === p._id ? '#eff6ff' : '#fff', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.3s', position: 'relative' }}>
                        {selectedPatient === p._id && <div style={{ position: 'absolute', top: '12px', right: '12px' }}><CheckCircle2 color="#3b82f6" size={18} /></div>}
                        <div style={{ background: selectedPatient === p._id ? '#3b82f6' : '#f1f5f9', width: '56px', height: '56px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedPatient === p._id ? '#fff' : '#64748b', transition: '0.3s' }}><User size={28} /></div>
                        <div>
                            <h4 style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>{p.name}</h4>
                            {p.created_by === 'self' && <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: '20px', fontWeight: 800, textTransform: 'uppercase' }}>Self Account</span>}
                        </div>
                    </div>
                    ))}
                </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingTop: '25px', borderTop: '1.5px solid #f1f5f9' }}>
                <button onClick={() => setStep(2)} disabled={!selectedPatient || !bookingMode} className="btn-primary" style={{ padding: '16px 45px', fontSize: '1.1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, opacity: (!selectedPatient || !bookingMode) ? 0.5 : 1 }}>
                    Continue <ChevronRight size={20} />
                </button>
                </div>
            </div>
            )}

            {/* STEP 2: CRITERIA */}
            {step === 2 && bookingMode === "standard" && (
                <div className="pt-card" style={{ animation: 'slideUp 0.4s', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                        <div onClick={() => setStep(1)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}>
                            <ChevronLeft size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>Select Specialization</h3>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
                        {specialties.map(spec => (
                            <button 
                                key={spec} 
                                onClick={() => handleSpecialtyChange(spec)} 
                                style={{ 
                                    padding: '16px 32px', 
                                    borderRadius: '16px', 
                                    border: 'none', 
                                    background: selectedSpecialty === spec ? '#1e293b' : '#f8fafc', 
                                    color: selectedSpecialty === spec ? '#fff' : '#475569', 
                                    boxShadow: selectedSpecialty === spec ? '0 10px 20px rgba(30,41,59,0.2)' : '0 4px 6px rgba(0,0,0,0.02)',
                                    fontWeight: 800, 
                                    fontSize: '1rem',
                                    cursor: 'pointer', 
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: selectedSpecialty === spec ? 'translateY(-3px)' : 'none'
                                }}
                            >
                                {spec}
                            </button>
                        ))}
                    </div>

                    <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                        <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                            <Activity size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} color="#3b82f6" />
                            Tip: Select 'All' to browse across our entire panel of specialists.
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '25px', borderTop: '1.5px solid #f1f5f9' }}>
                        <button onClick={() => setStep(1)} className="btn-outline" style={{ padding: '16px 35px', borderRadius: '14px', fontWeight: 700 }}>Back</button>
                        <button onClick={() => setStep(3)} className="btn-primary" style={{ padding: '16px 45px', borderRadius: '14px', fontWeight: 800 }}>Browse Panel <ChevronRight size={20} /></button>
                    </div>
                </div>
            )}

            {step === 2 && bookingMode === "emergency" && (
                <div className="pt-card" style={{ animation: 'slideUp 0.4s', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                        <div onClick={() => setStep(1)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}>
                            <ChevronLeft size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <HeartPulse size={28} /> Emergency Details
                        </h3>
                    </div>

                    <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '1.05rem', fontWeight: 500 }}>
                        We will find the fastest global available slot based on your symptoms.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '30px' }}>
                        {SYMPTOMS_LIST.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => toggleSymptom(s.label)}
                                style={{ padding: '14px 24px', borderRadius: '16px', fontWeight: 800, border: '2px solid',
                                    borderColor: selectedSymptoms.includes(s.label) ? '#ef4444' : '#e2e8f0',
                                    background: selectedSymptoms.includes(s.label) ? '#fef2f2' : '#fff',
                                    color: selectedSymptoms.includes(s.label) ? '#dc2626' : '#475569',
                                    cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '10px',
                                    boxShadow: selectedSymptoms.includes(s.label) ? '0 8px 15px rgba(239,68,68,0.15)' : 'none'
                                }}
                            >
                                {s.label}
                                {s.priority === "EMERGENCY" && <Zap size={16} color="#ef4444" />}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', fontWeight: 800, marginBottom: '12px', color: '#1e293b', fontSize: '1.1rem' }}>Other Symptoms (Optional)</label>
                        <input 
                            type="text" 
                            value={customSymptom} 
                            onChange={(e) => setCustomSymptom(e.target.value)}
                            placeholder="e.g. skin rash, blurry vision..."
                            className="pt-input"
                            style={{ padding: '18px', fontSize: '1.1rem', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px' }}
                        />
                    </div>
                    
                    <div onClick={() => dateInputRef.current?.showPicker()} style={{ marginBottom: '35px', cursor: 'pointer' }}>
                        <label style={{ display: 'block', fontWeight: 800, marginBottom: '12px', color: '#1e293b', fontSize: '1.1rem' }}>Preferred Date</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                ref={dateInputRef}
                                type="date"
                                value={selectedDate}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="pt-input"
                                style={{ padding: '18px 18px 18px 54px', fontSize: '1.1rem', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', width: '100%', cursor: 'pointer' }}
                            />
                            <Calendar size={22} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '25px', borderTop: '1.5px solid #f1f5f9' }}>
                        <button onClick={() => setStep(1)} className="btn-outline" style={{ padding: '16px 35px', borderRadius: '14px', fontWeight: 700 }}>Back</button>
                        <button 
                            onClick={handleFetchEmergency} 
                            disabled={loading}
                            className="btn-primary" 
                            style={{ padding: '16px 50px', borderRadius: '14px', background: '#ef4444', borderColor: '#ef4444', fontWeight: 900 }}
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : "Find Fastest Slot"}
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: DOCTOR SELECTION / EMERGENCY SLOT REVIEW */}
            {step === 3 && bookingMode === "standard" && (
                <div className="pt-card" style={{ animation: 'slideUp 0.4s', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '35px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div onClick={() => setStep(2)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}>
                                <ChevronLeft size={20} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>Available Specialists</h3>
                        </div>
                        
                        <div style={{ position: 'relative', width: '100%' }}>
                            <Search size={22} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input type="text" placeholder="Search by physician name or expertise..." value={doctorSearch} onChange={e => setDoctorSearch(e.target.value)} style={{ width: '100%', padding: '20px 20px 20px 60px', borderRadius: '18px', border: '1.5px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, transition: '0.3s' }} />
                        </div>
                    </div>
                    
                    {loading ? (
                        <div style={{ padding: '80px', textAlign: 'center' }}><Loader2 className="animate-spin" size={40} color="#3b82f6" style={{ margin: '0 auto' }} /></div>
                    ) : doctorsList.length === 0 ? (
                        <div style={{ padding: '80px', textAlign: 'center', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                            <User size={48} color="#cbd5e1" style={{ margin: '0 auto 20px' }} />
                            <h4 style={{ color: '#1e293b', fontWeight: 800 }}>No specialists found</h4>
                            <p style={{ color: '#64748b', fontWeight: 500 }}>Try adjusting your specialty or search term.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', maxHeight: '500px', overflowY: 'auto', paddingRight: '10px', customScrollbar: 'true' }}>
                            {doctorsList.filter(d => d.name.toLowerCase().includes(doctorSearch.toLowerCase())).map(doc => (
                                <div key={doc._id} onClick={() => handleDoctorChange(doc)} style={{ padding: '24px', borderRadius: '24px', border: selectedDoctor?._id === doc._id ? '2.5px solid #3b82f6' : '1.5px solid #e2e8f0', background: selectedDoctor?._id === doc._id ? '#eff6ff' : '#fff', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.6rem', boxShadow: '0 8px 15px rgba(59,130,246,0.2)' }}>
                                            {doc.name.replace('Dr. ', '').charAt(0)}
                                        </div>
                                        <div>
                                            <h4 style={{ fontWeight: 900, fontSize: '1.2rem', color: '#1e293b', margin: 0 }}>{doc.name}</h4>
                                            <p style={{ color: '#3b82f6', fontSize: '0.95rem', fontWeight: 900, marginTop: '2px' }}>{doc.specialization}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                                        <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 700 }}>
                                            <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                            {doc.experience} Years Exp.
                                        </div>
                                        <span style={{ padding: '6px 14px', background: '#dcfce7', color: '#166534', borderRadius: '20px', fontWeight: 800, fontSize: '0.8rem' }}>Fast Booking</span>
                                    </div>
                                    {selectedDoctor?._id === doc._id && <div style={{ position: 'absolute', top: '20px', right: '20px' }}><CheckCircle2 color="#3b82f6" size={20} /></div>}
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '25px', borderTop: '1.5px solid #f1f5f9' }}>
                        <button onClick={() => setStep(2)} className="btn-outline" style={{ padding: '16px 35px', borderRadius: '14px', fontWeight: 700 }}>Back</button>
                        <button onClick={() => setStep(4)} disabled={!selectedDoctor} className="btn-primary" style={{ padding: '16px 45px', borderRadius: '14px', fontWeight: 800 }}>Pick Slot <ChevronRight size={20} /></button>
                    </div>
                </div>
            )}


            {step === 3 && bookingMode === "emergency" && emergencySlot && (
                <div className="pt-card" style={{ animation: 'slideUp 0.5s', border: '3px solid #ef4444', background: '#fffcfc', borderRadius: '32px', padding: '50px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', boxShadow: '0 15px 30px rgba(239,68,68,0.2)' }}>
                            <Zap size={50} />
                        </div>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#991b1b', marginBottom: '12px', letterSpacing: '-0.02em' }}>Instant Appointment Found</h2>
                        <p style={{ color: '#b91c1c', fontWeight: 600, fontSize: '1.2rem' }}>We've assigned the earliest available static slot for immediate attention.</p>
                    </div>

                    <div style={{ background: '#fff', border: '2px solid #fee2e2', padding: '35px', borderRadius: '24px', marginBottom: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #fecaca', paddingBottom: '20px', marginBottom: '20px' }}>
                            <span style={{ color: '#991b1b', fontWeight: 700, fontSize: '1.1rem' }}>Physician Assigned</span>
                            <strong style={{ color: '#7f1d1d', fontSize: '1.25rem', fontWeight: 900 }}>{emergencySlot.doctor_name}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #fecaca', paddingBottom: '20px', marginBottom: '20px' }}>
                            <span style={{ color: '#991b1b', fontWeight: 700, fontSize: '1.1rem' }}>Expertise</span>
                            <strong style={{ color: '#7f1d1d', fontSize: '1.2rem', fontWeight: 800 }}>{emergencySlot.specialization}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #fecaca', paddingBottom: '20px', marginBottom: '20px' }}>
                            <span style={{ color: '#991b1b', fontWeight: 700, fontSize: '1.1rem' }}>Reserved Date</span>
                            <strong style={{ color: '#7f1d1d', fontSize: '1.2rem', fontWeight: 800 }}>{emergencySlot.date}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#991b1b', fontWeight: 700, fontSize: '1.1rem' }}>Precise Arrival Time</span>
                            <div style={{ background: '#ef4444', color: '#fff', padding: '8px 25px', borderRadius: '15px', fontSize: '1.8rem', fontWeight: 900, boxShadow: '0 8px 15px rgba(239,68,68,0.2)' }}>{emergencySlot.time}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button onClick={() => setStep(2)} className="btn-outline" style={{ flex: 1, padding: '20px', borderRadius: '18px', fontWeight: 800, fontSize: '1.1rem' }}>Change Details</button>
                        <button onClick={confirmBooking} disabled={bookingLoading} className="btn-primary" style={{ flex: 2, background: '#ef4444', borderColor: '#ef4444', padding: '20px', fontSize: '1.25rem', fontWeight: 900, borderRadius: '18px', boxShadow: '0 10px 20px rgba(239,68,68,0.3)' }}>
                            {bookingLoading ? <Loader2 className="animate-spin" size={28} /> : "Confirm & Lock Slot"}
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 4: SLOT SELECTION (Standard) */}
            {step === 4 && bookingMode === "standard" && (
                <div className="pt-card" style={{ animation: 'slideUp 0.4s', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '35px' }}>
                        <div onClick={() => setStep(3)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}>
                            <ChevronLeft size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>Choose Arrival Time</h3>
                    </div>

                    <div onClick={() => dateInputRef.current?.showPicker()} style={{ marginBottom: '40px', cursor: 'pointer' }}>
                        <label style={{ display: 'block', fontWeight: 800, marginBottom: '12px', color: '#1e293b', fontSize: '1.1rem' }}>Select Target Date</label>
                        <div style={{ position: 'relative', maxWidth: '400px' }}>
                            <input 
                                ref={dateInputRef}
                                type="date"
                                value={selectedDate}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="pt-input"
                                style={{ padding: '18px 18px 18px 54px', fontSize: '1.1rem', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', width: '100%', cursor: 'pointer' }}
                            />
                            <Calendar size={22} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6' }} />
                        </div>
                    </div>

                    {backendReason && backendReason !== "SUCCESS" ? (
                        <div style={{ animation: 'fadeIn 0.5s' }}>
                             <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '30px', borderRadius: '24px', marginBottom: '40px', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                <div style={{ background: '#ef4444', color: '#fff', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <AlertTriangle size={28} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontWeight: 900, color: '#991b1b', fontSize: '1.3rem', marginBottom: '5px' }}>{backendReason === 'LEAVE' ? 'Specialist on Leave' : 'Availability Gap'}</h4>
                                    <p style={{ color: '#b91c1c', fontWeight: 700, margin: 0 }}>{backendMessage}</p>
                                </div>
                             </div>

                             {recommendedDoctors.length > 0 && (
                                 <div style={{ animation: 'slideUp 0.5s' }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '25px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Users size={26} color="#3b82f6" /> Recommended Specialists
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                        {recommendedDoctors.map(doc => (
                                            <div key={doc._id} onClick={() => handleDoctorChange(doc)} style={{ padding: '24px', borderRadius: '24px', border: '1.5px solid #3b82f6', background: '#f0f9ff', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 8px 15px rgba(59,130,246,0.1)' }}>
                                                <div style={{ width: '56px', height: '56px', borderRadius: '15px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem' }}>{doc.name.charAt(0)}</div>
                                                <div>
                                                    <h4 style={{ fontWeight: 900, color: '#1e293b', margin: 0 }}>{doc.name}</h4>
                                                    <p style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: 800 }}>Same Department</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                 </div>
                             )}
                        </div>
                    ) : (
                        <>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '25px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={24} color="#3b82f6" /> Dynamic Availability Ticker
                        </h3>
                        
                        {loading ? (
                            <div style={{ padding: '80px', textAlign: 'center' }}><Loader2 className="animate-spin" size={40} color="#3b82f6" style={{ margin: '0 auto' }} /></div>
                        ) : availability.length === 0 ? (
                            <div style={{ padding: '50px', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #cbd5e1', textAlign: 'center', color: '#64748b' }}>
                                <Calendar size={40} color="#94a3b8" style={{ margin: '0 auto 15px' }} />
                                <h4 style={{ fontWeight: 800, color: '#475569' }}>No slots available</h4>
                                <p style={{ fontWeight: 500 }}>Try selecting a different date for {selectedDoctor?.name}.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '15px' }}>
                                {availability.map((slot, idx) => (
                                    <button
                                        key={idx}
                                        disabled={slot.is_full}
                                        onClick={() => setSelectedSlot(slot)}
                                        style={{
                                            padding: '18px', borderRadius: '18px', fontWeight: 900, fontSize: '1.15rem',
                                            border: selectedSlot?.time === slot.time ? `3px solid #3b82f6` : '2px solid transparent',
                                            background: slot.is_full ? '#f1f5f9' : selectedSlot?.time === slot.time ? '#eff6ff' : '#ecfdf5',
                                            color: slot.is_full ? '#cbd5e1' : selectedSlot?.time === slot.time ? '#1d4ed8' : '#059669',
                                            cursor: slot.is_full ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                                            opacity: slot.is_full ? 0.6 : 1,
                                            boxShadow: slot.is_full ? 'none' : '0 4px 10px rgba(16,185,129,0.1)',
                                            transform: selectedSlot?.time === slot.time ? 'scale(1.05)' : 'none'
                                        }}
                                    >
                                        {slot.time}
                                        {slot.is_full && <div style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 900, color: '#94a3b8' }}>BOOKED</div>}
                                        {!slot.is_full && <div style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 900, color: '#10b981' }}>OPEN</div>}
                                    </button>
                                ))}
                            </div>
                        )}
                        </>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', paddingTop: '30px', borderTop: '1.5px solid #f1f5f9' }}>
                        <button onClick={() => setStep(3)} className="btn-outline" style={{ padding: '16px 35px', borderRadius: '14px', fontWeight: 700 }}>Back</button>
                        <button 
                            onClick={confirmBooking} 
                            disabled={!selectedSlot || bookingLoading} 
                            className="btn-primary" 
                            style={{ padding: '16px 60px', fontSize: '1.15rem', background: '#3b82f6', borderColor: '#3b82f6', fontWeight: 900, borderRadius: '14px', boxShadow: '0 10px 20px rgba(59,130,246,0.2)' }}
                        >
                            {bookingLoading ? <Loader2 className="animate-spin" size={24} /> : "Finalize Booking"}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </PatientLayout>
  )
}

export default BookAppointment
