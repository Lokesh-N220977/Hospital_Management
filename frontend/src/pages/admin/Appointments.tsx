import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Search, Filter, Trash2, Eye, Bookmark, Clock, User, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { getAllAppointments } from "../../services/adminService"

function Appointments() {
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await getAllAppointments()
                setAppointments(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error("Failed to fetch appointments", err)
            } finally {
                setLoading(false)
            }
        }
        fetchAppointments()
    }, [])

    if (loading) {
        return (
            <AdminLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <Loader2 className="animate-spin" size={48} color="#3b82f6" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="ad-page" style={{ animation: 'slideDownIn 0.4s ease-out' }}>
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1 className="ad-page-title">Appointment Management</h1>
                        <p className="ad-page-sub">Monitor all hospital schedules, cancellations, and active bookings globally.</p>
                    </div>
                    <button className="ad-btn-duo" onClick={() => navigate("/admin/appointments/add")}>
                        <Bookmark size={18} />
                        <span>Book Appointment</span>
                    </button>
                </div>

                <div className="ad-card">
                    <div className="ad-list-header">
                        <div className="ad-search-bar">
                            <Search size={18} color="#94a3b8" />
                            <input type="text" placeholder="Search by ID, Patient or Doctor..." />
                        </div>
                        <div className="ad-filter-bar">
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select className="ad-filter-select">
                                    <option value="today">Today's Visits</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="past">History</option>
                                </select>
                                <select className="ad-filter-select">
                                    <option value="all">Priority: All</option>
                                    <option value="urgent">Urgent Only</option>
                                </select>
                            </div>
                            <button className="ad-btn-primary" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                                <Filter size={18} /> Filters
                            </button>
                        </div>
                    </div>

                    <div className="ad-table-wrap">
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
                                {appointments.map((apt, i) => (
                                    <tr key={apt._id || i}>
                                        <td>
                                            <div className="ad-user-info">
                                                <span className="ad-user-name" style={{ fontWeight: 800 }}>{apt._id?.slice(-6).toUpperCase() || "N/A"}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span className="ad-user-sub">{apt.type || "General Consult"}</span>
                                                    {apt.urgent && <span style={{ fontSize: '0.6rem', color: '#fff', background: '#ef4444', padding: '1px 6px', borderRadius: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Urgent</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ad-user-cell">
                                                <div className="ad-avatar" style={{ background: '#f1f5f9', color: '#3b82f6', width: '36px', height: '36px' }}>
                                                    <User size={18} />
                                                </div>
                                                <span className="ad-user-name" style={{ fontSize: '0.9rem' }}>{apt.patient_name || "Unknown Patient"}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ad-user-info">
                                                <span className="ad-user-name" style={{ fontSize: '0.9rem' }}>{apt.doctor_name || "Unknown Doctor"}</span>
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
                                                <button className="ad-icon-btn" title="View Details" style={{ color: '#3b82f6', background: '#3b82f610' }}><Eye size={16} /></button>
                                                <button className="ad-icon-btn danger" title="Cancel Booking" style={{ color: '#ef4444', background: '#ef444410' }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing {appointments.length} appointments total</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>Previous</button>
                            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default Appointments
