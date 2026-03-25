import { useState, useEffect } from "react"
import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { AlertCircle, Calendar, Plus, X, Loader2, CheckCircle } from "lucide-react"
import { getPortalProfile, getPortalLeaves, addLeave } from "../../services/doctorService"

function Leaves() {
    const [profile, setProfile] = useState<any>(null)
    const [leaves, setLeaves] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isAdding, setIsAdding] = useState(false)

    // Form states
    const [leaveDate, setLeaveDate] = useState("")
    const [leaveReason, setLeaveReason] = useState("")

    useEffect(() => {
        const initData = async () => {
            try {
                const prof = await getPortalProfile()
                setProfile(prof)
                
                if (prof && prof.doctor_id) {
                    const leavesData = await getPortalLeaves(prof.doctor_id)
                    setLeaves(Array.isArray(leavesData) ? leavesData : [])
                }
            } catch (err) {
                console.error("Failed to load leaves data:", err)
            } finally {
                setLoading(false)
            }
        }
        initData()
    }, [])

    const handleSubmit = async () => {
        if (!leaveDate || !leaveReason) return alert("Please provide date and reason")
        if (!profile?.doctor_id) return
        
        // Step 6: Validation (Past Dates)
        const selectedDate = new Date(leaveDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (selectedDate < today) {
            return alert("Absence date cannot be in the past.")
        }
        
        setIsSubmitting(true)
        try {
            const res = await addLeave({
                doctor_id: profile.doctor_id,
                date: leaveDate,
                reason: leaveReason
            })
            
            if (res && res.detail) {
                alert(res.detail)
            } else {
                alert("Absence protocol initiated. Calendar blocked for the selected date.")
                // Refresh
                const newList = await getPortalLeaves(profile.doctor_id)
                setLeaves(Array.isArray(newList) ? newList : [])
                setIsAdding(false)
                setLeaveDate("")
                setLeaveReason("")
            }
        } catch (err) {
            console.error("Leave request failed:", err)
            alert("Failed to process request. Check if leave already exists for this date.")
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
                {/* Modern Header Section */}
                <div className="pd-header">
                    <div className="pd-header-content">
                        <h1 className="pd-page-title">Calendar Management</h1>
                        <p className="pd-page-sub">Plan your availability and manage practice leaves with full administrative sync.</p>
                    </div>
                    <div className="pd-header-actions">
                        <button className="pd-action-btn-primary" onClick={() => setIsAdding(true)}>
                            <Plus size={18} />
                            <span>Register Absence</span>
                        </button>
                    </div>
                </div>

                <div className="pd-main-grid">
                    <div className="pd-card pd-card--main">
                        <div className="pd-card-header">
                            <div className="pd-card-title-wrap">
                                <Calendar className="pd-card-icon" />
                                <h2 className="pd-card-title">Leave Registry</h2>
                            </div>
                            <span className="pd-badge-outline">ALL ENTRIES</span>
                        </div>

                        {leaves.length === 0 ? (
                            <div className="pd-empty-state">
                                <div className="pd-empty-icon-wrap">
                                    <Calendar size={42} />
                                </div>
                                <h3 className="pd-empty-title">Clean Calendar</h3>
                                <p className="pd-empty-text">No planned absences recorded in the registry. Your regular weekly schedule is fully operational.</p>
                                <button className="pd-btn-ghost" onClick={() => setIsAdding(true)}>Add Perspective Leave</button>
                            </div>
                        ) : (
                            <div className="pd-leave-stack">
                                {leaves.map((leave, idx) => (
                                    <div key={leave._id || idx} className="pd-leave-card">
                                        <div className="pd-leave-calendar-cell">
                                            <div className="pd-calendar-glyph">
                                                <span className="pd-glyph-month">
                                                    {leave.date || leave.leave_date ? new Date(leave.date || leave.leave_date).toLocaleDateString(undefined, { month: 'short' }).toUpperCase() : "N/A"}
                                                </span>
                                                <span className="pd-glyph-day">
                                                    {new Date(leave.date || leave.leave_date).getDate() || "?"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pd-leave-main-cell">
                                            <div className="pd-leave-header-row">
                                                <h4 className="pd-leave-reason">{leave.reason}</h4>
                                                <div className={`pd-status-tag pd-status-tag--${(leave.status || 'pending').toLowerCase()}`}>
                                                    <div className="pd-status-dot" />
                                                    {leave.status || 'Pending'}
                                                </div>
                                            </div>
                                            <div className="pd-leave-meta-row">
                                                <div className="pd-meta-item">
                                                    <Calendar size={13} />
                                                    <span>Registered on {new Date(leave.created_at || Date.now()).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pd-side-stack">
                        {/* Protocol Card */}
                        <div className="pd-card pd-card--glass-green">
                            <div className="pd-card-icon-circle">
                                <AlertCircle size={20} />
                            </div>
                            <h3 className="pd-side-title">Absence Protocol</h3>
                            <p className="pd-side-text">Once you register a leave, the system performs a conflict check against existing bookings. Approved leaves will automatically notify affected patients and remove slots from the public portal.</p>
                            <div className="pd-side-divider" />
                            <ul className="pd-side-list">
                                <li>Automatic Conflict Resolution</li>
                                <li>Instant Patient Alerts</li>
                                <li>Calendar Sync across devices</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Registration Modal */}
            {isAdding && (
                <div className="pd-modal-overlay pd-modal-overlay--blur">
                    <div className="pd-modal pd-modal--premium animate-slide-up">
                        <div className="pd-modal-header">
                            <div className="pd-modal-title-wrap">
                                <div className="pd-modal-icon-wrap">
                                    <Calendar className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="pd-modal-title">Planned Absence</h3>
                                    <p className="pd-modal-subtitle">Configure your unavailability window</p>
                                </div>
                            </div>
                            <button className="pd-modal-close" onClick={() => setIsAdding(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="pd-modal-body">
                            <div className="pd-form-group">
                                <label className="pd-form-label">ABSENCE DATE</label>
                                <div className="pd-date-input-wrap">
                                    <Calendar className="pd-input-icon" size={18} />
                                    <input 
                                        type="date" 
                                        className="pd-date-input" 
                                        value={leaveDate} 
                                        onChange={(e) => setLeaveDate(e.target.value)} 
                                        onClick={(e) => (e.target as any).showPicker?.()}
                                    />
                                </div>
                                <p className="pd-input-help">Select the full date you will be unavailable for consultation.</p>
                            </div>

                            <div className="pd-form-group">
                                <label className="pd-form-label">REASON FOR ABSENCE</label>
                                <textarea 
                                    className="pd-modern-textarea" 
                                    value={leaveReason} 
                                    onChange={(e) => setLeaveReason(e.target.value)} 
                                    placeholder="e.g., Medical Conference, Personal Leave, Operational Maintenance..."
                                />
                                <div className="pd-textarea-footer">
                                    <span>Professional reasoning helps administrators process requests faster.</span>
                                </div>
                            </div>
                        </div>

                        <div className="pd-modal-footer">
                            <button className="pd-btn-cancel" onClick={() => setIsAdding(false)}>Dismiss</button>
                            <button 
                                className="pd-btn-confirm" 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        <span>Initialize Protocol</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DoctorLayout>
    )
}

export default Leaves
