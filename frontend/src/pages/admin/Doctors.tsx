import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Search, Plus, Edit2, Eye, Trash2, Mail, Phone, Loader2, CheckCircle2, AlertTriangle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { getAllDoctors, deleteDoctor } from "../../services/adminService"

function Doctors() {
    const navigate = useNavigate()
    const [doctors, setDoctors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [success, setSuccess] = useState("")

    const [searchTerm, setSearchTerm] = useState("")
    const [specialty, setSpecialty] = useState("all")
    const [status, setStatus] = useState("all")
    const [page, setPage] = useState(1)
    
    // Deletion Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [doctorToDelete, setDoctorToDelete] = useState<{id: string, name: string} | null>(null)

    const fetchDoctors = useCallback(async (search: string, spec: string, stat: string, p: number) => {
        setLoading(true)
        try {
            const data = await getAllDoctors(search, spec, stat, p)
            setDoctors(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to fetch doctors", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchDoctors(searchTerm, specialty, status, page)
        }, 400)
        return () => clearTimeout(timeoutId)
    }, [searchTerm, specialty, status, page, fetchDoctors])

    const handleDeleteClick = (id: string, name: string) => {
        setDoctorToDelete({ id, name })
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!doctorToDelete) return
        setActionLoading(doctorToDelete.id)
        setShowDeleteModal(false)
        try {
            await deleteDoctor(doctorToDelete.id)
            setSuccess(`Dr. ${doctorToDelete.name} removed successfully`)
            // Optimistic update
            setDoctors(prev => prev.filter(d => d._id !== doctorToDelete.id))
            setTimeout(() => setSuccess(""), 4000)
        } catch (err) {
            alert("Failed to delete doctor")
        } finally {
            setActionLoading(null)
            setDoctorToDelete(null)
        }
    }

    return (
        <AdminLayout>
            <div className="ad-page" style={{ animation: 'slideDownIn 0.4s ease-out' }}>
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1 className="ad-page-title text-primary-gradient">Manage Doctors</h1>
                        <p className="ad-page-sub">View, edit, and manage all healthcare professionals on the platform.</p>
                    </div>
                    <button className="ad-btn-duo" onClick={() => navigate("/admin/add-doctor")}>
                        <Plus size={18} />
                        <span>Add New Doctor</span>
                    </button>
                </div>

                {success && (
                    <div className="pd-alert pd-alert-success" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--status-success-bg)', color: 'var(--status-success-text)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <CheckCircle2 size={18} />
                        <span>{success}</span>
                    </div>
                )}

                <div className="ad-card" style={{ position: 'relative' }}>
                    {loading && doctors.length > 0 && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.4)', zIndex: 10, display: 'flex', justifyContent: 'center', padding: '100px', borderRadius: '16px' }}>
                            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                        </div>
                    )}

                    <div className="ad-list-header">
                        <div className="ad-search-bar">
                            <Search size={18} color="var(--text-muted)" />
                            <input 
                                type="text" 
                                placeholder="Search doctors by name or email..." 
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1); 
                                }}
                            />
                        </div>
                        <div className="ad-filter-bar">
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select 
                                    className="ad-filter-select"
                                    value={specialty}
                                    onChange={(e) => { setSpecialty(e.target.value); setPage(1); }}
                                >
                                    <option value="all">All Specialties</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Dermatology">Dermatology</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="General Medicine">General Medicine</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                </select>
                                <select 
                                    className="ad-filter-select"
                                    value={status}
                                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                                >
                                    <option value="all">Status: All</option>
                                    <option value="active">Active Only</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="ad-table-wrap">
                        {loading && doctors.length === 0 ? (
                           <div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>
                        ) : (
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
                                        <tr key={doc._id || i} style={{ opacity: actionLoading === doc._id ? 0.3 : 1, transition: '0.4s ease' }}>
                                            <td>
                                                <div className="ad-user-cell">
                                                    <div className="ad-premium-avatar">
                                                        {(doc.name || "D").replace('Dr. ', '').charAt(0)}
                                                    </div>
                                                    <div className="ad-user-info">
                                                        <span className="ad-user-name" style={{ fontSize: '0.95rem' }}>{doc.name}</span>
                                                        <span className="ad-user-sub" style={{ fontWeight: 600, color: 'var(--primary)' }}>{doc.specialization || "General"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ad-user-info">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                                        <Mail size={12} /> {doc.email}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        <Phone size={12} /> {doc.phone || "N/A"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="ad-user-name" style={{ fontSize: '0.85rem' }}>{doc.experience ? `${doc.experience} Yrs` : "N/A"}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className="ad-user-name" style={{ color: 'var(--text-main)' }}>{doc.patients || 0}</span>
                                                    <div style={{ width: '60px', height: '4px', background: 'var(--bg-soft)', borderRadius: '2px', marginTop: '4px' }}>
                                                        <div style={{ width: `${Math.min(100, ((doc.patients || 0) / 400) * 100)}%`, height: '100%', background: 'var(--primary)', borderRadius: '2px' }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span className={`ad-status ad-status--${doc.status || 'active'}`}>
                                                        {(doc.status || 'active').charAt(0).toUpperCase() + (doc.status || 'active').slice(1)}
                                                    </span>
                                                    <span style={{ 
                                                        fontSize: '0.65rem', 
                                                        fontWeight: 800, 
                                                        padding: '2px 6px', 
                                                        borderRadius: '4px',
                                                        textTransform: 'uppercase',
                                                        width: 'fit-content',
                                                        letterSpacing: '0.5px',
                                                        border: '1px solid currentColor',
                                                        ...(doc.verification_status === 'VERIFIED' ? { color: '#10b981', background: '#10b98110' } :
                                                           doc.verification_status === 'REJECTED' ? { color: '#ef4444', background: '#ef444410' } :
                                                           { color: '#f59e0b', background: '#f59e0b10' })
                                                    }}>
                                                        {doc.verification_status || 'PENDING'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ad-actions" style={{ justifyContent: 'flex-end' }}>
                                                    <button 
                                                        className="ad-icon-btn" 
                                                        title="View Profile" 
                                                        style={{ color: '#3b82f6', background: '#3b82f610' }}
                                                        onClick={() => navigate(`/admin/edit-doctor/${doc._id}`)}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button 
                                                        className="ad-icon-btn" 
                                                        title="Edit Doctor" 
                                                        style={{ color: '#22c55e', background: '#22c55e10' }}
                                                        onClick={() => navigate(`/admin/edit-doctor/${doc._id}?edit=true`)}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        className="ad-icon-btn danger" 
                                                        title="Remove Doctor" 
                                                        style={{ color: '#ef4444', background: '#ef444410' }}
                                                        disabled={actionLoading === doc._id}
                                                        onClick={() => handleDeleteClick(doc._id, doc.name)}
                                                    >
                                                        {actionLoading === doc._id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && doctors.length === 0 && (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                                                No doctors found matching filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Showing {doctors.length} doctors found</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={page === 1}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-soft)', color: 'var(--text-main)', fontSize: '0.8rem', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.3 : 1 }}
                            >
                                Previous
                            </button>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', paddingLeft: '10px', paddingRight: '10px' }}>Page {page}</span>
                            <button 
                                onClick={() => setPage(prev => prev + 1)}
                                disabled={doctors.length < 10}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-soft)', color: 'var(--text-main)', fontSize: '0.8rem', cursor: doctors.length < 10 ? 'not-allowed' : 'pointer', opacity: doctors.length < 10 ? 0.3 : 1 }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Custom Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="ad-modal-overlay">
                        <div className="ad-modal-content" style={{ maxWidth: '420px', padding: '40px', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', background: 'var(--status-error-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', color: 'var(--status-error-text)' }}>
                                <AlertTriangle size={40} />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '12px' }}>Confirm Removal</h3>
                            <p style={{ color: 'var(--text-gray)', fontSize: '1rem', marginBottom: '35px', lineHeight: '1.6' }}>
                                Are you sure you want to remove <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>Dr. {doctorToDelete?.name}</span>? 
                                <br />This action will revoke their access and cancel pending appointments.
                            </p>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button 
                                    onClick={() => setShowDeleteModal(false)}
                                    className="ad-btn-primary" 
                                    style={{ flex: 1, background: 'var(--bg-soft)', color: 'var(--text-gray)', border: '1px solid var(--border-color)', justifyContent: 'center', height: '48px' }}
                                >
                                    No, Keep
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    className="ad-btn-duo" 
                                    style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', justifyContent: 'center', height: '48px' }}
                                >
                                    <Trash2 size={20} />
                                    <span>Yes, Remove</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default Doctors
