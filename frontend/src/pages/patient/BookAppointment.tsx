import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PatientLayout from "../../components/layout/patient/PatientLayout"
import {
  Search, Clock, ChevronRight,
  CheckCircle2, AlertCircle,
  Loader2, Activity, ShieldAlert, Timer
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
  { label: "Body Ache", priority: "NORMAL" },
  { label: "Fatigue", priority: "NORMAL" }
]

const avatarColors = ["#6366f1", "#3b82f6", "#10 b981", "#f59e0b", "#ef4444", "#8b5cf6"]

function BookAppointment() {
  const navigate = useNavigate()
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState("All")
  const [search, setSearch] = useState("")
  
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [locations, setLocations] = useState<any[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedShift, setSelectedShift] = useState<any>(null)
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  
  const [availability, setAvailability] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState("")
  const [bookedData, setBookedData] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [idempotencyKey] = useState(crypto.randomUUID())

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await appointmentService.getMyPatients();
        setPatients(data);
        if (data.length > 0) {
          const self = data.find((p: any) => p.created_by === 'self');
          setSelectedPatient(self ? self._id : data[0]._id);
        }
      } catch (err) { console.error(err); }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const data = await appointmentService.getDoctors(selectedSpecialty);
        setDoctorsList(data);
      } catch (err) { setError("Failed to fetch doctors."); }
      finally { setLoading(false); }
    };
    fetchDoctors();
  }, [selectedSpecialty]);

  useEffect(() => {
    const fetchLocations = async () => {
      if (!selectedDoctor) return;
      setLoading(true);
      try {
        const data = await appointmentService.getDoctorLocations(selectedDoctor);
        setLocations(data);
      } catch (err) { setError("Failed to fetch branches."); }
      finally { setLoading(false); }
    }
    fetchLocations();
  }, [selectedDoctor]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDoctor || !selectedDate || !selectedLocation) return;
      setLoading(true);
      try {
        const data = await appointmentService.getHardenedAvailability(selectedDoctor, selectedDate);
        const locAvail = data.locations.find((l: any) => l.location_id === selectedLocation);
        setAvailability(locAvail ? locAvail.shifts : []);
      } catch (err) { setError("Failed to fetch availability."); }
      finally { setLoading(false); }
    };
    fetchAvailability();
  }, [selectedDoctor, selectedDate, selectedLocation]);

  const handleBook = async () => {
    if (!selectedDoctor || !selectedLocation || !selectedShift || !selectedPatient || selectedSymptoms.length === 0) return;
    setBookingLoading(true);
    setError("");
    try {
      const result = await appointmentService.bookHardenedAppointment({
        doctor_id: selectedDoctor,
        patient_id: selectedPatient,
        location_id: selectedLocation,
        date: selectedDate,
        shift_id: selectedShift.shift_id,
        symptoms: selectedSymptoms,
        idempotency_key: idempotencyKey
      });
      setBookedData(result);
      setStep(6); // Success step
    } catch (err: any) {
      setError(err.response?.data?.detail || "Booking failed.");
    } finally { setBookingLoading(false); }
  }

  const toggleSymptom = (label: string) => {
    setSelectedSymptoms(prev => prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]);
  }

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <PatientLayout>
      <div className="ba-page">
        <div className="ba-header">
          <div>
            <h2 className="ba-title">Production-Grade Booking</h2>
            <p className="ba-sub">Multi-branch scheduling with priority triage</p>
          </div>
          <div className="ba-steps">
            {["Patient", "Doctor", "Branch", "Time", "Triage", "Confirm"].map((s, i) => (
              <div key={s} className={`ba-step ${step > i ? "ba-step-done" : ""} ${step === i + 1 ? "ba-step-active" : ""}`}>
                <span className="ba-step-num">{step > i + 1 ? <CheckCircle2 size={16} /> : i + 1}</span>
                <span className="ba-step-label">{s}</span>
                {i < 5 && <ChevronRight size={14} className="ba-step-sep" />}
              </div>
            ))}
          </div>
        </div>

        {error && <div className="ba-error-banner"><AlertCircle size={20} />{error}</div>}

        <div className="ba-layout">
          <div className="ba-left">
            {step === 1 && (
              <div className="ba-step-container">
                <h3 className="ba-section-title">Select Patient</h3>
                <div className="ba-patients-grid">
                  {patients.map(p => (
                    <div key={p._id} className={`ba-patient-card ${selectedPatient === p._id ? 'selected' : ''}`} onClick={() => { setSelectedPatient(p._id); setStep(2); }}>
                      <div className="ba-patient-avatar">{p.name[0]}</div>
                      <h4>{p.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="ba-step-container">
                <div className="ba-filter-bar">
                  <div className="ba-search-box"><Search size={16} /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <div className="ba-specialty-pills">
                    {specialties.map(s => <button key={s} className={`ba-pill ${selectedSpecialty === s ? "active" : ""}`} onClick={() => setSelectedSpecialty(s)}>{s}</button>)}
                  </div>
                </div>
                <div className="ba-doctors-list">
                  {doctorsList.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map((doc, idx) => (
                    <div key={doc._id} className={`ba-doc-card ${selectedDoctor === doc._id ? "selected" : ""}`} onClick={() => { setSelectedDoctor(doc._id); setStep(3); }}>
                      <div className="ba-doc-avatar" style={{ background: avatarColors[idx % 6] }}>{getInitials(doc.name)}</div>
                      <div className="ba-doc-info">
                        <h4>{doc.name}</h4>
                        <p>{doc.specialization}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="ba-step-container">
                <h3 className="ba-section-title">Select Branch</h3>
                <div className="ba-locations-grid">
                  {locations.map(loc => (
                    <div key={loc.id} className={`ba-loc-card ${selectedLocation === loc.id ? 'selected' : ''}`} onClick={() => { setSelectedLocation(loc.id); setStep(4); }}>
                      <h4>{loc.name}</h4>
                      <p>{loc.address}, {loc.city}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="ba-step-container">
                <h3 className="ba-section-title">Select Date & Shift</h3>
                <div className="ba-form-group">
                  <input type="date" className="ba-date-input" value={selectedDate} min={new Date().toISOString().split("T")[0]} onChange={e => setSelectedDate(e.target.value)} />
                </div>
                {loading ? <div className="ba-loader"><Loader2 className="animate-spin" /></div> : (
                  <div className="ba-shifts-list">
                    {availability.length === 0 && selectedDate && <p className="no-avail">No availability at this branch for selected date.</p>}
                    {availability.map(shift => (
                      <div key={shift.shift_id} className={`ba-shift-card ${selectedShift?.shift_id === shift.shift_id ? "selected" : ""}`} onClick={() => setSelectedShift(shift)}>
                        <div className="ba-shift-header">
                          <h4>{shift.shift_type}</h4>
                          <div className="ba-shift-counts">
                            <span>Normal: {shift.summary.available_normal}</span>
                            <span>Emergency: {shift.summary.available_emergency}</span>
                          </div>
                        </div>
                        {selectedShift?.shift_id === shift.shift_id && (
                          <div className="ba-slots-grid">
                            {shift.slots.map((slot: any) => (
                              <button key={slot.id} className={`ba-slot-btn ${selectedSlot?.id === slot.id ? "selected" : ""}`} onClick={() => { setSelectedSlot(slot); setStep(5); }}>
                                {slot.time}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="ba-step-container">
                <h3 className="ba-section-title">Symptom Triage</h3>
                <p className="ba-instruction">Select all that apply for priority classification.</p>
                <div className="ba-symptoms-grid">
                  {SYMPTOMS_LIST.map(sym => (
                    <div key={sym.label} className={`ba-sym-card ${selectedSymptoms.includes(sym.label) ? "selected" : ""} ${sym.priority}`} onClick={() => toggleSymptom(sym.label)}>
                      {sym.priority === "EMERGENCY" && <ShieldAlert size={16} />}
                      {sym.priority === "URGENT" && <Activity size={16} />}
                      <span>{sym.label}</span>
                    </div>
                  ))}
                </div>
                <button className="ba-book-btn" disabled={selectedSymptoms.length === 0 || bookingLoading} onClick={handleBook}>
                  {bookingLoading ? "Processing Transaction..." : "Book Securely"}
                </button>
              </div>
            )}

            {step === 6 && bookedData && (
              <div className="ba-step-container ba-success-view">
                <div className="ba-success-icon"><CheckCircle2 size={48} /></div>
                <h3 className="ba-success-title">Appointment Confirmed!</h3>
                <div className="ba-queue-card">
                  <div className="ba-q-item">
                    <Timer size={20} />
                    <span>Queue Position: <strong>#{bookedData.queue_position}</strong></span>
                  </div>
                  <div className="ba-q-item">
                    <Clock size={20} />
                    <span>Est. Wait Time: <strong>{bookedData.estimated_wait_time} mins</strong></span>
                  </div>
                </div>
                <div className="ba-appt-details">
                  <p>Priority: <span className={`p-badge ${bookedData.priority_level}`}>{bookedData.priority_level}</span></p>
                  {bookedData.is_overflow && <p className="overflow-warning">Managed as Emergency Overflow</p>}
                </div>
                <button className="ba-done-btn" onClick={() => navigate("/patient/appointments")}>View My Appointments</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  )
}

export default BookAppointment
