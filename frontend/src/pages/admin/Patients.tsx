import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Search, Edit2, Eye, Ban, Download, UserPlus, Loader2, X, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { getAllPatients, updatePatient, deletePatient } from "../../services/adminService"

function Patients() {
    const navigate = useNavigate()
    const [patients, setPatients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")

    // Modal States
    const [showViewModal, setShowViewModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<any>(null)
    const [saving, setSaving] = useState(false)

    const fetchPatients = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getAllPatients(searchTerm, statusFilter)
            setPatients(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to fetch patients", err)
            setError("Unable to load records.")
        } finally {
            setLoading(false)
        }
    }, [searchTerm, statusFilter])

    useEffect(() => {
        const timeoutId = setTimeout(fetchPatients, 400)
        return () => clearTimeout(timeoutId)
    }, [fetchPatients])

    const handleExport = () => {
        const headers = ["ID", "Name", "Email", "Phone", "Age", "Issue", "Status"]
        const csvData = patients.map(p => [
            p._id, p.name, p.email || "", p.phone || "", p.age || "", p.issue || "General", p.status || "Active"
        ].join(","))
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...csvData].join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "patients_report.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleAction = (type: 'view' | 'edit' | 'delete', patient: any) => {
        setSelectedPatient({ ...patient })
        if (type === 'view') setShowViewModal(true)
        if (type === 'edit') setShowEditModal(true)
        if (type === 'delete') setShowDeleteModal(true)
    }

    const handleUpdate = async () => {
        setSaving(true)
        try {
            await updatePatient(selectedPatient._id, selectedPatient)
            setSuccess("Patient record updated successfully.")
            setShowEditModal(false)
            fetchPatients()
            setTimeout(() => setSuccess(""), 4000)
        } catch (err) {
            setError("Failed to update patient.")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setSaving(true)
        try {
            await deletePatient(selectedPatient._id)
            setSuccess("Patient account suspended.")
            setShowDeleteModal(false)
            fetchPatients()
            setTimeout(() => setSuccess(""), 4000)
        } catch (err) {
            setError("Failed to suspend patient.")
        } finally {
            setSaving(false)
        }
    }


    return (
        <AdminLayout>
            <div className="ad-page" style={{ animation: 'slideUp 0.4s ease-out' }}>
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1 className="ad-page-title text-primary-gradient">Patient Management</h1>
                        <p className="ad-page-sub">Centralized repository for patient records, medical history, and status tracking.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="ad-btn-primary" onClick={handleExport} style={{ background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
                            <Download size={18} />
                            <span>Export CSV</span>
                        </button>
                        <button className="ad-btn-duo" onClick={() => navigate("/admin/add-patient")}>
                                <UserPlus size={18} />
                                <span>Register Patient</span>
                        </button>
                    </div>
                </div>

                {(success || error) && (
                    <div style={{ 
                        padding: '15px', 
                        background: error ? '#fee2e2' : '#dcfce7', 
                        color: error ? '#b91c1c' : '#166534', 
                        borderRadius: '12px', 
                        marginBottom: '25px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        border: `1px solid ${error ? '#fecaca' : '#bbf7d0'}`, 
                        animation: 'slideDownIn 0.3s' 
                    }}>
                        {error ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                        <span style={{ fontWeight: 600 }}>{error || success}</span>
                    </div>
                )}

                <div className="ad-card" style={{ position: 'relative' }}>
                    {loading && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(2px)', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Loader2 className="animate-spin" size={40} color="#3b82f6" />
                        </div>
                    )}

                    <div className="ad-list-header">
                        <div className="ad-search-bar" style={{ width: '400px' }}>
                            <Search size={18} color="#94a3b8" />
                            <input 
                                type="text" 
                                placeholder="Search patients by name, ID or email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="ad-filter-bar">
                            <select 
                                className="ad-filter-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Medical Status: All</option>
                                <option value="active">Active Patients</option>
                                <option value="deleted">Deleted Profiles</option>
                                <option value="discharged">Discharged</option>
                                <option value="recovery">Recovery</option>
                            </select>
                        </div>
                    </div>


                    <div className="ad-table-wrap" style={{ minHeight: '400px' }}>
                        <table className="ad-table">
                            <thead>
                                    <tr>
                                        <th>Patient Details</th>
                                        <th>Primary Issue</th>
                                        <th>Phone / Contact</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.length === 0 && !loading ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8' }}>
                                                <ShieldCheck size={48} style={{ opacity: 0.2, margin: '0 auto 15px' }} />
                                                <p>No patient records found in search.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        patients.map((pt, i) => (
                                            <tr key={pt._id || i} style={{ animation: `fadeIn 0.3s ease-out ${i*0.05}s forwards`, opacity: 0 }}>
                                                <td>
                                                    <div className="ad-user-cell">
                                                        <div className="ad-avatar" style={{
                                                            background: `hsl(${i * 60 + 200}, 70%, 50%)`,
                                                            width: '40px',
                                                            height: '40px',
                                                            fontSize: '0.9rem',
                                                            fontWeight: 700
                                                        }}>
                                                            {(pt.name || "P").charAt(0)}
                                                        </div>
                                                        <div className="ad-user-info">
                                                            <span className="ad-user-name" style={{ fontSize: '0.95rem' }}>{pt.name}</span>
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                <span className="ad-user-sub" style={{ fontWeight: 600 }}>#{pt._id?.slice(-6).toUpperCase()}</span>
                                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>•</span>
                                                                 {pt.age && <span className="ad-user-sub">{pt.age} Yrs</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="ad-user-name" style={{ fontSize: '0.85rem', color: '#1e293b' }}>{pt.issue || "General Checkup"}</span>
                                                </td>
                                                <td>
                                                    <span className="ad-user-name" style={{ fontSize: '0.85rem' }}>{pt.phone || "N/A"}</span>
                                                </td>
                                                <td>
                                                    <span className={`ad-status ad-status--${pt.status || 'active'}`}>
                                                        {(pt.status || 'active').charAt(0).toUpperCase() + (pt.status || 'active').slice(1)}
                                                    </span>
                                                 </td>
                                                 <td>
                                                     <div className="ad-actions" style={{ justifyContent: 'flex-end' }}>
                                                         <button onClick={() => handleAction('view', pt)} className="ad-icon-btn" title="View Records" style={{ color: '#3b82f6', background: '#3b82f610' }}><Eye size={16} /></button>
                                                         <button onClick={() => handleAction('edit', pt)} className="ad-icon-btn" title="Edit Profile" style={{ color: '#22c55e', background: '#22c55e10' }}><Edit2 size={16} /></button>
                                                         {(pt.status !== 'deleted' && pt.is_active !== false) && (
                                                            <button onClick={() => handleAction('delete', pt)} className="ad-icon-btn danger" title="Suspend Account" style={{ color: '#ef4444', background: '#ef444410' }}><Ban size={16} /></button>
                                                         )}
                                                     </div>
                                                 </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                        </table>
                    </div>

                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing {patients.length} records</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>Previous</button>
                            <button style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>1</button>
                            <button style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {showViewModal && selectedPatient && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', overflowY: 'auto', zIndex: 1000, animation: 'fadeIn 0.2s' }}>
                    <div className="ad-card" style={{ width: '100%', maxWidth: '500px', padding: '0', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', margin: 'auto' }}>
                        <div style={{ background: '#3b82f6', padding: '25px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Patient Summary</h3>
                                <p style={{ opacity: 0.9, fontSize: '0.85rem' }}>ID: {selectedPatient._id}</p>
                            </div>
                            <button onClick={() => setShowViewModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', color: '#fff', padding: '8px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '30px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Full Name</label>
                                    <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{selectedPatient.name}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Phone Number</label>
                                    <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{selectedPatient.phone}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Email Address</label>
                                    <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{selectedPatient.email || "N/A"}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Current Status</label>
                                    <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{selectedPatient.status || "Active"}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowViewModal(false)} className="ad-btn-duo" style={{ width: '100%', justifyContent: 'center' }}>Close Record</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedPatient && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', overflowY: 'auto', zIndex: 1000 }}>
                    <div className="ad-card" style={{ width: '100%', maxWidth: '550px', padding: '0', overflow: 'hidden', margin: 'auto' }}>
                        <div style={{ background: '#22c55e', padding: '25px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Modify Patient Info</h3>
                            <button onClick={() => setShowEditModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', color: '#fff', padding: '8px', cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '30px', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
                            <div className="ad-field">
                                <label>Patient Name</label>
                                <input className="ad-input" value={selectedPatient.name} onChange={(e) => setSelectedPatient({...selectedPatient, name: e.target.value})} />
                            </div>
                            <div className="ad-field">
                                <label>Email Address</label>
                                <input type="email" className="ad-input" value={selectedPatient.email || ""} onChange={e => setSelectedPatient({...selectedPatient, email: e.target.value})} />
                            </div>
                            <div className="ad-field">
                                <label>Phone Number</label>
                                <input type="tel" className="ad-input" value={selectedPatient.phone || ""} onChange={e => setSelectedPatient({...selectedPatient, phone: e.target.value})} />
                            </div>
                            <div className="ad-field">
                                <label>Age *</label>
                                <input type="number" className="ad-input" required value={selectedPatient.age || ""} onChange={e => setSelectedPatient({...selectedPatient, age: parseInt(e.target.value) || ""})} />
                            </div>
                            <div className="ad-field">
                                <label>Gender</label>
                                <select className="ad-input" value={selectedPatient.gender || "male"} onChange={e => setSelectedPatient({...selectedPatient, gender: e.target.value})}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="ad-field">
                                <label>Primary Health Issue</label>
                                <input className="ad-input" value={selectedPatient.issue} onChange={(e) => setSelectedPatient({...selectedPatient, issue: e.target.value})} />
                            </div>
                            <div className="ad-field">
                                <label>Treatment Status</label>
                                <select className="ad-input" value={selectedPatient.status} onChange={(e) => setSelectedPatient({...selectedPatient, status: e.target.value})}>
                                    <option value="active">Active Treatment</option>
                                    <option value="discharged">Discharged</option>
                                    <option value="recovery">Recovery</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                                <button onClick={() => setShowEditModal(false)} className="ad-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button onClick={handleUpdate} disabled={saving} className="ad-btn-duo" style={{ flex: 1.5, justifyContent: 'center', background: '#22c55e' }}>
                                    {saving ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteModal && selectedPatient && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 1000 }}>
                    <div className="ad-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px', margin: 'auto' }}>
                        <div style={{ width: '70px', height: '70px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <AlertTriangle size={35} color="#ef4444" />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>Remove Account?</h3>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '30px' }}>
                            You are about to permanently delete <strong>{selectedPatient.name}</strong>. This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={() => setShowDeleteModal(false)} className="ad-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                            <button onClick={handleDelete} disabled={saving} className="ad-btn-duo" style={{ flex: 1, justifyContent: 'center', background: '#ef4444' }}>
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Ban size={18} />}
                                <span>{saving ? 'Deleting...' : 'Confirm'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}

export default Patients
