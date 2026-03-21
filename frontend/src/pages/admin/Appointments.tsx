import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Search, Trash2, Bookmark, Clock, User, Loader2, CalendarDays, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { getAllAppointments, deleteAppointment, updateAppointmentStatus } from "../../services/adminService"

function Appointments() {
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all") 
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchAppointments = useCallback(async () => {
        setLoading(true)
        try {
            // Using backend search and filter
            const data = await getAllAppointments(searchTerm, statusFilter)
            setAppointments(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to fetch appointments", err)
        } finally {
            setLoading(false)
        }
    }, [searchTerm, statusFilter])

    useEffect(() => {
        const timeoutId = setTimeout(fetchAppointments, 400)
        return () => clearTimeout(timeoutId)
    }, [fetchAppointments])

    const handleCancel = async (id: string) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return
        setActionLoading(id)
        try {
            await deleteAppointment(id)
            await fetchAppointments()
        } catch (err) {
            alert("Failed to cancel appointment")
        } finally {
            setActionLoading(null)
        }
    }

    const handleComplete = async (id: string) => {
        setActionLoading(id)
        try {
            await updateAppointmentStatus(id, "completed")
            await fetchAppointments()
        } catch (err) {
            alert("Failed to update status")
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <AdminLayout>
            <div className="ad-page" style={{ animation: 'slideDownIn 0.4s ease-out' }}>
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1 className="ad-page-title">Appointment Management</h1>
                        <p className="ad-page-sub">Monitor all hospital schedules, cancellations, and active bookings globally.</p>
                    </div>
                    <button className="ad-btn-duo" onClick={() => navigate("/admin/add-appointment")}>
                        <Bookmark size={18} />
                        <span>Book Appointment</span>
                    </button>
                </div>

                <div className="ad-card">
                    <div className="ad-list-header">
                        <div className="ad-search-bar">
                            <Search size={18} color="#94a3b8" />
                            <input 
                                type="text" 
                                placeholder="Search by ID, Patient or Doctor..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="ad-filter-bar">
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select className="ad-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="all">All Statuses</option>
                                    <option value="booked">Active / Booked</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="no_show">No Show</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="ad-table-wrap" style={{ minHeight: '400px' }}>
                        <table className="ad-table">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Patient Info</th>
                                    <th>Assigned Specialist</th>
                                    <th>Schedule</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '100px 0' }}>
                                            <Loader2 className="animate-spin" size={32} style={{ color: '#3b82f6', margin: '0 auto' }} />
                                        </td>
                                    </tr>
                                ) : appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8' }}>
                                            <CalendarDays size={48} style={{ opacity: 0.2, margin: '0 auto 15px' }} />
                                            <p>No appointments found matching your criteria.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    appointments.map((apt, i) => (
                                        <tr key={apt._id || i} style={{ animation: `fadeIn 0.3s ease-out ${i*0.05}s forwards`, opacity: 0 }}>
                                            <td>
                                                <div className="ad-user-info">
                                                    <span className="ad-user-name" style={{ fontWeight: 800 }}>{apt._id?.slice(-6).toUpperCase() || "N/A"}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span className="ad-user-sub">{apt.reason || "General Consult"}</span>
                                                        {apt.urgent && <span style={{ fontSize: '0.6rem', color: '#fff', background: '#ef4444', padding: '1px 6px', borderRadius: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Urgent</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ad-user-cell">
                                                    <div className="ad-avatar" style={{ background: '#f1f5f9', color: '#3b82f6', width: '36px', height: '36px' }}>
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="ad-user-name" style={{ fontSize: '0.9rem' }}>{apt.patient_name || "Unknown"}</span>
                                                        <span className="ad-user-sub" style={{ fontSize: '0.75rem' }}>{apt.patient_phone || ""}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ad-user-info">
                                                    <span className="ad-user-name" style={{ fontSize: '0.9rem' }}>Dr. {apt.doctor_name || "Unknown"}</span>
                                                    <span className="ad-user-sub">{apt.specialization || ""}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ad-user-info">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>
                                                        <Clock size={14} color="#64748b" /> {apt.time}
                                                    </div>
                                                    <span className="ad-user-sub">{apt.date}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`ad-status ad-status--${(apt.status || 'booked').toLowerCase()}`}>
                                                    {apt.status || "Booked"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="ad-actions" style={{ justifyContent: 'flex-end' }}>
                                                    {apt.status === "booked" && (
                                                        <>
                                                            <button 
                                                                className="ad-icon-btn" 
                                                                title="Mark Completed" 
                                                                style={{ color: '#10b981', background: '#10b98110' }}
                                                                onClick={() => handleComplete(apt._id)}
                                                                disabled={actionLoading === apt._id}
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button 
                                                                className="ad-icon-btn danger" 
                                                                title="Cancel Booking" 
                                                                style={{ color: '#ef4444', background: '#ef444410' }}
                                                                onClick={() => handleCancel(apt._id)}
                                                                disabled={actionLoading === apt._id}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {actionLoading === apt._id && <Loader2 className="animate-spin" size={16} />}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing {appointments.length} appointments total</span>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes slideDownIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    to { opacity: 1; }
                }
            `}</style>
        </AdminLayout>
    )
}

export default Appointments
