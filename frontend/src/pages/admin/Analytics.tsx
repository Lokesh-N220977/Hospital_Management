import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Download, MoreVertical, TrendingUp, Users, Activity, CreditCard, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getAdminDashboardData } from "../../services/adminService"
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar,
    ComposedChart, Line, Legend
} from 'recharts'

function Analytics() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await getAdminDashboardData()
                setStats(data)
            } catch (err) {
                console.error("Failed to fetch analytics", err)
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
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

    // Realistic Dummy Data augmented with real stats
    const summaryStats = [
        { title: "Total Doctors", value: stats?.total_doctors?.toString() || "0", growth: "+4.2%", isPositive: true, icon: <Activity size={20} />, color: "#22c55e" },
        { title: "Total Patients", value: stats?.total_patients?.toString() || "0", growth: "+8.5%", isPositive: true, icon: <Users size={20} />, color: "#3b82f6" },
        { title: "Today's Visits", value: stats?.today_appointments?.toString() || "0", growth: "+5.8%", isPositive: true, icon: <Activity size={20} />, color: "#8b5cf6" },
        { title: "Total Appointments", value: stats?.total_appointments?.toString() || "0", growth: "+12.4%", isPositive: true, icon: <TrendingUp size={20} />, color: "#f59e0b" },
    ];

    const volumeData = [
        { name: 'Mon', thisWeek: 42, lastWeek: 38 },
        { name: 'Tue', thisWeek: 78, lastWeek: 52 },
        { name: 'Wed', thisWeek: 92, lastWeek: 88 },
        { name: 'Thu', thisWeek: 64, lastWeek: 75 },
        { name: 'Fri', thisWeek: 110, lastWeek: 68 },
        { name: 'Sat', thisWeek: 48, lastWeek: 42 },
        { name: 'Sun', thisWeek: 35, lastWeek: 28 },
    ];

    const demoData = [
        { name: 'Adults (18-64)', value: 840, color: '#3b82f6' },
        { name: 'Seniors (65+)', value: 420, color: '#8b5cf6' },
        { name: 'Children (0-17)', value: 215, color: '#10b981' },
        { name: 'Infants', value: 85, color: '#f59e0b' },
    ];

    const deptData = [
        { name: 'Cardiology', appts: 185, revenue: 12500 },
        { name: 'Neurology', appts: 142, revenue: 9800 },
        { name: 'Orthopedics', appts: 210, revenue: 15400 },
        { name: 'Pediatrics', appts: 285, revenue: 11200 },
        { name: 'Dermatology', appts: 98, revenue: 8500 },
        { name: 'General', appts: 450, revenue: 22000 },
    ];

    const yearlyRevenue = [
        { month: 'Jan', revenue: 32000, target: 30000, patients: 450 },
        { month: 'Feb', revenue: 34500, target: 31000, patients: 480 },
        { month: 'Mar', revenue: 38000, target: 35000, patients: 520 },
        { month: 'Apr', revenue: 36500, target: 36000, patients: 510 },
        { month: 'May', revenue: 42000, target: 38000, patients: 590 },
        { month: 'Jun', revenue: 45800, target: 40000, patients: 630 },
        { month: 'Jul', revenue: 48200, target: 42000, patients: 670 },
        { month: 'Aug', revenue: 44500, target: 43000, patients: 610 },
        { month: 'Sep', revenue: 49800, target: 45000, patients: 690 },
        { month: 'Oct', revenue: 52000, target: 47000, patients: 720 },
        { month: 'Nov', revenue: 55000, target: 50000, patients: 750 },
        { month: 'Dec', revenue: 62000, target: 55000, patients: 820 },
    ];

    return (
        <AdminLayout>
            <div className="ad-page" style={{ animation: 'slideDownIn 0.4s ease-out' }}>
                {/* Header Section */}
                <div className="ad-header" style={{ marginBottom: '24px' }}>
                    <div className="ad-header-content">
                        <h1 className="ad-page-title" style={{ fontSize: '1.8rem', fontWeight: 800 }}>Reports & Analytics</h1>
                        <p className="ad-page-sub">Data-driven insights into hospital operations and growth.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="ad-btn-primary" style={{ background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
                            Last 30 Days
                        </button>
                        <button className="ad-btn-duo">
                            <Download size={18} />
                            <span>Export PDF</span>
                        </button>
                    </div>
                </div>

                {/* Top Summary Widgets */}
                <div className="ad-stats-grid" style={{ marginBottom: '24px' }}>
                    {summaryStats.map((stat, idx) => (
                        <div key={idx} className="ad-card" style={{ padding: '20px', marginBottom: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: `${stat.color}15`,
                                    color: stat.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {stat.icon}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: stat.isPositive ? '#22c55e' : '#ef4444',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    background: stat.isPositive ? '#22c55e10' : '#ef444410',
                                    padding: '2px 8px',
                                    borderRadius: '20px'
                                }}>
                                    {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {stat.growth}
                                </div>
                            </div>
                            <h4 style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>{stat.title}</h4>
                            <p style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 800, margin: '4px 0 0 0' }}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="ad-chart-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '24px',
                    alignItems: 'stretch'
                }}>

                    {/* Main Revenue Trend - Spans full width if possible */}
                    <div className="ad-card" style={{ padding: '24px', gridColumn: '1 / -1' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Revenue & Patient Growth</h3>
                                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0 0 0' }}>Year over year financial performance tracking</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#22c55e' }}></div> Revenue
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                                    <div style={{ width: '8px', height: '2px', background: '#ef4444' }}></div> Target
                                </div>
                            </div>
                        </div>
                        <div style={{ height: '350px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={yearlyRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        tickFormatter={(val) => `$${val / 1000}k`}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar yAxisId="left" dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Line yAxisId="left" type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Appointment Volume Trend */}
                    <div className="ad-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>Weekly Traffic</h3>
                            <MoreVertical size={16} color="#94a3b8" />
                        </div>
                        <div style={{ height: '280px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={volumeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="thisWeek" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#blueGrad)" />
                                    <Area type="monotone" dataKey="lastWeek" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Department Breakdown */}
                    <div className="ad-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>Departmental Load</h3>
                            <select style={{ border: 'none', background: 'transparent', color: '#64748b', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}>
                                <option>By Appointments</option>
                                <option>By Revenue</option>
                            </select>
                        </div>
                        <div style={{ height: '280px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deptData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }}
                                        width={90}
                                    />
                                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    <Bar dataKey="appts" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Patient Demographics */}
                    <div className="ad-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>Patient Segmentation</h3>
                        </div>
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={demoData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {demoData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Doctors Table Placeholder or another Chart */}
                    <div className="ad-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>Top Performers</h3>
                            <button style={{ color: '#3b82f6', background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>View Details</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { name: "Dr. Sarah Johnson", dept: "Cardiology", score: "98.5%", trend: "up" },
                                { name: "Dr. Emily Smith", dept: "Pediatrics", score: "96.2%", trend: "up" },
                                { name: "Dr. Robert Chen", dept: "Neurology", score: "94.8%", trend: "down" },
                                { name: "Dr. Michael Lee", dept: "Orthopedics", score: "92.1%", trend: "up" },
                            ].map((doc, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#3b82f6', fontSize: '0.7rem' }}>
                                            {doc.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{doc.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{doc.dept}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{doc.score}</div>
                                        <div style={{ fontSize: '0.65rem', color: doc.trend === 'up' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>Satisfaction</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    )
}

export default Analytics
