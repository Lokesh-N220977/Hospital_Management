import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Users, Stethoscope, Calendar, Activity, ArrowRight, TrendingUp, Loader2, PieChart as PieIcon, BarChart } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAdminDashboardData, getAllAppointments } from "../../services/adminService"
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    PieChart, Pie, Cell, Legend
} from 'recharts'

function AdminDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState<any>(null)
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true;
        const fetchDashboardData = async () => {
            try {
                const [statsRes, apptsRes] = await Promise.all([
                    getAdminDashboardData(),
                    getAllAppointments()
                ])
                if (isMounted) {
                    setStats(statsRes)
                    setAppointments(Array.isArray(apptsRes) ? apptsRes.slice(0, 5) : [])
                    setError(null)
                }
            } catch (err: any) {
                console.error("Dashboard Fetch Error:", err)
                if (isMounted) setError("Failed to fetch live data. Please check your connection.")
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        
        fetchDashboardData()
        const intervalId = setInterval(fetchDashboardData, 10000); // 10s for stability

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        }
    }, [])

    if (loading) {
        return (
            <AdminLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                        <p style={{ marginTop: '15px', color: 'var(--text-gray)', fontWeight: 500 }}>Initializing analytics hub...</p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    const statCards = [
        { title: "Total Doctors", value: stats?.total_doctors?.toString() || "0", trend: "Verified Staff", icon: <Stethoscope size={28} />, color: "blue" },
        { title: "Total Patients", value: stats?.total_patients?.toString() || "0", trend: "Active Registry", icon: <Users size={28} />, color: "green" },
        { title: "Today's Visits", value: stats?.today_appointments?.toString() || "0", trend: "Scheduled for today", icon: <Calendar size={28} />, color: "purple" },
        { title: "Avg. Daily Feed", value: "98%", trend: "Service Excellence", icon: <TrendingUp size={28} />, color: "orange" },
    ]

    // Prep charts data
    const pieData = stats?.status_distribution ? Object.entries(stats.status_distribution).map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value 
    })) : [];

    const PIE_COLORS = ['var(--primary)', '#10b981', '#8b5cf6', '#f43f5e', '#0ea5e9'];

    return (
        <AdminLayout>
            <div className="ad-page">
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1 className="ad-page-title">Hospital Analytics Engine</h1>
                        <p className="ad-page-sub">Intelligent monitoring of staff activity, patient growth, and booking trends.</p>
                    </div>
                </div>

                {error && (
                    <div style={{ 
                        marginBottom: '25px', 
                        padding: '12px 16px', 
                        borderRadius: '10px', 
                        background: 'var(--status-error-bg)', 
                        color: 'var(--status-error-text)', 
                        border: '1px solid var(--border-color)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        fontSize: '0.9rem' 
                    }}>
                        <Activity size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="ad-stats-grid">
                    {statCards.map((stat, i) => (
                        <div key={i} className={`ad-stat-card ad-stat--${stat.color}`}>
                            <div className="ad-stat-icon-wrap" style={{ 
                                background: stat.color === 'blue' ? '#3b82f6' : 
                                            stat.color === 'green' ? '#10b981' : 
                                            stat.color === 'purple' ? '#8b5cf6' : 
                                            '#f59e0b',
                                color: '#fff',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                            }}>{stat.icon}</div>
                            <div className="ad-stat-info">
                                <span className="ad-stat-value">{stat.value}</span>
                                <span className="ad-stat-label">{stat.title}</span>
                                <span className="ad-stat-trend" style={{ color: 'var(--status-success-text)' }}>{stat.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '25px', marginBottom: '30px' }}>
                    {/* Weekly Trend Chart */}
                    <div className="ad-card" style={{ padding: '25px' }}>
                        <div className="ad-card-header" style={{ marginBottom: '20px' }}>
                            <h2 className="ad-card-title">
                                <span style={{ color: 'var(--primary)' }}><BarChart size={20} style={{ marginRight: '8px' }} /></span>
                                Booking Velocity (7D)
                            </h2>
                        </div>
                        <div style={{ width: '100%', height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats?.weekly_trend || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                                    <XAxis dataKey="date" stroke="var(--chart-text)" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                    <YAxis stroke="var(--chart-text)" fontSize={12} allowDecimals={false} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'var(--chart-tooltip-bg)', 
                                            borderRadius: '12px', 
                                            border: '1px solid var(--chart-tooltip-border)', 
                                            boxShadow: 'var(--shadow-lg)' 
                                        }}
                                        itemStyle={{ color: 'var(--text-main)' }}
                                    />
                                    <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Status Breakdown Chart */}
                    <div className="ad-card" style={{ padding: '25px' }}>
                        <div className="ad-card-header" style={{ marginBottom: '20px' }}>
                            <h2 className="ad-card-title">
                                <span style={{ color: '#8b5cf6' }}><PieIcon size={20} style={{ marginRight: '8px' }} /></span>
                                Status Mix
                            </h2>
                        </div>
                        <div style={{ width: '100%', height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'var(--chart-tooltip-bg)', 
                                            borderRadius: '12px', 
                                            border: '1px solid var(--chart-tooltip-border)' 
                                        }}
                                    />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="ad-card">
                    <div className="ad-card-header">
                        <h2 className="ad-card-title">Real-time Activity Stream</h2>
                        <button 
                            className="ad-btn-primary" 
                            style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'var(--bg-soft)', color: 'var(--text-gray)', border: 'none' }}
                            onClick={() => navigate("/admin/appointments")}
                        >
                            Complete Register <ArrowRight size={16} />
                        </button>
                    </div>
                    <div className="ad-table-wrap">
                        <table className="ad-table">
                            <thead>
                                <tr>
                                    <th>Patient Profile</th>
                                    <th>Practitioner</th>
                                    <th>Scheduled Time</th>
                                    <th>Flow Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((appt, i) => (
                                    <tr key={appt._id || i}>
                                        <td>
                                            <div className="ad-user-cell">
                                                <div className="ad-avatar" style={{ background: `linear-gradient(135deg, ${PIE_COLORS[i % 5]}, #94a3b8)` }}>
                                                    {(appt.patient_name || "P").charAt(0)}
                                                </div>
                                                <div className="ad-user-info">
                                                    <span className="ad-user-name">{appt.patient_name || "Unknown Patient"}</span>
                                                    <span className="ad-user-sub">#{appt._id?.slice(-6).toUpperCase() || "NEW"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ad-user-info">
                                                <span className="ad-user-name" style={{ color: 'var(--text-main)' }}>Dr. {appt.doctor_name || "Assessing"}</span>
                                                <span className="ad-user-sub">{appt.specialization || "Clinical"}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ad-user-info">
                                                <span className="ad-user-name" style={{ fontWeight: 700 }}>{appt.time || "Immediate"}</span>
                                                <span className="ad-user-sub">{appt.date}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`ad-status ad-status--${(appt.status || 'booked').toLowerCase()}`}>
                                                {appt.status || "Booked"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {appointments.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                            <Calendar size={48} style={{ opacity: 0.1, margin: '0 auto 15px' }} />
                                            <p style={{ fontWeight: 500 }}>No active appointments found in the system registry.</p>
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
