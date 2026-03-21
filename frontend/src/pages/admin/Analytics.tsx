import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { Loader2, TrendingUp, Users, Calendar, Clock, BarChart3, PieChart as PieIcon, Activity, AlertTriangle, Search } from "lucide-react";
import {
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar, AreaChart, Area
} from "recharts";

const PIE_COLORS = ["#10b981", "#ef4444", "#3b82f6"];

export default function Analytics() {
  const [overview, setOverview] = useState<any>({});
  const [daily, setDaily] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
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
      const [o, d, doc, s] = await Promise.all([
          api.get("/admin/analytics/overview"),
          api.get("/admin/analytics/daily"),
          api.get("/admin/analytics/doctors"),
          api.get("/admin/analytics/slots"),
      ]);

      setOverview(o.data.data);
      setDaily(d.data.data);
      setDoctors(doc.data.data);
      setSlots(s.data.data);
      
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
                    <Loader2 className="animate-spin" size={64} strokeWidth={1} color="#3b82f6" />
                    <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 500, letterSpacing: '1px' }}>PREPARING INSIGHTS...</p>
                  </div>
              </div>
          </AdminLayout>
      );
  }

  if (error) {
      return (
          <AdminLayout>
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ background: '#fef2f2', padding: '40px', borderRadius: '24px', display: 'inline-block' }}>
                    <AlertTriangle size={48} color="#dc2626" style={{ marginBottom: '16px' }} />
                    <h2 style={{ color: '#991b1b', marginBottom: '8px' }}>Analytics Unavailable</h2>
                    <p style={{ color: '#dc2626' }}>Could not establish connection to the data engine.</p>
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
        <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}>
            <Icon size={100} color={color} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: `${color}15`, padding: "8px", borderRadius: "10px" }}>
                <Icon size={20} color={color} />
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
                    <h1>Intelligence Report</h1>
                    <p>Data-driven oversight for hospital operations.</p>
                </div>
                <div className="ad-sync-badge">
                    <Clock size={18} color="#94a3b8" />
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
                            <TrendingUp size={24} color="#3b82f6" />
                            Engagement Trend
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, background: '#10b98110', padding: '4px 10px', borderRadius: '20px' }}>+12% vs last week</span>
                    </div>
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer>
                            <AreaChart data={lineData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" dot={{r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 7, strokeWidth: 0}} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Service Outcome */}
                <div className="ad-card">
                    <div className="ad-card-header">
                        <div className="ad-card-title">
                            <PieIcon size={24} color="#10b981" />
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
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle" 
                                    wrapperStyle={{ paddingTop: '20px', fontWeight: 700, fontSize: '14px', color: '#475569' }} 
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
                                <Search size={14} color="#94a3b8" />
                                <input 
                                    placeholder="Search staff..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ fontSize: '0.8rem' }}
                                />
                            </div>
                            <button onClick={selectTop10} className="ad-doc-pill" style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>TOP 10</button>
                            <button onClick={selectAllDocs} className="ad-doc-pill">SELECT ALL ({doctors.length})</button>
                            <button onClick={clearDocs} className="ad-doc-pill danger">CLEAR</button>
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
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '8px' }}>No matches found.</span>
                            ) }
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>
                            {selectedDocs.length} selected for comparison
                        </div>
                    </div>
                </div>

                <div style={{ width: "100%", height: 350 }}>
                    {!filteredDoctors.length ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
                            <Users size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <p>No doctors selected for comparison.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer>
                            <BarChart data={filteredDoctors} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="_id" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#475569', fontSize: 13, fontWeight: 700}} 
                                    interval={0} 
                                    angle={-45} 
                                    textAnchor="end" 
                                    height={80}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                                <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={50} animationDuration={1000}>
                                    {filteredDoctors.map((entry, index) => (
                                        <Cell key={`barcel-${index}`} fill={index % 2 === 0 ? "#8b5cf6" : "#c084fc"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
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
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <YAxis dataKey="slot" type="category" axisLine={false} tickLine={false} tick={{fill: '#1e293b', fontSize: 13, fontWeight: 800}} width={80} />
                            <Tooltip cursor={{fill: '#fff1f2'}} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                            <Bar dataKey="count" fill="#ec4899" radius={[0, 8, 8, 0]} barSize={28} name="Total Visits" animationDuration={1500} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    </AdminLayout>
  );
}
