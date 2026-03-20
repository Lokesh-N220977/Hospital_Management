import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Search, Plus, Filter, Edit2, Eye, Trash2, Mail, Phone, MapPin, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { getAllDoctors } from "../../services/adminService"

function Doctors() {
    const navigate = useNavigate()
    const [doctors, setDoctors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(1)

    const fetchDoctors = async (search: string, p: number) => {
        setLoading(true)
        try {
            const data = await getAllDoctors(search, p)
            setDoctors(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to fetch doctors", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchDoctors(searchTerm, page)
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [searchTerm, page])

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
                        <h1 className="ad-page-title">Manage Doctors</h1>
                        <p className="ad-page-sub">View, edit, and manage all healthcare professionals on the platform.</p>
                    </div>
                    <button className="ad-btn-duo" onClick={() => navigate("/admin/add-doctor")}>
                        <Plus size={18} />
                        <span>Add New Doctor</span>
                    </button>
                </div>

                <div className="ad-card">
                    <div className="ad-list-header">
                        <div className="ad-search-bar">
                            <Search size={18} color="#94a3b8" />
                            <input 
                                type="text" 
                                placeholder="Search doctors by name, ID or specialty..." 
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1); // Reset to first page on search
                                }}
                            />
                        </div>
                        <div className="ad-filter-bar">
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select className="ad-filter-select">
                                    <option value="all">All Specialties</option>
                                    <option value="cardio">Cardiology</option>
                                    <option value="neuro">Neurology</option>
                                    <option value="pedia">Pediatrics</option>
                                </select>
                                <select className="ad-filter-select">
                                    <option value="all">Status: All</option>
                                    <option value="active">Active Only</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <button className="ad-btn-primary" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                                <Filter size={18} /> More Filters
                            </button>
                        </div>
                    </div>

                    <div className="ad-table-wrap">
                        <table className="ad-table">
                            <thead>
                                <tr>
                                    <th>Doctor Details</th>
                                    <th>Contact Info</th>
                                    <th>Experience</th>
                                    <th>Total Patients</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctors.map((doc, i) => (
                                    <tr key={doc._id || i}>
                                        <td>
                                            <div className="ad-user-cell">
                                                <div className="ad-avatar" style={{
                                                    background: `linear-gradient(135deg, ${i % 2 === 0 ? '#3b82f6' : '#22c55e'}, ${i % 2 === 0 ? '#1d4ed8' : '#16a34a'})`,
                                                    width: '40px',
                                                    height: '40px',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {(doc.name || "D").replace('Dr. ', '').charAt(0)}
                                                </div>
                                                <div className="ad-user-info">
                                                    <span className="ad-user-name" style={{ fontSize: '0.95rem' }}>{doc.name}</span>
                                                    <span className="ad-user-sub" style={{ fontWeight: 600, color: '#3b82f6' }}>{doc.specialization || doc.specialty || "General"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ad-user-info">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                                                    <Mail size={12} /> {doc.email}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                                                    <Phone size={12} /> {doc.phone || "N/A"}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="ad-user-name" style={{ fontSize: '0.85rem' }}>{doc.experience ? `${doc.experience} Yrs` : "N/A"}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span className="ad-user-name" style={{ color: '#1e293b' }}>{doc.patients || 0}</span>
                                                <div style={{ width: '60px', height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '4px' }}>
                                                    <div style={{ width: `${Math.min(100, ((doc.patients || 0) / 400) * 100)}%`, height: '100%', background: '#3b82f6', borderRadius: '2px' }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`ad-status ad-status--${doc.status || 'active'}`}>
                                                {(doc.status || 'active').charAt(0).toUpperCase() + (doc.status || 'active').slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="ad-actions" style={{ justifyContent: 'flex-end' }}>
                                                <button className="ad-icon-btn" title="View Profile" style={{ color: '#3b82f6', background: '#3b82f610' }}><Eye size={16} /></button>
                                                <button className="ad-icon-btn" title="Edit Doctor" style={{ color: '#22c55e', background: '#22c55e10' }}><Edit2 size={16} /></button>
                                                <button className="ad-icon-btn danger" title="Deactivate" style={{ color: '#ef4444', background: '#ef444410' }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing {doctors.length} doctors total</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>Previous</button>
                            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#3b82f6', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>1</button>
                            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>2</button>
                            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default Doctors
