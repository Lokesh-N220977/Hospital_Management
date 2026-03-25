import { useState, useEffect } from "react"
import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { CheckCircle, Loader2, Calendar, Save, Shield, Clock, X } from "lucide-react"
import { getPortalProfile, getHardenedSchedule, saveHardenedSchedule } from "../../services/doctorService"

const weekdayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function Schedule() {
    const [profile, setProfile] = useState<any>(null)
    const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) // 0-6 (Mon-Sun)
    
    // Day Schedule State
    const [schedule, setSchedule] = useState<any>({
        start_time: "09:00",
        end_time: "17:00",
        slot_duration: 30,
        break_start: "13:00",
        break_end: "14:00",
        max_patients_per_slot: 1,
        is_active: true
    })

    const [loading, setLoading] = useState(true)
    const [loadingSchedule, setLoadingSchedule] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        const initData = async () => {
            try {
                const prof = await getPortalProfile()
                setProfile(prof)
            } catch (err) {
                console.error("Failed to load doctor profile:", err)
                setErrorMessage("Failed to load doctor profile.")
            } finally {
                setLoading(false)
            }
        }
        initData()
    }, [])

    useEffect(() => {
        if (profile?.doctor_id) {
            loadSchedule()
        }
    }, [profile, selectedDay])

    const loadSchedule = async () => {
        setLoadingSchedule(true)
        setErrorMessage("")
        try {
            const data = await getHardenedSchedule(profile.doctor_id, selectedDay)
            // data is an array of schedules for that day
            if (data && data.length > 0) {
                // Since there is only ONE schedule per day per doctor (due to unique index)
                const docSchedule = data[0];
                setSchedule({
                    start_time: docSchedule.start_time || "09:00",
                    end_time: docSchedule.end_time || "17:00",
                    slot_duration: docSchedule.slot_duration || 30,
                    break_start: docSchedule.break_start || "",
                    break_end: docSchedule.break_end || "",
                    max_patients_per_slot: docSchedule.max_patients_per_slot || 1,
                    is_active: docSchedule.is_active !== undefined ? docSchedule.is_active : true
                })
            } else {
                // Default empty schedule for new day
                setSchedule({
                    start_time: "09:00",
                    end_time: "17:00",
                    slot_duration: 30,
                    break_start: "13:00",
                    break_end: "14:00",
                    max_patients_per_slot: 1,
                    is_active: false // Inactive by default if missing
                })
            }
        } catch (err) {
            console.error("Failed to load schedule:", err)
            setErrorMessage("Failed to load schedule for this day.")
        } finally {
            setLoadingSchedule(false)
        }
    }

    const handleFieldChange = (field: string, value: any) => {
        setSchedule({ ...schedule, [field]: value })
    }

    const handleSubmit = async () => {
        setErrorMessage("")
        setIsSubmitting(true)
        
        try {
            await saveHardenedSchedule({
                doctor_id: profile.doctor_id,
                day_of_week: selectedDay,
                start_time: schedule.start_time,
                end_time: schedule.end_time,
                slot_duration: schedule.slot_duration,
                break_start: schedule.break_start || null,
                break_end: schedule.break_end || null,
                max_patients_per_slot: schedule.max_patients_per_slot,
                is_active: schedule.is_active
            })
            
            setSuccessMessage(true)
            setTimeout(() => setSuccessMessage(false), 3000)
        } catch (err: any) {
            console.error("Error saving schedule:", err)
            setErrorMessage(err.message || "An error occurred while saving schedule.")
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <DoctorLayout>
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={32} color="#059669" />
                </div>
            </DoctorLayout>
        )
    }

    return (
        <DoctorLayout>
            <div className="pd-page">
                <div className="pd-header" style={{ marginBottom: '24px' }}>
                    <div className="pd-header-content">
                        <h1 className="pd-page-title">My Schedule</h1>
                        <p className="pd-page-sub">Configure your daily working hours, break times, and slot durations seamlessly.</p>
                    </div>
                </div>

                {errorMessage && (
                    <div style={{ padding: '16px', background: '#fef2f2', color: '#991b1b', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <X size={20} /> <span style={{ fontWeight: 600 }}>{errorMessage}</span>
                    </div>
                )}
                {successMessage && (
                    <div style={{ padding: '16px', background: '#ecfdf5', color: '#065f46', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #a7f3d0' }}>
                        <CheckCircle size={20} /> <span style={{ fontWeight: 600 }}>Schedule saved successfully!</span>
                    </div>
                )}

                <div className="pd-main-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="pd-card" style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0px' }}>
                        
                        <div style={{ padding: '30px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <label style={{ fontWeight: 800, color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={18} /> Select Day of Week
                            </label>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {weekdayNames.map((day, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => setSelectedDay(index)}
                                        style={{ 
                                            padding: '12px 20px', borderRadius: '12px', border: '2px solid',
                                            borderColor: selectedDay === index ? '#10b981' : '#e2e8f0',
                                            background: selectedDay === index ? '#10b981' : '#fff',
                                            color: selectedDay === index ? '#fff' : '#475569',
                                            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                                            boxShadow: selectedDay === index ? '0 4px 14px rgba(16, 185, 129, 0.3)' : 'none'
                                        }}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: '30px' }}>
                        {loadingSchedule ? (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <Loader2 className="animate-spin" size={32} color="#10b981" style={{ margin: '0 auto' }} />
                                <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600 }}>Loading config for {weekdayNames[selectedDay]}...</p>
                            </div>
                        ) : (
                            <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                                
                                <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
                                    
                                    {/* Active Toggle */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: schedule.is_active ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}>
                                                <Shield size={22} color={schedule.is_active ? "#10b981" : "#94a3b8"} />
                                                Working Day Status
                                            </h3>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>Toggle off to mark yourself as completely unavailable on {weekdayNames[selectedDay]}s.</p>
                                        </div>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <div style={{ position: 'relative' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={schedule.is_active}
                                                    onChange={(e) => handleFieldChange('is_active', e.target.checked)}
                                                    style={{ opacity: 0, width: 0, height: 0 }}
                                                />
                                                <div style={{ width: '56px', height: '30px', background: schedule.is_active ? '#10b981' : '#cbd5e1', borderRadius: '20px', transition: '0.3s' }}></div>
                                                <div style={{ position: 'absolute', top: '3px', left: schedule.is_active ? '29px' : '3px', width: '24px', height: '24px', background: '#fff', borderRadius: '50%', transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                                            </div>
                                            <span style={{ marginLeft: '12px', fontWeight: 800, fontSize: '1.1rem', color: schedule.is_active ? '#10b981' : '#94a3b8', width: '110px' }}>
                                                {schedule.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </label>
                                    </div>

                                    <div style={{ opacity: schedule.is_active ? 1 : 0.5, pointerEvents: schedule.is_active ? 'auto' : 'none', transition: 'all 0.3s' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                                            <div className="pd-field">
                                                <label style={{ color: '#334155', fontWeight: 700 }}>Work Start Time</label>
                                                <input 
                                                    type="time" 
                                                    className="pd-input" 
                                                    value={schedule.start_time} 
                                                    onChange={(e) => handleFieldChange("start_time", e.target.value)} 
                                                    style={{ padding: '14px', fontSize: '1rem', background: '#f8fafc' }}
                                                />
                                            </div>
                                            <div className="pd-field">
                                                <label style={{ color: '#334155', fontWeight: 700 }}>Work End Time</label>
                                                <input 
                                                    type="time" 
                                                    className="pd-input" 
                                                    value={schedule.end_time} 
                                                    onChange={(e) => handleFieldChange("end_time", e.target.value)} 
                                                    style={{ padding: '14px', fontSize: '1rem', background: '#f8fafc' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                                            <div className="pd-field">
                                                <label style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#64748b', fontWeight: 600 }}>
                                                    <Clock size={16} color="#f59e0b" /> Lunch/Break Start
                                                </label>
                                                <input 
                                                    type="time" 
                                                    className="pd-input" 
                                                    value={schedule.break_start || ""} 
                                                    onChange={(e) => handleFieldChange("break_start", e.target.value)} 
                                                    style={{ padding: '14px', fontSize: '1rem' }}
                                                />
                                            </div>
                                            <div className="pd-field">
                                                <label style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#64748b', fontWeight: 600 }}>
                                                    <Clock size={16} color="#f59e0b" /> Lunch/Break End
                                                </label>
                                                <input 
                                                    type="time" 
                                                    className="pd-input" 
                                                    value={schedule.break_end || ""} 
                                                    onChange={(e) => handleFieldChange("break_end", e.target.value)} 
                                                    style={{ padding: '14px', fontSize: '1rem' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '10px' }}>
                                            <div className="pd-field">
                                                <label style={{ color: '#334155', fontWeight: 700 }}>Slot Duration (Minutes)</label>
                                                <select 
                                                    className="pd-input"
                                                    value={schedule.slot_duration}
                                                    onChange={(e) => handleFieldChange("slot_duration", parseInt(e.target.value))}
                                                    style={{ padding: '14px', fontSize: '1rem', background: '#f8fafc' }}
                                                >
                                                    <option value={15}>15 Mins (Quick Consult)</option>
                                                    <option value={20}>20 Mins</option>
                                                    <option value={30}>30 Mins (Standard)</option>
                                                    <option value={45}>45 Mins</option>
                                                    <option value={60}>60 Mins (Deep Consult)</option>
                                                </select>
                                            </div>
                                            <div className="pd-field">
                                                <label style={{ color: '#334155', fontWeight: 700 }}>Max Patients Per Slot</label>
                                                <select 
                                                    className="pd-input"
                                                    value={schedule.max_patients_per_slot}
                                                    onChange={(e) => handleFieldChange("max_patients_per_slot", parseInt(e.target.value))}
                                                    style={{ padding: '14px', fontSize: '1rem', background: '#f8fafc' }}
                                                >
                                                    <option value={1}>1 Patient / Slot (Private)</option>
                                                    <option value={2}>2 Patients / Slot</option>
                                                    <option value={3}>3 Patients / Slot</option>
                                                    <option value={4}>4 Patients / Slot (Group)</option>
                                                    <option value={5}>5 Patients / Slot</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
                                    <button 
                                        className="pd-btn-primary" 
                                        onClick={handleSubmit} 
                                        disabled={isSubmitting}
                                        style={{ height: '54px', padding: '0 40px', fontSize: '1.05rem', boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)', borderRadius: '14px' }}
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 size={20} className="animate-spin" /> Saving Configuration...</>
                                        ) : (
                                            <><Save size={20} /> Save Schedule for {weekdayNames[selectedDay]}</>
                                        )}
                                    </button>
                                </div>
                                
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </DoctorLayout>
    )
}

export default Schedule
