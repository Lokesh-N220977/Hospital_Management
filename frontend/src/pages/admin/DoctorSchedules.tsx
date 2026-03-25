import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Search, Loader2, Calendar, Edit2, CheckCircle2, X } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { getAllDoctors, getDoctorSchedules, saveDoctorSchedule } from "../../services/adminService"

const weekdayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function DoctorSchedules() {
    const [doctors, setDoctors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [success, setSuccess] = useState("")
    
    // Modal States
    const [showEditModal, setShowEditModal] = useState(false)
    const [currentDoctor, setCurrentDoctor] = useState<any>(null)
    const [selectedDay, setSelectedDay] = useState<number>(1) // Default to Tuesday
    const [loadingSchedule, setLoadingSchedule] = useState(false)
    const [saving, setSaving] = useState(false)

    // Schedule form state
    const [scheduleState, setScheduleState] = useState({
        start_time: "09:00",
        end_time: "17:00",
        slot_duration: 30,
        break_start: "13:00",
        break_end: "14:00",
        max_patients_per_slot: 1,
        is_active: true
    })

    const fetchDoctors = useCallback(async (search: string) => {
        setLoading(true)
        try {
            const data = await getAllDoctors(search, "all", "all", 1, 100)
            setDoctors(Array.isArray(data) ? data : (data.doctors || []))
        } catch (err) {
            console.error("Failed to fetch doctors", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchDoctors(searchTerm)
        }, 400)
        return () => clearTimeout(timeoutId)
    }, [searchTerm, fetchDoctors])

    const handleEditClick = (doctor: any) => {
        setCurrentDoctor(doctor)
        setSelectedDay(1) // Default open to Tuesday
        setShowEditModal(true)
    }

    // Load schedule when modal opens or day changes
    useEffect(() => {
        if (!showEditModal || !currentDoctor) return;

        const loadSchedule = async () => {
            setLoadingSchedule(true)
            try {
                // Fetch the exact layout for this doctor on this day
                const data = await getDoctorSchedules(currentDoctor.user_id || currentDoctor._id, selectedDay)
                
                if (data && data.length > 0) {
                    const docSchedule = data[0];
                    setScheduleState({
                        start_time: docSchedule.start_time || "09:00",
                        end_time: docSchedule.end_time || "17:00",
                        slot_duration: docSchedule.slot_duration || 30,
                        break_start: docSchedule.break_start || "",
                        break_end: docSchedule.break_end || "",
                        max_patients_per_slot: docSchedule.max_patients_per_slot || 1,
                        is_active: docSchedule.is_active !== undefined ? docSchedule.is_active : true
                    })
                } else {
                    // Fallback empty
                    setScheduleState({
                        start_time: "09:00",
                        end_time: "17:00",
                        slot_duration: 30,
                        break_start: "13:00",
                        break_end: "14:00",
                        max_patients_per_slot: 1,
                        is_active: false
                    })
                }
            } catch (err) {
                console.error("Failed to load doctor schedule", err)
            } finally {
                setLoadingSchedule(false)
            }
        }
        loadSchedule()
    }, [showEditModal, currentDoctor, selectedDay])

    const handleSaveSchedule = async () => {
        setSaving(true)
        try {
            const payload = {
                doctor_id: currentDoctor.user_id || currentDoctor._id,
                day_of_week: selectedDay,
                start_time: scheduleState.start_time,
                end_time: scheduleState.end_time,
                slot_duration: scheduleState.slot_duration,
                break_start: scheduleState.break_start || null,
                break_end: scheduleState.break_end || null,
                max_patients_per_slot: scheduleState.max_patients_per_slot,
                is_active: scheduleState.is_active
            }
            
            await saveDoctorSchedule(payload)
            setSuccess(`Schedule for ${currentDoctor.name} on ${weekdayNames[selectedDay]} updated successfully.`)
            setTimeout(() => setSuccess(""), 4000)
        } catch (err) {
            console.error("Save Error:", err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <AdminLayout>
            <div className="ad-page" style={{ animation: 'slideUp 0.5s ease-out' }}>
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1 className="ad-page-title">Doctor Schedules</h1>
                        <p className="ad-page-sub">Manage dynamic daily shift rotations for hospital staff.</p>
                    </div>
                </div>

                {success && (
                    <div style={{ padding: '15px', background: '#ecfdf5', color: '#065f46', borderRadius: '12px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #a7f3d0', animation: 'slideDownIn 0.3s' }}>
                        <CheckCircle2 size={20} />
                        <span style={{ fontWeight: 600 }}>{success}</span>
                    </div>
                )}

                <div className="ad-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    {loading && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(2px)', zIndex: 10, display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
                            <Loader2 className="animate-spin" size={32} color="#3b82f6" />
                        </div>
                    )}

                    <div className="ad-list-header">
                        <div className="ad-search-bar" style={{ width: '100%', maxWidth: '400px' }}>
                            <Search size={18} color="#94a3b8" />
                            <input 
                                type="text" 
                                placeholder="Search by doctor name or specialization..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="ad-table-wrap">
                        {doctors.length === 0 && !loading ? (
                            <div style={{ textAlign: 'center', padding: '120px 0' }}>
                                <Calendar size={48} color="#cbd5e0" style={{ marginBottom: '16px', margin: '0 auto' }} />
                                <p style={{ color: '#94a3b8' }}>No doctors found to schedule.</p>
                            </div>
                        ) : (
                            <table className="ad-table">
                                <thead>
                                    <tr>
                                        <th>Doctor / Provider</th>
                                        <th>Department</th>
                                        <th>Experience</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctors.map((doctor, i) => (
                                        <tr key={doctor._id || i}>
                                            <td>
                                                <div className="ad-user-cell">
                                                    <div className="ad-avatar" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', width: '40px', height: '40px', fontWeight: 700 }}>
                                                        {(doctor.name || "D").replace('Dr. ', '').charAt(0)}
                                                    </div>
                                                    <div className="ad-user-info">
                                                        <span className="ad-user-name" style={{ fontSize: '0.95rem' }}>{doctor.name}</span>
                                                        <span className="ad-user-sub">{doctor.qualification || "Specialist"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '6px', display: 'inline-block', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    {doctor.specialization}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{doctor.experience} Yrs</span>
                                            </td>
                                            <td>
                                                <span className={`ad-status ad-status--${doctor.available ? 'active' : 'absent'}`}>
                                                    {doctor.available ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="ad-actions" style={{ justifyContent: 'flex-end' }}>
                                                    <button 
                                                        onClick={() => handleEditClick(doctor)}
                                                        className="ad-icon-btn" 
                                                        style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', display: 'flex', gap: '8px', fontWeight: 600 }}
                                                    >
                                                        <Edit2 size={16} /> Manage Schedule
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Extended Edit Schedule Modal */}
                {showEditModal && currentDoctor && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'fadeIn 0.2s' }}>
                        <div className="ad-card" style={{ width: '100%', maxWidth: '750px', padding: '0', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', border: 'none', margin: '20px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', padding: '24px 30px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Shift Configuration</h3>
                                    <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>{currentDoctor.name} | {currentDoctor.specialization}</p>
                                </div>
                                <button onClick={() => setShowEditModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', color: '#fff', padding: '8px', cursor: 'pointer', display: 'flex' }}><X size={22} /></button>
                            </div>
                            
                            <div style={{ padding: '0px', overflowY: 'auto' }}>
                                <div style={{ padding: '24px 30px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '0.05em' }}>Target Day</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {weekdayNames.map((day, index) => (
                                            <button 
                                                key={day}
                                                onClick={() => setSelectedDay(index)}
                                                style={{ 
                                                    padding: '10px 16px', borderRadius: '10px', border: '2px solid',
                                                    borderColor: selectedDay === index ? '#2563eb' : '#e2e8f0',
                                                    background: selectedDay === index ? '#2563eb' : '#fff',
                                                    color: selectedDay === index ? '#fff' : '#64748b',
                                                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s'
                                                }}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ padding: '30px' }}>
                                    {loadingSchedule ? (
                                        <div style={{ padding: '40px', textAlign: 'center' }}>
                                            <Loader2 size={32} className="animate-spin" color="#2563eb" style={{ margin: '0 auto' }} />
                                            <p style={{ marginTop: '15px', color: '#64748b', fontWeight: 600 }}>Loading Schedule parameters...</p>
                                        </div>
                                    ) : (
                                        <div style={{ animation: 'fadeIn 0.3s' }}>
                                            {/* Active Toggle */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Active on {weekdayNames[selectedDay]}?</h3>
                                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Toggle off if the doctor does not work on this day.</p>
                                                </div>
                                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={scheduleState.is_active}
                                                            onChange={(e) => setScheduleState({...scheduleState, is_active: e.target.checked})}
                                                            style={{ opacity: 0, width: 0, height: 0 }}
                                                        />
                                                        <div style={{ width: '50px', height: '26px', background: scheduleState.is_active ? '#2563eb' : '#cbd5e1', borderRadius: '20px', transition: '0.3s' }}></div>
                                                        <div style={{ position: 'absolute', top: '3px', left: scheduleState.is_active ? '27px' : '3px', width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                                                    </div>
                                                </label>
                                            </div>

                                            <div style={{ opacity: scheduleState.is_active ? 1 : 0.4, pointerEvents: scheduleState.is_active ? 'auto' : 'none', transition: 'all 0.3s' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                                                    <div className="ad-field">
                                                        <label>Work Start Time</label>
                                                        <input 
                                                            type="time" 
                                                            className="ad-input" 
                                                            style={{ height: '48px', fontSize: '1rem', background: '#f8fafc' }}
                                                            value={scheduleState.start_time} 
                                                            onChange={(e) => setScheduleState({...scheduleState, start_time: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="ad-field">
                                                        <label>Work End Time</label>
                                                        <input 
                                                            type="time" 
                                                            className="ad-input" 
                                                            style={{ height: '48px', fontSize: '1rem', background: '#f8fafc' }}
                                                            value={scheduleState.end_time} 
                                                            onChange={(e) => setScheduleState({...scheduleState, end_time: e.target.value})}
                                                        />
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                                                    <div className="ad-field">
                                                        <label>Break Start (Optional)</label>
                                                        <input 
                                                            type="time" 
                                                            className="ad-input" 
                                                            style={{ height: '48px', fontSize: '1rem' }}
                                                            value={scheduleState.break_start} 
                                                            onChange={(e) => setScheduleState({...scheduleState, break_start: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="ad-field">
                                                        <label>Break End (Optional)</label>
                                                        <input 
                                                            type="time" 
                                                            className="ad-input" 
                                                            style={{ height: '48px', fontSize: '1rem' }}
                                                            value={scheduleState.break_end} 
                                                            onChange={(e) => setScheduleState({...scheduleState, break_end: e.target.value})}
                                                        />
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '35px' }}>
                                                    <div className="ad-field">
                                                        <label>Slot Duration</label>
                                                        <select
                                                            className="ad-input"
                                                            style={{ height: '48px', fontSize: '1rem', fontWeight: 600 }}
                                                            value={scheduleState.slot_duration}
                                                            onChange={(e) => setScheduleState({...scheduleState, slot_duration: parseInt(e.target.value)})}
                                                        >
                                                            <option value={15}>15 Minutes</option>
                                                            <option value={20}>20 Minutes</option>
                                                            <option value={30}>30 Minutes</option>
                                                            <option value={45}>45 Minutes</option>
                                                            <option value={60}>60 Minutes</option>
                                                        </select>
                                                    </div>
                                                    <div className="ad-field">
                                                        <label>Capacity Per Slot</label>
                                                        <select
                                                            className="ad-input"
                                                            style={{ height: '48px', fontSize: '1rem', fontWeight: 600 }}
                                                            value={scheduleState.max_patients_per_slot}
                                                            onChange={(e) => setScheduleState({...scheduleState, max_patients_per_slot: parseInt(e.target.value)})}
                                                        >
                                                            <option value={1}>1 Patient Check-in</option>
                                                            <option value={2}>2 Patient Overlap</option>
                                                            <option value={3}>3 Patients Max</option>
                                                            <option value={4}>4 Patients Max</option>
                                                            <option value={5}>5 Group Session</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <button 
                                                    onClick={() => setShowEditModal(false)}
                                                    className="ad-btn-primary" 
                                                    style={{ flex: 1, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', justifyContent: 'center', height: '52px' }}
                                                >
                                                    Discard
                                                </button>
                                                <button 
                                                    onClick={handleSaveSchedule}
                                                    disabled={saving}
                                                    className="ad-btn-duo" 
                                                    style={{ flex: 2, justifyContent: 'center', height: '52px', background: '#2563eb', color: '#fff' }}
                                                >
                                                    {saving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                                                    <span style={{ fontSize: '1rem' }}>{saving ? 'Saving...' : `Save ${weekdayNames[selectedDay]} Schedule`}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default DoctorSchedules
