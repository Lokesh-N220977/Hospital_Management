import { useState } from "react"
import PatientLayout from "../../components/layout/patient/PatientLayout"
import {
  Search, MapPin, Star, Clock, ChevronRight,
  Calendar, User, Filter, CheckCircle2, Stethoscope
} from "lucide-react"

const specialties = ["All", "Cardiology", "Dermatology", "Orthopedics", "Neurology", "Pediatrics", "Ophthalmology"]

const doctors = [
  {
    id: 1, name: "Dr. Rahul Sharma", specialty: "Cardiology",
    rating: 4.9, reviews: 128, exp: "12 yrs", fee: "₹800",
    avatar: "RS", location: "Block A, Room 204", available: true,
    slots: ["10:00 AM", "11:30 AM", "2:00 PM"],
  },
  {
    id: 2, name: "Dr. Priya Mehta", specialty: "Dermatology",
    rating: 4.7, reviews: 94, exp: "8 yrs", fee: "₹600",
    avatar: "PM", location: "Block B, Room 112", available: true,
    slots: ["9:00 AM", "12:00 PM", "4:30 PM"],
  },
  {
    id: 3, name: "Dr. Anil Kumar", specialty: "Orthopedics",
    rating: 4.8, reviews: 202, exp: "15 yrs", fee: "₹1000",
    avatar: "AK", location: "Block C, Room 301", available: false,
    slots: [],
  },
  {
    id: 4, name: "Dr. Sneha Patel", specialty: "Neurology",
    rating: 4.6, reviews: 77, exp: "10 yrs", fee: "₹900",
    avatar: "SP", location: "Block A, Room 108", available: true,
    slots: ["11:00 AM", "3:00 PM"],
  },
  {
    id: 5, name: "Dr. Kiran Desai", specialty: "Pediatrics",
    rating: 4.9, reviews: 165, exp: "14 yrs", fee: "₹700",
    avatar: "KD", location: "Block D, Room 205", available: true,
    slots: ["9:30 AM", "1:00 PM", "5:00 PM"],
  },
  {
    id: 6, name: "Dr. Meena Joshi", specialty: "Ophthalmology",
    rating: 4.5, reviews: 58, exp: "7 yrs", fee: "₹650",
    avatar: "MJ", location: "Block B, Room 310", available: true,
    slots: ["10:30 AM", "2:30 PM"],
  },
]

const avatarColors = [
  "#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"
]

function BookAppointment() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All")
  const [search, setSearch] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [booked, setBooked] = useState(false)
  const [step, setStep] = useState(1)

  const filtered = doctors.filter(d => {
    const matchSpec = selectedSpecialty === "All" || d.specialty === selectedSpecialty
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase())
    return matchSpec && matchSearch
  })

  const chosenDoc = doctors.find(d => d.id === selectedDoctor)

  const handleBook = () => {
    if (!selectedSlot || !selectedDate) return
    setBooked(true)
    setTimeout(() => {
      setBooked(false)
      setSelectedDoctor(null)
      setSelectedSlot(null)
      setSelectedDate("")
      setStep(1)
    }, 3000)
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
            {["Choose Doctor", "Pick Slot", "Confirm"].map((s, i) => (
              <div key={s} className={`ba-step${step > i ? " ba-step-done" : step === i + 1 ? " ba-step-active" : ""}`}>
                <span className="ba-step-num">{step > i ? <CheckCircle2 size={16} /> : i + 1}</span>
                <span className="ba-step-label">{s}</span>
                {i < 2 && <ChevronRight size={14} className="ba-step-sep" />}
              </div>
            ))}
          </div>
        </div>

        {booked && (
          <div className="ba-success-banner">
            <CheckCircle2 size={22} />
            Appointment booked with {chosenDoc?.name} on {selectedDate} at {selectedSlot}!
          </div>
        )}

        <div className="ba-layout">
          {/* Doctor List */}
          <div className="ba-left">
            {/* Filters */}
            <div className="ba-filter-bar">
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

            {/* Doctor Cards */}
            <div className="ba-doctors-list">
              {filtered.map((doc, idx) => (
                <div
                  key={doc.id}
                  className={`ba-doc-card${selectedDoctor === doc.id ? " ba-doc-selected" : ""}${!doc.available ? " ba-doc-unavailable" : ""}`}
                  onClick={() => {
                    if (doc.available) {
                      setSelectedDoctor(doc.id)
                      setSelectedSlot(null)
                      setStep(2)
                    }
                  }}
                >
                  <div
                    className="ba-doc-avatar"
                    style={{ background: avatarColors[idx % avatarColors.length] }}
                  >{doc.avatar}</div>
                  <div className="ba-doc-info">
                    <div className="ba-doc-top">
                      <h4 className="ba-doc-name">{doc.name}</h4>
                      {doc.available
                        ? <span className="ba-avail-badge">Available</span>
                        : <span className="ba-unavail-badge">Unavailable</span>}
                    </div>
                    <p className="ba-doc-spec">{doc.specialty}</p>
                    <div className="ba-doc-meta">
                      <span><Star size={12} fill="#f59e0b" color="#f59e0b" /> {doc.rating} ({doc.reviews})</span>
                      <span><Clock size={12} /> {doc.exp}</span>
                      <span><MapPin size={12} /> {doc.location}</span>
                    </div>
                    <p className="ba-doc-fee">Consultation Fee: <strong>{doc.fee}</strong></p>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="ba-empty">
                  <Stethoscope size={40} />
                  <p>No doctors found</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Panel */}
          <div className={`ba-right${selectedDoctor ? " ba-right-visible" : ""}`}>
            {selectedDoctor && chosenDoc ? (
              <div className="ba-booking-panel">
                <div className="ba-panel-header">
                  <div className="ba-panel-avatar" style={{ background: avatarColors[doctors.indexOf(chosenDoc) % avatarColors.length] }}>
                    {chosenDoc.avatar}
                  </div>
                  <div>
                    <h4>{chosenDoc.name}</h4>
                    <p>{chosenDoc.specialty}</p>
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
                  <div className="ba-slots-grid">
                    {chosenDoc.slots.map(slot => (
                      <button
                        key={slot}
                        className={`ba-slot${selectedSlot === slot ? " ba-slot-selected" : ""}`}
                        onClick={() => { setSelectedSlot(slot); setStep(3) }}
                      >{slot}</button>
                    ))}
                  </div>
                </div>

                <div className="ba-form-group">
                  <label className="ba-label"><User size={14} /> Reason for Visit</label>
                  <textarea className="ba-textarea" placeholder="Describe your symptoms or reason..." rows={3} />
                </div>

                <button
                  className="ba-confirm-btn"
                  disabled={!selectedSlot || !selectedDate}
                  onClick={handleBook}
                >
                  Confirm Appointment
                </button>

                <div className="ba-panel-fee">
                  <span>Consultation Fee</span>
                  <strong>{chosenDoc.fee}</strong>
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