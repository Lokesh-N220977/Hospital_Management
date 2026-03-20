import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import PatientLayout from "../../components/layout/patient/PatientLayout"
import {
  Search, MapPin, Star, Clock, ChevronRight,
  Calendar, User, CheckCircle2, Stethoscope, AlertCircle, PlusSquare
} from "lucide-react"
import { appointmentService, type Doctor } from "../../services/appointment.service"

const specialties = ["All", "Cardiology", "Dermatology", "Orthopedics", "Neurology", "Pediatrics", "Ophthalmology"]

const avatarColors = [
  "#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"
]

function BookAppointment() {
  const navigate = useNavigate()
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState("All")
  const [search, setSearch] = useState("")
  
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [reason, setReason] = useState("")
  
  const [availableSlots, setAvailableSlots] = useState<{time: string, booked: boolean}[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState("")
  const [booked, setBooked] = useState(false)
  const [step, setStep] = useState(1)
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  
  const bookingPanelRef = useRef<HTMLDivElement>(null)

  // Fetch Patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await appointmentService.getMyPatients();
        setPatients(data);
        if (data.length > 0) {
          // Auto-select self if available
          const self = data.find((p: any) => p.created_by === 'self');
          if (self) setSelectedPatient(self._id);
          else setSelectedPatient(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch family patients", err);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedDoctor && window.innerWidth <= 1024) {
      setTimeout(() => {
        bookingPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    }
  }, [selectedDoctor])

  // Fetch Doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await appointmentService.getDoctors(selectedSpecialty);
        setDoctorsList(data);
      } catch (err) {
        setError("Failed to fetch doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [selectedSpecialty]);

  // Fetch Slots
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor || !selectedDate) {
        setAvailableSlots([]);
        return;
      }
      setLoading(true);
      try {
        const data = await appointmentService.getAvailableSlots(selectedDoctor, selectedDate);
        setAvailableSlots(data.slots || []);
        if (data.slots?.length === 0) {
          setError(data.message || "No slots available for this date.");
        } else {
          setError("");
        }
      } catch (err) {
        setError("Error fetching slots.");
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  const filtered = doctorsList.filter(d => {
    return d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase())
  })

  const chosenDoc = doctorsList.find(d => d._id === selectedDoctor)

  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlot || !selectedDate || !selectedPatient) return
    setBookingLoading(true)
    setError("")
    try {
      await appointmentService.bookAppointment({
        doctor_id: selectedDoctor,
        patient_id: selectedPatient,
        date: selectedDate,
        time: selectedSlot,
        reason: reason || "General Consultation"
      })
      setBooked(true)
      setTimeout(() => {
        setBooked(false)
        setSelectedDoctor(null)
        setSelectedSlot(null)
        setSelectedDate("")
        setReason("")
        setStep(1)
      }, 3000)
    } catch (err) {
      setError("Booking failed. Please try again.")
    } finally {
      setBookingLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  }

  return (
    <PatientLayout>
      <div className="ba-page">

        {/* Header */}
        <div className="ba-header">
          <div>
            <h2 className="ba-title">Book an Appointment</h2>
            <p className="ba-sub">Find and book your preferred doctor in minutes</p>
          </div>
          <div className="ba-steps">
            {["Select Patient", "Choose Doctor", "Pick Slot", "Confirm"].map((s, i) => {
              const isActive = step === i + 1;
              const isPast = step > i + 1;
              const canClick = i + 1 < step; // Only allow clicking to go BACK
              
              return (
                <div 
                  key={s} 
                  className={`ba-step ${isPast || isActive ? "ba-step-done" : ""} ${isActive ? "ba-step-active" : ""}`}
                  onClick={() => {
                    if (canClick) setStep(i + 1);
                  }}
                  style={{ cursor: canClick ? "pointer" : "default" }}
                >
                  <span className="ba-step-num">{isPast ? <CheckCircle2 size={16} /> : i + 1}</span>
                  <span className="ba-step-label">{s}</span>
                  {i < 3 && <ChevronRight size={14} className="ba-step-sep" />}
                </div>
              );
            })}
          </div>
        </div>

        {booked && (
          <div className="ba-success-banner">
            <CheckCircle2 size={22} />
            Appointment booked successfully with {chosenDoc?.name} on {selectedDate} at {selectedSlot}!
          </div>
        )}

        {error && (
          <div className="ba-error-banner" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '16px' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="ba-layout">
          {/* Doctor List */}
          <div className="ba-left">
            {/* Step 1: Select Patient */}
            {step === 1 && (
              <div className="ba-step-container">
                <h3 className="ba-section-title">Who is this appointment for?</h3>
                <div className="ba-patients-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
                  {patients.map(p => (
                    <div 
                      key={p._id} 
                      className={`ba-patient-card ${selectedPatient === p._id ? 'selected' : ''}`}
                      onClick={() => { setSelectedPatient(p._id); setStep(2); }}
                      style={{ 
                        padding: '20px', 
                        borderRadius: '12px', 
                        border: '2px solid',
                        borderColor: selectedPatient === p._id ? '#2563eb' : '#e2e8f0',
                        backgroundColor: selectedPatient === p._id ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div className="ba-patient-avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#cbd5e1', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                        {p.name[0].toUpperCase()}
                      </div>
                      <h4 style={{ margin: 0, color: '#1e293b' }}>{p.name}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{p.created_by === 'self' ? 'Primary Account' : 'Family Member'}</p>
                    </div>
                  ))}
                  <div 
                    className="ba-patient-card add-patient" 
                    onClick={() => navigate('/patient/profile')} // Or a modal
                    style={{ 
                      padding: '20px', 
                      borderRadius: '12px', 
                      border: '2px dashed #cbd5e1',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PlusSquare size={24} color="#64748b" />
                    <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#64748b' }}>Add Member</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Doctor */}
            {step >= 2 && (
              <div className="ba-filter-bar" style={{ display: step === 2 ? 'block' : 'none' }}>
                <div className="ba-search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by name or specialty..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="ba-search-input"
                  />
                </div>
                <div className="ba-specialty-pills">
                  {specialties.map(s => (
                    <button
                      key={s}
                      className={`ba-pill${selectedSpecialty === s ? " ba-pill-active" : ""}`}
                      onClick={() => setSelectedSpecialty(s)}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Doctor Cards */}
            <div className="ba-doctors-list">
              {loading && step === 1 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>Loading doctors...</div>
              ) : filtered.map((doc, idx) => (
                <div
                  key={doc._id}
                  className={`ba-doc-card${selectedDoctor === doc._id ? " ba-doc-selected" : ""}${!doc.available ? " ba-doc-unavailable" : ""}`}
                  onClick={() => {
                    if (doc.available) {
                      setSelectedDoctor(doc._id)
                      setSelectedSlot(null)
                      setStep(2)
                    }
                  }}
                >
                  <div
                    className="ba-doc-avatar"
                    style={{ background: avatarColors[idx % avatarColors.length] }}
                  >{getInitials(doc.name)}</div>
                  <div className="ba-doc-info">
                    <div className="ba-doc-top">
                      <h4 className="ba-doc-name">{doc.name}</h4>
                      {doc.available
                        ? <span className="ba-avail-badge">Available</span>
                        : <span className="ba-unavail-badge">Unavailable</span>}
                    </div>
                    <p className="ba-doc-spec">{doc.specialization}</p>
                    <div className="ba-doc-meta">
                      <span><Star size={12} fill="#f59e0b" color="#f59e0b" /> 4.8 (120+)</span>
                      <span><Clock size={12} /> {doc.experience} exp</span>
                      <span><MapPin size={12} /> Hospital Clinic</span>
                    </div>
                    <p className="ba-doc-fee">Consultation Fee: <strong>{doc.consultation_fee}</strong></p>
                  </div>
                </div>
              ))}
              {!loading && filtered.length === 0 && (
                <div className="ba-empty">
                  <Stethoscope size={40} />
                  <p>No doctors found</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Panel */}
          <div 
            ref={bookingPanelRef}
            className={`ba-right${selectedDoctor ? " ba-right-visible" : ""}`}
          >
            {selectedDoctor && chosenDoc ? (
              <div className="ba-booking-panel">
                <div className="ba-panel-header">
                  <div className="ba-panel-avatar" style={{ background: avatarColors[doctorsList.indexOf(chosenDoc) % avatarColors.length] }}>
                    {getInitials(chosenDoc.name)}
                  </div>
                  <div>
                    <h4>{chosenDoc.name}</h4>
                    <p>{chosenDoc.specialization}</p>
                  </div>
                </div>

                <div className="ba-form-group">
                  <label className="ba-label"><Calendar size={14} /> Select Date</label>
                  <input
                    type="date"
                    className="ba-date-input"
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setSelectedDate(e.target.value)}
                  />
                </div>

                <div className="ba-form-group">
                  <label className="ba-label"><Clock size={14} /> Available Slots</label>
                  {loading && selectedDate ? (
                    <div style={{ fontSize: '14px', color: '#666' }}>Fetching slots...</div>
                  ) : (
                    <div className="ba-slots-grid">
                      {availableSlots.length > 0 ? availableSlots.map(slot => (
                        <button
                          key={slot.time}
                          disabled={slot.booked}
                          className={`ba-slot${selectedSlot === slot.time ? " ba-slot-selected" : ""}${slot.booked ? " ba-slot-booked" : " ba-slot-available"}`}
                          onClick={() => { setSelectedSlot(slot.time); setStep(3) }}
                          style={{
                            backgroundColor: slot.booked ? '#f1f5f9' : selectedSlot === slot.time ? '#22c55e' : '#f0fdf4',
                            borderColor: slot.booked ? '#e2e8f0' : selectedSlot === slot.time ? '#16a34a' : '#bbf7d0',
                            color: slot.booked ? '#94a3b8' : selectedSlot === slot.time ? 'white' : '#15803d'
                          }}
                        >
                          {slot.time}
                          {slot.booked && <span style={{ fontSize: '10px', display: 'block', opacity: 0.6 }}>Full</span>}
                        </button>
                      )) : (
                        <div style={{ gridColumn: 'span 3', fontSize: '13px', color: '#999', textAlign: 'center', padding: '10px' }}>
                          Select a date to view slots
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="ba-form-group">
                  <label className="ba-label"><User size={14} /> Reason for Visit</label>
                  <textarea 
                    className="ba-textarea" 
                    placeholder="Describe your symptoms or reason..." 
                    rows={3} 
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                  />
                </div>


                <button
                  className="ba-confirm-btn"
                  disabled={!selectedSlot || !selectedDate || bookingLoading}
                  onClick={handleBook}
                >
                  {bookingLoading ? "Booking..." : "Confirm Appointment"}
                </button>

                <div className="ba-panel-fee">
                  <span>Consultation Fee</span>
                  <strong>{chosenDoc.consultation_fee}</strong>
                </div>
              </div>
            ) : (
              <div className="ba-panel-placeholder">
                <Stethoscope size={48} />
                <p>Select a doctor to book an appointment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  )
}

export default BookAppointment
