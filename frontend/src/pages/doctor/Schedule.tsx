import { useState, useEffect } from "react"
import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { Clock, CheckCircle, Loader2, X } from "lucide-react"
import { getPortalProfile, getPortalSchedule, savePortalSchedule } from "../../services/doctorService"

const weekdayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const shortDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function Schedule() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    // Form states
    const [workingDays, setWorkingDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"])
    const [startTime, setStartTime] = useState("09:00")
    const [endTime, setEndTime] = useState("17:00")
    const [slotDuration, setSlotDuration] = useState(30)

    useEffect(() => {
        const initData = async () => {
            try {
                const prof = await getPortalProfile()
                setProfile(prof)

                if (prof && prof.doctor_id) {
                    const sched = await getPortalSchedule(prof.doctor_id)
                    if (sched && Array.isArray(sched.working_days)) {
                        const validDays = sched.working_days.filter((d: string) => shortDays.includes(d))
                        setWorkingDays(validDays)
                        setStartTime(sched.start_time || "09:00")
                        setEndTime(sched.end_time || "17:00")
                        setSlotDuration(sched.slot_duration || 30)
                    }
                }
            } catch (err) {
                console.error("Failed to load schedule data:", err)
            } finally {
                setLoading(false)
            }
        }
        initData()
    }, [])

    const timeToMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number)
        return h * 60 + m
    }

    const toggleDay = (day: string) => {
        setWorkingDays(prev => {
            // Fix Issue 4: Always sort the days
            const updated = prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
            
            return shortDays.filter(d => updated.includes(d))
        })
    }

    const handleSubmit = async () => {
        // Fix Issue 3: Hard profile guard
        if (!profile || !profile.doctor_id) {
            setErrorMessage("Doctor profile not loaded. Please refresh.")
            return
        }

        // Fix Issue 2: Empty working days check
        if (workingDays.length === 0) {
            setErrorMessage("Select at least one working day.")
            return
        }

        // Fix Issue 1: Weak validation check (Slot Alignment)
        const start = timeToMinutes(startTime)
        const end = timeToMinutes(endTime)
        const total = end - start

        if (start >= end) {
            setErrorMessage("Start time must be before end time.")
            return
        }

        if (total % slotDuration !== 0) {
            setErrorMessage(`Time range (${total}m) must be perfectly divisible by slot duration (${slotDuration}m).`)
            return
        }
        
        setErrorMessage("")
        setIsSubmitting(true)
        try {
            await savePortalSchedule({
                doctor_id: profile.doctor_id,
                working_days: workingDays,
                start_time: startTime,
                end_time: endTime,
                slot_duration: slotDuration
            })
            // Fix Issue 6: UX Feedback (State instead of alert)
            setSuccessMessage(true)
            setTimeout(() => setSuccessMessage(false), 4000)
        } catch (err) {
            console.error("Update failed:", err)
            setErrorMessage("Failed to process request. Backend sync error.")
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
                <div className="pd-header" style={{ marginBottom: '16px' }}>
                    <div className="pd-header-content">
                        <h1 className="pd-page-title">Working Schedule</h1>
                        <p className="pd-page-sub">Define your recursive weekly consulting blocks. System handles slot generation automatically.</p>
                    </div>
                </div>

                {successMessage && (
                    <div className="pd-success-banner" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 700 }}>
                        <CheckCircle size={20} />
                        Weekly pattern synchronized. Dynamic slots active on patient portal.
                    </div>
                )}

                {errorMessage && (
                    <div className="pd-error-banner" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 700 }}>
                        <X size={20} />
                        {errorMessage}
                    </div>
                )}

                <div className="pd-main-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="pd-card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                        <div className="pd-alert-info" style={{ marginBottom: '32px' }}>
                            <Clock size={22} />
                            <span>Your selection below determines the available slots patients see during booking. Dynamic generation filters existing appointments and approved leaves.</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                            <div className="pd-field">
                                <label style={{ fontWeight: 800, color: '#1e293b', marginBottom: '10px', display: 'block' }}>Daily Start Time</label>
                                <input type="time" className="pd-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ padding: '14px' }} />
                            </div>
                            <div className="pd-field">
                                <label style={{ fontWeight: 800, color: '#1e293b', marginBottom: '10px', display: 'block' }}>Daily End Time</label>
                                <input type="time" className="pd-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ padding: '14px' }} />
                            </div>
                            <div className="pd-field">
                                <label style={{ fontWeight: 800, color: '#1e293b', marginBottom: '10px', display: 'block' }}>Slot (Minutes)</label>
                                <select className="pd-input" value={slotDuration} onChange={(e) => setSlotDuration(parseInt(e.target.value))} style={{ padding: '14px', fontWeight: 700 }}>
                                    <option value={15}>15 Minutes</option>
                                    <option value={30}>30 Minutes</option>
                                    <option value={45}>45 Minutes (Check Alignment)</option>
                                    <option value={60}>60 Minutes</option>
                                </select>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '20px' }}>Consulting Days</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', marginBottom: '48px' }}>
                            {shortDays.map((day, idx) => (
                                <button 
                                    key={day} 
                                    onClick={() => toggleDay(day)}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '2px solid',
                                        borderColor: workingDays.includes(day) ? '#0dcb6e' : '#eef2f6',
                                        background: workingDays.includes(day) ? '#0dcb6e10' : '#fff',
                                        color: workingDays.includes(day) ? '#0dcb6e' : '#94a3b8',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: '0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <span style={{ fontSize: '1rem' }}>{day}</span>
                                    <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{weekdayNames[idx]}</span>
                                </button>
                            ))}
                        </div>

                        <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="pd-action-btn-primary"
                                style={{ padding: '16px 48px', minWidth: '220px', justifyContent: 'center', borderRadius: '14px' }}
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        <span>Update Weekly Routine</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DoctorLayout>
    )
}

export default Schedule
