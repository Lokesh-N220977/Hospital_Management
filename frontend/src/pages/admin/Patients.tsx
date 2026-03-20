import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Search, Filter, Edit2, Eye, Ban, Download, UserPlus, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { getAllPatients } from "../../services/adminService"

function Patients() {
    const navigate = useNavigate()
    const [patients, setPatients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await getAllPatients()
                setPatients(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error("Failed to fetch patients", err)
            } finally {
                setLoading(false)
            }
        }
        fetchPatients()
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
                        <h1 className="ad-page-title">Patient Management</h1>
                        <p className="ad-page-sub">Centralized repository for patient records, medical history, and status tracking.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="ad-btn-primary" style={{ background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
                            <Download size={18} />
                            <span>Export CSV</span>
                        </button>
                        <button className="ad-btn-duo" onClick={() => navigate("/admin/add-patient")}>
                                <UserPlus size={18} />
                                <span>Register Patient</span>
                        </button>
                    </div>
                </div>

                <div className="ad-card">
                    <div className="ad-list-header">
                        <div className="ad-search-bar">
                            <Search size={18} color="#94a3b8" />
                            <input type="text" placeholder="Search patients by name, ID or email..." />
                        </div>
                        <div className="ad-filter-bar">
                            <select className="ad-filter-select">
                                <option value="all">Medical Status: All</option>
                                <option value="active">Active Treatment</option>
                                <option value="discharged">Discharged</option>
                                <option value="pending">Recovery</option>
                            </select>
                            <button className="ad-btn-primary" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                                <Filter size={18} /> Filters
                            </button>
                        </div>
                    </div>

                    <div className="ad-table-wrap">
                        <table className="ad-table">
                            <thead>
                                <tr>
                                    <th>Patient Details</th>
                                    <th>Primary Issue</th>
                                    <th>Assigned Doctor</th>
                                    <th>Last Visit</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((pt, i) => (
                                    <tr key={pt._id || i}>
                                        <td>
                                            <div className="ad-user-cell">
                                                <div className="ad-avatar" style={{
                                                    background: `hsl(${i * 60}, 70%, 50%)`,
                                                    width: '40px',
                                                    height: '40px',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {(pt.name || "P").charAt(0)}
                                                </div>
                                                <div className="ad-user-info">
                                                    <span className="ad-user-name" style={{ fontSize: '0.95rem' }}>{pt.name}</span>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <span className="ad-user-sub" style={{ fontWeight: 600 }}>{pt._id?.slice(-6).toUpperCase() || "N/A"}</span>
                                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>•</span>
                                                        <span className="ad-user-sub">{pt.age || 25} Yrs</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="ad-user-name" style={{ fontSize: '0.85rem', color: '#1e293b' }}>{pt.issue || "General Checkup"}</span>
                                        </td>
                                        <td>
                                            <div className="ad-user-info">
                                                <span className="ad-user-name" style={{ fontSize: '0.85rem' }}>{pt.doctor_name || "Unassigned"}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="ad-user-name" style={{ fontSize: '0.85rem' }}>{pt.lastVisit || "N/A"}</span>
                                        </td>
                                        <td>
                                            <span className={`ad-status ad-status--${pt.status || 'active'}`}>
                                                {(pt.status || 'active').charAt(0).toUpperCase() + (pt.status || 'active').slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="ad-actions" style={{ justifyContent: 'flex-end' }}>
                                                <button className="ad-icon-btn" title="View Records" style={{ color: '#3b82f6', background: '#3b82f610' }}><Eye size={16} /></button>
                                                <button className="ad-icon-btn" title="Edit Profile" style={{ color: '#22c55e', background: '#22c55e10' }}><Edit2 size={16} /></button>
                                                <button className="ad-icon-btn danger" title="Suspend Account" style={{ color: '#ef4444', background: '#ef444410' }}><Ban size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing {patients.length} records total</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>Previous</button>
                            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#3b82f6', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>1</button>
                            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>2</button>
                            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>3</button>
                            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default Patients
