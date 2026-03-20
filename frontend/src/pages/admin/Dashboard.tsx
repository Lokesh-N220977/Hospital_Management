import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Users, Stethoscope, Calendar, Activity, ArrowRight, TrendingUp, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getAdminDashboardData, getAllAppointments } from "../../services/adminService"

function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch both stats and recent appointments
                const [statsRes, apptsRes] = await Promise.all([
                    getAdminDashboardData(),
                    getAllAppointments()
                ])
                setStats(statsRes)
                setAppointments(Array.isArray(apptsRes) ? apptsRes.slice(0, 5) : [])
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
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

    const statCards = [
        { title: "Total Doctors", value: stats?.total_doctors?.toString() || "0", trend: "+4% from last month", icon: <Stethoscope size={28} />, color: "blue" },
        { title: "Total Patients", value: stats?.total_patients?.toString() || "0", trend: "+12% total growth", icon: <Users size={28} />, color: "green" },
        { title: "Today's Visits", value: stats?.today_appointments?.toString() || "0", trend: "Scheduled for today", icon: <Calendar size={28} />, color: "purple" },
        { title: "System Status", value: "99.9%", trend: "All services operational", icon: <Activity size={28} />, color: "orange" },
    ]

    return (
        <AdminLayout>
            <div className="ad-page">
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1 className="ad-page-title">Admin Dashboard</h1>
                        <p className="ad-page-sub">Comprehensive overview of hospital activities and metrics.</p>
                    </div>
                    <button className="ad-btn-duo">
                        <TrendingUp size={18} />
                        <span>Download Report</span>
                    </button>
                </div>

                <div className="ad-stats-grid">
                    {statCards.map((stat, i) => (
                        <div key={i} className={`ad-stat-card ad-stat--${stat.color}`}>
                            <div className="ad-stat-icon-wrap">{stat.icon}</div>
                            <div className="ad-stat-info">
                                <span className="ad-stat-value">{stat.value}</span>
                                <span className="ad-stat-label">{stat.title}</span>
                                <span className="ad-stat-trend">{stat.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="ad-card">
                    <div className="ad-card-header">
                        <h2 className="ad-card-title">Recent Activity</h2>
                        <button className="ad-btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>See Complete History <ArrowRight size={16} /></button>
                    </div>
                    <div className="ad-table-wrap">
                        <table className="ad-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Practitioner</th>
                                    <th>Timing</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((appt, i) => (
                                    <tr key={appt._id || i}>
                                        <td>
                                            <div className="ad-user-cell">
                                                <div className="ad-avatar">{(appt.patient_name || "P").charAt(0)}</div>
                                                <div className="ad-user-info">
                                                    <span className="ad-user-name">{appt.patient_name || "Unknown"}</span>
                                                    <span className="ad-user-sub">#{appt._id?.slice(-6).toUpperCase() || "N/A"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ad-user-info">
                                                <span className="ad-user-name">{appt.doctor_name || "Unassigned"}</span>
                                                <span className="ad-user-sub">{appt.specialty || "General"}</span>
                                            </div>
                                        </td>
                                        <td><span className="ad-user-sub" style={{ fontWeight: 700 }}>{appt.time || "N/A"}</span></td>
                                        <td>
                                            <span className={`ad-status ad-status--${(appt.status || 'booked').toLowerCase()}`}>
                                                {appt.status || "Booked"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {appointments.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                                            No recent appointments found in the system.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminDashboard
