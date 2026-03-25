import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { Loader2, TrendingUp, Users, Calendar, Clock, BarChart3, PieChart as PieIcon, Activity, AlertTriangle, Search } from "lucide-react";
import {
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar, AreaChart, Area
} from "recharts";

const PIE_COLORS = ["var(--primary)", "#10b981", "#8b5cf6"];

export default function Analytics() {
  const [overview, setOverview] = useState<any>({});
  const [daily, setDaily] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Interactive filtering for Workload
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [o, d, doc, s, dept] = await Promise.all([
          api.get("/admin/analytics/overview"),
          api.get("/admin/analytics/daily"),
          api.get("/admin/analytics/doctors"),
          api.get("/admin/analytics/slots"),
          api.get("/admin/analytics/departments"),
      ]);

      setOverview(o.data.data);
      setDaily(d.data.data);
      setDoctors(doc.data.data);
      setSlots(s.data.data);
      setDepartments(dept.data.data);
      
      // Auto-select initial doctors
      if (doc.data.data.length > 0) {
        setSelectedDocs(doc.data.data.slice(0, 10).map((dr: any) => dr._id));
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(dr => selectedDocs.includes(dr._id));
  }, [doctors, selectedDocs]);

  const toggleDoc = (id: string) => {
    setSelectedDocs(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const selectAllDocs = () => {
    setSelectedDocs(doctors.map(d => d._id));
  };

  const clearDocs = () => {
    setSelectedDocs([]);
  };

  const selectTop10 = () => {
    // Sort by total performance first and then take top 10
    const sorted = [...doctors].sort((a, b) => b.total - a.total);
    setSelectedDocs(sorted.slice(0, 10).map(d => d._id));
  };

  // Filtered list for the selection UI
  const searchedDoctors = useMemo(() => {
    if (!searchQuery) return doctors;
    return doctors.filter(dr => dr._id.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [doctors, searchQuery]);

  if (loading) {
      return (
          <AdminLayout>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={64} strokeWidth={1} color="var(--primary)" />
                    <p style={{ marginTop: '16px', color: 'var(--text-gray)', fontWeight: 500, letterSpacing: '1px' }}>PREPARING INSIGHTS...</p>
                  </div>
              </div>
          </AdminLayout>
      );
  }

  if (error) {
      return (
          <AdminLayout>
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ background: 'var(--status-error-bg)', padding: '40px', borderRadius: '24px', display: 'inline-block', border: '1px solid var(--border-color)' }}>
                    <AlertTriangle size={48} color="var(--status-error-text)" style={{ marginBottom: '16px' }} />
                    <h2 style={{ color: 'var(--status-error-text)', marginBottom: '8px' }}>Analytics Unavailable</h2>
                    <p style={{ color: 'var(--status-error-text)' }}>Could not establish connection to the data engine.</p>
                  </div>
              </div>
          </AdminLayout>
      )
  }

  const lineData = daily.map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  const pieData = [
    { name: "Completed", value: overview.completed || 0 },
    { name: "Cancelled", value: overview.cancelled || 0 },
    { name: "Booked", value: overview.booked || 0 },
  ];

  const StatCard = ({ label, value, color, icon: Icon }: any) => (
    <div className="ad-stat-card">
        <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05 }}>
            <Icon size={100} color="var(--primary)" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ 
                background: `linear-gradient(135deg, ${color}, ${color}dd)`, 
                padding: "8px", 
                borderRadius: "10px",
                color: '#fff',
                boxShadow: `0 4px 10px ${color}20`
            }}>
                <Icon size={18} />
            </div>
            <p className="ad-stat-label">{label}</p>
        </div>
        <h3 className="ad-stat-value">{value || 0}</h3>
    </div>
  );

  return (
    <AdminLayout>
        <div className="ad-page">
            
            <div className="ad-analytics-header">
                <div className="ad-header-content">
                    <h1 className="text-primary-gradient">Intelligence Report</h1>
                    <p>Data-driven oversight for hospital operations.</p>
                </div>
                <div className="ad-sync-badge">
                    <Clock size={18} color="var(--text-muted)" />
                    <span>Real-time Sync Active</span>
                    <div className="ad-sync-dot" />
                </div>
            </div>

            {/* Overview Stats */}
            <div className="ad-stats-grid">
                <StatCard label="Total Bookings" value={overview.total} color="#3b82f6" icon={Calendar} />
                <StatCard label="Live Orders" value={overview.booked} color="#f59e0b" icon={Activity} />
                <StatCard label="Successful" value={overview.completed} color="#10b981" icon={TrendingUp} />
                <StatCard label="Attrition" value={overview.cancelled} color="#ef4444" icon={Users} />
            </div>

            {/* Row 1: Line Chart & Pie Chart */}
            <div className="ad-analytics-grid-2">
                
                {/* Engagement Trend */}
                <div className="ad-card">
                    <div className="ad-card-header">
                        <div className="ad-card-title">
                            <TrendingUp size={24} color="var(--primary)" />
                            Engagement Trend
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--status-success-text)', fontWeight: 700, background: 'var(--status-success-bg)', padding: '4px 10px', borderRadius: '20px' }}>+12% vs last week</span>
                    </div>
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer>
                            <AreaChart data={lineData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'var(--chart-text)', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--chart-text)', fontSize: 12}} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: "12px", boxShadow: "var(--shadow-lg)" }} itemStyle={{ color: 'var(--text-main)' }} />
                                <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" dot={{r: 5, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--bg-white)'}} activeDot={{r: 7, strokeWidth: 0}} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Service Outcome */}
                <div className="ad-card">
                    <div className="ad-card-header">
                        <div className="ad-card-title">
                            <PieIcon size={24} color="var(--status-success-text)" />
                            Service Outcome
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie 
                                    data={pieData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={120} 
                                    innerRadius={85} 
                                    paddingAngle={10} 
                                    stroke="none"
                                    animationBegin={200}
                                    animationDuration={1200}
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: "12px", boxShadow: "var(--shadow-lg)" }} itemStyle={{ color: 'var(--text-main)' }} />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle" 
                                    wrapperStyle={{ paddingTop: '20px', fontWeight: 700, fontSize: '14px', color: 'var(--text-gray)' }} 
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Doctor Workload Bar Chart */}
            <div className="ad-card">
                <div className="ad-card-header" style={{ flexWrap: 'wrap', gap: '20px' }}>
                    <div className="ad-card-title">
                        <BarChart3 size={24} color="#8b5cf6" />
                        <div>
                            Personnel Performance
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>Total appointments weighted by doctor.</p>
                        </div>
                    </div>
                    
                    {/* Interaction Tools */}
                    <div className="ad-doc-controls">
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <div className="ad-search-bar" style={{ width: '200px', height: '36px', padding: '0 12px' }}>
                                <Search size={14} color="var(--text-muted)" />
                                <input 
                                    placeholder="Search staff..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ fontSize: '0.8rem' }}
                                />
                            </div>
                            <button onClick={selectTop10} className="ad-doc-pill" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>TOP 10</button>
                            <button onClick={selectAllDocs} className="ad-doc-pill">SELECT ALL ({doctors.length})</button>
                            <button onClick={clearDocs} className="ad-doc-pill danger" style={{ color: 'var(--status-error-text)', borderColor: 'var(--status-error-text)' }}>CLEAR</button>
                        </div>
                        <div className="ad-doc-pills-wrap" style={{ marginTop: '8px' }}>
                            {searchedDoctors.map(dr => (
                                <button 
                                    key={dr._id}
                                    onClick={() => toggleDoc(dr._id)}
                                    className={`ad-doc-pill ${selectedDocs.includes(dr._id) ? 'ad-doc-pill-active' : ''}`}
                                >
                                    {dr._id}
                                </button>
                            ))}
                            {searchedDoctors.length === 0 && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px' }}>No matches found.</span>
                            ) }
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                            {selectedDocs.length} selected for comparison
                        </div>
                    </div>
                </div>

                <div style={{ width: "100%", height: filteredDoctors.length * 40 + 100 }}>
                    {!filteredDoctors.length ? (
                        <div style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                            <Users size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <p>No doctors selected for comparison.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer>
                            <BarChart data={filteredDoctors} layout="vertical" margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--chart-grid)" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: 'var(--chart-text)', fontSize: 12}} />
                                <YAxis 
                                    dataKey="_id" 
                                    type="category"
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: 'var(--text-dark)', fontSize: 13, fontWeight: 800}} 
                                    width={140}
                                />
                                <Tooltip cursor={{fill: 'var(--primary-light)'}} contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: "12px", boxShadow: "var(--shadow-lg)" }} itemStyle={{ color: 'var(--text-main)' }} />
                                <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={25} animationDuration={1000} name="Total Patients">
                                    {filteredDoctors.map((_, index) => (
                                        <Cell key={`barcel-${index}`} fill={index % 2 === 0 ? "var(--primary)" : "#c084fc"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Department Workload Section */}
            <div className="ad-card">
                <div className="ad-card-header">
                    <div className="ad-card-title">
                        <Activity size={24} color="#10b981" />
                        <div>
                            Department Capacity Analysis
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>Operational workload across medical specialties.</p>
                        </div>
                    </div>
                </div>
                <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer>
                        <BarChart data={departments} layout="vertical" margin={{ top: 10, right: 40, left: 40, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--chart-grid)" />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="_id" 
                                type="category" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: 'var(--text-dark)', fontSize: 13, fontWeight: 800}} 
                                width={120} 
                            />
                            <Tooltip cursor={{fill: 'var(--primary-light)'}} contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: "12px" }} />
                            <Bar dataKey="total" fill="#10b981" radius={[0, 10, 10, 0]} barSize={35} name="Appointments" animationDuration={1500} label={{ position: 'right', fill: 'var(--text-main)', fontSize: 12, fontWeight: 700 }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Peak Time Slots Section */}
            <div className="ad-card">
                <div className="ad-card-header">
                    <div className="ad-card-title">
                        <Clock size={24} color="#ec4899" />
                        High-Capacity Intervals
                    </div>
                </div>
                <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer>
                        <BarChart data={slots} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--chart-grid)" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: 'var(--chart-text)', fontSize: 12}} />
                            <YAxis dataKey="slot" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dark)', fontSize: 13, fontWeight: 800}} width={80} />
                            <Tooltip cursor={{fill: 'var(--primary-light)'}} contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: "12px", boxShadow: "var(--shadow-lg)" }} itemStyle={{ color: 'var(--text-main)' }} />
                            <Bar dataKey="count" fill="#ec4899" radius={[0, 8, 8, 0]} barSize={28} name="Total Visits" animationDuration={1500} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    </AdminLayout>
  );
}
