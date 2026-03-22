import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Search, Plus, Loader2, Clock, Calendar, Edit2, CheckCircle2, X } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { getGlobalSchedules, resetGlobalSchedules, updateDoctorSchedule } from "../../services/adminService"

function DoctorSchedules() {
    const [schedules, setSchedules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [shiftFilter, setShiftFilter] = useState("all")
    const [success, setSuccess] = useState("")
    
    // Modal States
    const [showEditModal, setShowEditModal] = useState(false)
    const [currentSchedule, setCurrentSchedule] = useState<any>(null)
    const [timeState, setTimeState] = useState({ start: "09:00", end: "17:00", lunchStart: "", lunchEnd: "" })
    const [saving, setSaving] = useState(false)

    const fetchSchedules = useCallback(async (search: string) => {
        setLoading(true)
        try {
            const data = await getGlobalSchedules(search)
            setSchedules(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to fetch schedules", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchSchedules(searchTerm)
        }, 400)
        return () => clearTimeout(timeoutId)
    }, [searchTerm, fetchSchedules])

    const filteredSchedules = schedules.filter(s => {
        // Filter out non-doctors (if any provider has no name or specialization)
        if (!s.doctor_name || !s.specialization) return false;
        
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        if (shiftFilter !== 'all') {
            const hours = s.working_hours || "";
            const isMorning = hours.includes('09:00') || hours.includes('08:00');
            if (shiftFilter === 'morning' && !isMorning) return false;
            if (shiftFilter === 'afternoon' && isMorning) return false;
        }
        return true;
    })

    const handleEditClick = (schedule: any) => {
        let start = schedule.start_time;
        let end = schedule.end_time;
        if (!start || !end) {
            const splitHours = (schedule.working_hours || "09:00 - 17:00").split(" - ");
            start = splitHours[0];
            end = splitHours[1];
        }

        setTimeState({ 
            start: start || "09:00", 
            end: end || "17:00",
            lunchStart: schedule.lunch_start_time || "",
            lunchEnd: schedule.lunch_end_time || ""
        })
        setCurrentSchedule({ 
            ...schedule, 
            working_days: schedule.working_days || ["Mon", "Tue", "Wed", "Thu", "Fri"],
            slot_duration: schedule.slot_duration || 30
        })
        setShowEditModal(true)
    }

    const handleDayToggle = (day: string) => {
        const currentDays = currentSchedule?.working_days || []
        const newDays = currentDays.includes(day) 
            ? currentDays.filter((d: string) => d !== day)
            : [...currentDays, day]
        setCurrentSchedule({ ...currentSchedule, working_days: newDays })
    }

    const handleSaveSchedule = async () => {
        setSaving(true)
        try {
            const updatedHours = `${timeState.start} - ${timeState.end}`
            
            // Auto-calculate capacity via rigorous subtraction of lunch minutes
            const toMin = (t: string) => {
                if (!t) return 0;
                const [h, m] = t.split(":").map(Number);
                return h * 60 + m;
            }
            const totalMin = toMin(timeState.end) - toMin(timeState.start);
            const lunchMin = (timeState.lunchStart && timeState.lunchEnd && toMin(timeState.lunchEnd) > toMin(timeState.lunchStart)) 
                ? toMin(timeState.lunchEnd) - toMin(timeState.lunchStart) : 0;
            const finalMins = totalMin - lunchMin;
            const calcSlots = finalMins > 0 ? Math.floor(finalMins / (currentSchedule.slot_duration || 30)) : 0;

            const payload = { 
                ...currentSchedule, 
                working_hours: updatedHours,
                start_time: timeState.start,
                end_time: timeState.end,
                lunch_start_time: timeState.lunchStart || null,
                lunch_end_time: timeState.lunchEnd || null,
                slots_per_day: calcSlots
            }
            
            await updateDoctorSchedule(currentSchedule._id, payload)
            setSchedules(prev => prev.map(s => s._id === currentSchedule._id ? payload : s))
            setSuccess(`Schedule for Dr. ${currentSchedule.doctor_name} updated successfully.`)
            setShowEditModal(false)
            setTimeout(() => setSuccess(""), 4000)
        } catch (err) {
            console.error("Save Error:", err)
        } finally {
            setSaving(false)
        }
    }

    const handleMassUpdate = async () => {
        if (!window.confirm("Apply current shift (09:00-17:00, Mon-Fri) to ALL medical staff?")) return;
        setLoading(true)
        try {
            await resetGlobalSchedules()
            setSuccess("Mass update completed successfully for all active providers.")
            fetchSchedules(searchTerm)
            setTimeout(() => setSuccess(""), 4000)
        } catch (err) {
            console.error("Mass Update Error:", err)
        } finally {
            setLoading(false)
        }
    }

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    return (
        <AdminLayout>
            <div className="ad-page" style={{ animation: 'slideUp 0.5s ease-out' }}>
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1 className="ad-page-title">Doctor Schedules</h1>
                        <p className="ad-page-sub">Monitor and configure hospital-wide shift rotations and availability.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="ad-btn-duo" onClick={handleMassUpdate}>
                            <Plus size={18} />
                            <span>Mass Update</span>
                        </button>
                    </div>
                </div>

                {success && (
                    <div style={{ padding: '15px', background: '#dcfce7', color: '#166534', borderRadius: '12px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #bbf7d0', animation: 'slideDownIn 0.3s' }}>
                        <CheckCircle2 size={20} />
                        <span style={{ fontWeight: 600 }}>{success}</span>
                    </div>
                )}

                <div className="ad-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    {loading && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(2px)', zIndex: 10, display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
                            <Loader2 className="animate-spin" size={32} color="#3b82f6" style={{ marginTop: '100px' }} />
                        </div>
                    )}

                    <div className="ad-list-header">
                        <div className="ad-search-bar" style={{ width: '380px' }}>
                            <Search size={18} color="#94a3b8" />
                            <input 
                                type="text" 
                                placeholder="Search doctor, department, ID..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="ad-filter-bar">
                            <select 
                                className="ad-filter-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Status: All</option>
                                <option value="Reporting">Reporting</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Absent">Absent</option>
                            </select>
                            <select 
                                className="ad-filter-select"
                                value={shiftFilter}
                                onChange={(e) => setShiftFilter(e.target.value)}
                            >
                                <option value="all">Shift: All</option>
                                <option value="morning">Morning Shift</option>
                                <option value="afternoon">Afternoon Shift</option>
                            </select>
                        </div>
                    </div>

                    <div className="ad-table-wrap">
                        {filteredSchedules.length === 0 && !loading ? (
                            <div style={{ textAlign: 'center', padding: '120px 0' }}>
                                <Calendar size={48} color="#cbd5e0" style={{ marginBottom: '16px' }} />
                                <p style={{ color: '#94a3b8' }}>No schedules found matching your criteria.</p>
                            </div>
                        ) : (
                            <table className="ad-table">
                                <thead>
                                    <tr>
                                        <th>Doctor / Provider</th>
                                        <th>Department</th>
                                        <th>Working Days</th>
                                        <th>Shift Timing</th>
                                        <th>Capacity</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSchedules.map((schedule, i) => (
                                        <tr key={schedule._id || i}>
                                            <td>
                                                <div className="ad-user-cell">
                                                    <div className="ad-avatar" style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', width: '38px', height: '38px', fontWeight: 700 }}>
                                                        {(schedule.doctor_name || "D").replace('Dr. ', '').charAt(0)}
                                                    </div>
                                                    <div className="ad-user-info">
                                                        <span className="ad-user-name" style={{ fontSize: '0.9rem' }}>{schedule.doctor_name}</span>
                                                        <span className="ad-user-sub">{schedule.qualification || "Specialist"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ padding: '4px 8px', background: '#3b82f610', color: '#3b82f6', borderRadius: '4px', display: 'inline-block', fontSize: '0.75rem', fontWeight: 700 }}>
                                                    {schedule.specialization}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                    {(!schedule.working_days || schedule.working_days.length === 0) ? (
                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Not Assigned</span>
                                                    ) : (
                                                        schedule.working_days.map((day: string, idx: number) => (
                                                            <span key={idx} style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{day}</span>
                                                        ))
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600, fontSize: '0.8rem' }}>
                                                    <Clock size={14} color="#3b82f6" />
                                                    <span>{schedule.working_hours || "09:00 - 17:00"}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{schedule.slots_per_day || 0}</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Slots / Day</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`ad-status ad-status--${(schedule.status || 'Reporting').toLowerCase().replace(' ', '-')}`}>
                                                    {schedule.status || 'Reporting'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="ad-actions" style={{ justifyContent: 'flex-end' }}>
                                                    <button 
                                                        onClick={() => handleEditClick(schedule)}
                                                        className="ad-icon-btn" 
                                                        title="Modify Timing" 
                                                        style={{ background: '#3b82f6', color: '#fff', border: 'none' }}
                                                    >
                                                        <Edit2 size={15} />
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

                {/* Edit Schedule Modal */}
                {showEditModal && currentSchedule && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', overflowY: 'auto', zIndex: 1000, animation: 'fadeIn 0.2s' }}>
                        <div className="ad-card" style={{ width: '100%', maxWidth: '600px', padding: '0', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', border: 'none', margin: 'auto' }}>
                            <div style={{ background: 'linear-gradient(135deg, #0dcb6e, #3b82f6)', padding: '24px 30px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Shift Configuration</h3>
                                    <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>Dr. {currentSchedule.doctor_name} | {currentSchedule.specialization}</p>
                                </div>
                                <button onClick={() => setShowEditModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', color: '#fff', padding: '8px', cursor: 'pointer', display: 'flex' }}><X size={22} /></button>
                            </div>
                            
                            <div style={{ padding: '35px', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
                                <div style={{ marginBottom: '30px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '0.05em' }}>Working Days Selection</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {daysOfWeek.map(day => (
                                            <button 
                                                key={day}
                                                onClick={() => handleDayToggle(day)}
                                                style={{ 
                                                    padding: '10px 16px', borderRadius: '10px', border: '1.5px solid',
                                                    borderColor: currentSchedule.working_days.includes(day) ? '#3b82f6' : '#e2e8f0',
                                                    background: currentSchedule.working_days.includes(day) ? '#3b82f6' : '#f8fafc',
                                                    color: currentSchedule.working_days.includes(day) ? '#fff' : '#64748b',
                                                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s',
                                                    boxShadow: currentSchedule.working_days.includes(day) ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none'
                                                }}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                                    <div className="ad-field">
                                        <label>Shift Start Time</label>
                                        <div style={{ position: 'relative' }}>
                                            <input 
                                                type="time" 
                                                className="ad-input" 
                                                style={{ width: '100%', height: '48px', fontSize: '1rem' }}
                                                value={timeState.start} 
                                                onChange={(e) => setTimeState({...timeState, start: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="ad-field">
                                        <label>Shift End Time</label>
                                        <input 
                                            type="time" 
                                            className="ad-input" 
                                            style={{ width: '100%', height: '48px', fontSize: '1rem' }}
                                            value={timeState.end} 
                                            onChange={(e) => setTimeState({...timeState, end: e.target.value})}
                                        />
                                    </div>
                                    <div className="ad-field">
                                        <label>Lunch Start Time</label>
                                        <input 
                                            type="time" 
                                            className="ad-input" 
                                            style={{ width: '100%', height: '48px', fontSize: '1rem' }}
                                            value={timeState.lunchStart} 
                                            onChange={(e) => setTimeState({...timeState, lunchStart: e.target.value})}
                                        />
                                    </div>
                                    <div className="ad-field">
                                        <label>Lunch End Time</label>
                                        <input 
                                            type="time" 
                                            className="ad-input" 
                                            style={{ width: '100%', height: '48px', fontSize: '1rem' }}
                                            value={timeState.lunchEnd} 
                                            onChange={(e) => setTimeState({...timeState, lunchEnd: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="ad-field" style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Slot Duration (Minutes)</label>
                                    <select
                                        className="ad-input"
                                        style={{ height: '48px', fontSize: '1rem', fontWeight: 700 }}
                                        value={currentSchedule.slot_duration || 30}
                                        onChange={(e) => setCurrentSchedule({...currentSchedule, slot_duration: parseInt(e.target.value)})}
                                    >
                                        <option value={15}>15 Minutes</option>
                                        <option value={30}>30 Minutes</option>
                                        <option value={45}>45 Minutes</option>
                                        <option value={60}>60 Minutes</option>
                                    </select>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', display: 'block' }}>How long each patient appointment will last.</span>
                                </div>

                                <div className="ad-field" style={{ marginBottom: '35px' }}>
                                    <label>Daily Patient Capacity (Slots)</label>
                                    <input 
                                        type="number" 
                                        className="ad-input" 
                                        style={{ height: '48px', fontSize: '1.1rem', fontWeight: 700, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }}
                                        value={(() => {
                                            const toMin = (t: string) => {
                                                if (!t) return 0;
                                                const [h, m] = t.split(":").map(Number);
                                                return h * 60 + m;
                                            }
                                            const totalMin = toMin(timeState.end) - toMin(timeState.start);
                                            const lunchMin = (timeState.lunchStart && timeState.lunchEnd && toMin(timeState.lunchEnd) > toMin(timeState.lunchStart)) 
                                                ? toMin(timeState.lunchEnd) - toMin(timeState.lunchStart) : 0;
                                            const finalMins = totalMin - lunchMin;
                                            return finalMins > 0 ? Math.floor(finalMins / (currentSchedule.slot_duration || 30)) : 0;
                                        })()} 
                                        readOnly
                                    />
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', display: 'block' }}>Auto-calculated: (Shift − Lunch) ÷ Slot Duration</span>
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
                                        style={{ flex: 2, justifyContent: 'center', height: '52px' }}
                                    >
                                        {saving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                                        <span style={{ fontSize: '1rem' }}>{saving ? 'Saving...' : 'Confirm Schedule'}</span>
                                    </button>
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
