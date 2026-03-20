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
                <div className="pd-header">
                    <div className="pd-header-content">
                        <h1 className="pd-page-title">Manage Absences</h1>
                        <p className="pd-page-sub">Mark specific dates for planned leave. Approved dates automatically override your weekly schedule.</p>
                    </div>
                    <div className="pd-header-actions">
                        <button className="pd-action-btn-primary" onClick={() => setIsAdding(true)}>
                            <Plus size={18} />
                            <span>Mark New Absence</span>
                        </button>
                    </div>
                </div>

                <div className="pd-main-grid">
                    <div className="pd-card pd-card--main">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 className="pd-card-subtitle" style={{ margin: 0 }}>Absence History</h2>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', background: '#f8fafc', padding: '4px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>DATE OVERRIDES</span>
                        </div>

                        {leaves.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '10px 20px', color: '#64748b' }}>
                                <Calendar size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                <p style={{ fontWeight: 600 }}>No planned absences recorded yet.</p>
                                <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>Use the button above to block dates where you are unavailable.</p>
                            </div>
                        ) : (
                            <div className="pd-break-list">
                                {leaves.map(leave => (
                                    <div key={leave._id} className="pd-break-item" style={{ padding: '16px', borderRadius: '14px', marginBottom: '16px' }}>
                                        <div className="pd-break-date" style={{ background: '#fef2f2', color: '#ef4444', width: '60px', height: '60px', borderRadius: '12px' }}>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                                                {new Date(leave.date || leave.leave_date).getDate() || "?"}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>
                                                {leave.date || leave.leave_date ? new Date(leave.date || leave.leave_date).toLocaleDateString(undefined, { month: 'short' }).toUpperCase() : "N/A"}
                                            </span>
                                        </div>
                                        <div className="pd-break-info" style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800 }}>{leave.reason}</h4>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={14} /> Planned Offline (Override Active)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pd-side-stack">
                        <div className="pd-card pd-card--premium">
                            <AlertCircle className="pd-premium-star" size={32} />
                            <h3 style={{ margin: '16px 0 8px 0', fontWeight: 800 }}>Active Protocols</h3>
                            <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>Marking an absence will automatically block all consulting slots for that date. Any pre-booked appointments will be flagged for review.</p>
                        </div>
                    </div>
                </div>
            </div>

            {isAdding && (
                <div className="pd-modal-overlay">
                    <div className="pd-modal" style={{ maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Mark Planned Absence</h3>
                            <div onClick={() => setIsAdding(false)} style={{ cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></div>
                        </div>

                        <div className="pd-field" style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Absence Date</label>
                            <input type="date" className="pd-input" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} style={{ padding: '14px' }} />
                        </div>
                        <div className="pd-field" style={{ marginBottom: '32px' }}>
                            <label style={{ fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Reason for Absence</label>
                            <textarea 
                                className="pd-textarea" 
                                value={leaveReason} 
                                onChange={(e) => setLeaveReason(e.target.value)} 
                                placeholder="e.g. Continuing Medical Education, Personal Time Off"
                                style={{ padding: '14px', minHeight: '100px' }}
                            />
                        </div>

                        <div className="pd-modal-actions">
                            <button className="pd-action-btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                            <button 
                                className="pd-action-btn-primary" 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                style={{ padding: '12px 32px' }}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={18} /><span>Confirm Absence</span></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DoctorLayout>
    )
}

export default Leaves
