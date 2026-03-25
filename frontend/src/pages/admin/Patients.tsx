import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Search, Edit2, Eye, Ban, Download, UserPlus, Loader2, X, CheckCircle2, AlertTriangle, ShieldCheck, Mail, Phone } from "lucide-react"
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
                        <button className="ad-btn-primary" onClick={handleExport} style={{ background: 'var(--bg-soft)', color: 'var(--text-gray)', border: '1px solid var(--border-color)' }}>
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
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '16px' }}>
                            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                        </div>
                    )}

                    <div className="ad-list-header">
                        <div className="ad-search-bar" style={{ width: '400px' }}>
                            <Search size={18} color="var(--text-muted)" />
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
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                                                <ShieldCheck size={48} style={{ opacity: 0.2, margin: '0 auto 15px' }} />
                                                <p>No patient records found in search.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        patients.map((pt, i) => (
                                            <tr key={pt._id || i} style={{ animation: `fadeIn 0.3s ease-out ${i*0.05}s forwards`, opacity: 0 }}>
                                                <td>
                                                    <div className="ad-user-cell">
                                                        <div className="ad-premium-avatar">
                                                            {(pt.name || "P").charAt(0)}
                                                        </div>
                                                        <div className="ad-user-info">
                                                            <span className="ad-user-name" style={{ fontSize: '0.95rem' }}>{pt.name}</span>
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                <span className="ad-user-sub" style={{ fontWeight: 600, color: 'var(--primary)' }}>#{pt._id?.slice(-6).toUpperCase()}</span>
                                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>•</span>
                                                                 {pt.age && <span className="ad-user-sub">{pt.age} Yrs</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="ad-user-name" style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{pt.issue || "General Checkup"}</span>
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

                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Showing {patients.length} records</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-soft)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-gray)', cursor: 'pointer' }}>Previous</button>
                            <button style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>1</button>
                            <button style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-soft)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-gray)', cursor: 'pointer' }}>Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {showViewModal && selectedPatient && (
                <div className="ad-modal-overlay">
                    <div className="ad-modal-content" style={{ maxWidth: '650px', padding: 0, overflow: 'hidden' }}>
                        <div className="ad-profile-banner" style={{ margin: 0, borderRadius: 0, padding: '40px' }}>
                            <div className="ad-premium-avatar" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                                {(selectedPatient.name || "P").charAt(0)}
                            </div>
                            <div className="ad-profile-name-group">
                                <h3 style={{ color: '#fff', fontSize: '1.8rem' }}>{selectedPatient.name}</h3>
                                <span className="ad-profile-spec" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                                    Patient ID: {selectedPatient._id?.slice(-8).toUpperCase()}
                                </span>
                            </div>
                            <button onClick={() => setShowViewModal(false)} style={{ position: 'absolute', right: '30px', top: '30px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: '#fff', padding: '10px' }}><X size={20} /></button>
                        </div>

                        <div style={{ padding: '40px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                <div className="ad-field-premium">
                                    <label>Email Address</label>
                                    <div className="ad-profile-info-item" style={{ marginTop: '8px' }}>
                                        <Mail size={18} />
                                        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedPatient.email || "Not Provided"}</span>
                                    </div>
                                </div>
                                <div className="ad-field-premium">
                                    <label>Contact Number</label>
                                    <div className="ad-profile-info-item" style={{ marginTop: '8px' }}>
                                        <Phone size={18} />
                                        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedPatient.phone || "N/A"}</span>
                                    </div>
                                </div>
                                <div className="ad-field-premium">
                                    <label>Primary Condition</label>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '8px' }}>{selectedPatient.issue || "General Observation"}</p>
                                </div>
                                <div className="ad-field-premium">
                                    <label>Status</label>
                                    <div style={{ marginTop: '8px' }}>
                                        <span className={`ad-status ad-status--${selectedPatient.status || 'active'}`} style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
                                            {(selectedPatient.status || 'Active').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '15px' }}>
                                <button onClick={() => {setShowViewModal(false); setShowEditModal(true)}} className="ad-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                    <Edit2 size={18} />
                                    <span>Edit Record</span>
                                </button>
                                <button onClick={() => setShowViewModal(false)} className="ad-btn-duo" style={{ flex: 1, justifyContent: 'center' }}>
                                    <span>Dismiss Summary</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && selectedPatient && (
                <div className="ad-modal-overlay">
                    <div className="ad-modal-content" style={{ maxWidth: '650px', padding: 0, overflow: 'hidden' }}>
                        <div style={{ background: 'var(--primary)', padding: '25px 40px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Edit Patient Record</h3>
                                <p style={{ opacity: 0.8, fontSize: '0.85rem' }}>Updating details for {selectedPatient.name}</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: '#fff', padding: '10px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <div style={{ padding: '40px', maxHeight: '70vh', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                                <div className="ad-field-premium">
                                    <label>Full Patient Name</label>
                                    <input className="ad-input-premium" value={selectedPatient.name} onChange={(e) => setSelectedPatient({...selectedPatient, name: e.target.value})} />
                                </div>
                                <div className="ad-field-premium">
                                    <label>Email ID</label>
                                    <input type="email" className="ad-input-premium" value={selectedPatient.email || ""} onChange={e => setSelectedPatient({...selectedPatient, email: e.target.value})} />
                                </div>
                                <div className="ad-field-premium">
                                    <label>Contact Number</label>
                                    <input type="tel" className="ad-input-premium" value={selectedPatient.phone || ""} onChange={e => setSelectedPatient({...selectedPatient, phone: e.target.value})} />
                                </div>
                                <div className="ad-field-premium">
                                    <label>Age (Years)</label>
                                    <input type="number" className="ad-input-premium" value={selectedPatient.age || ""} onChange={e => setSelectedPatient({...selectedPatient, age: parseInt(e.target.value) || ""})} />
                                </div>
                                <div className="ad-field-premium">
                                    <label>Gender Visibility</label>
                                    <select className="ad-input-premium" value={selectedPatient.gender || "male"} onChange={e => setSelectedPatient({...selectedPatient, gender: e.target.value})}>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="ad-field-premium">
                                    <label>Medical Classification</label>
                                    <select className="ad-input-premium" value={selectedPatient.status} onChange={(e) => setSelectedPatient({...selectedPatient, status: e.target.value})}>
                                        <option value="active">Active Treatment</option>
                                        <option value="discharged">Discharged</option>
                                        <option value="recovery">In Recovery</option>
                                    </select>
                                </div>
                                <div className="ad-field-premium" style={{ gridColumn: 'span 2' }}>
                                    <label>Primary Health Concern / Reason for Visit</label>
                                    <textarea 
                                        className="ad-input-premium" 
                                        style={{ height: '80px', padding: '15px' }}
                                        value={selectedPatient.issue || ""} 
                                        onChange={(e) => setSelectedPatient({...selectedPatient, issue: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--glass-border)' }}>
                                <button onClick={() => setShowEditModal(false)} className="ad-btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'var(--bg-soft)', color: 'var(--text-gray)', border: '1px solid var(--glass-border)' }}>Discard</button>
                                <button onClick={handleUpdate} disabled={saving} className="ad-btn-duo" style={{ flex: 1.5, justifyContent: 'center' }}>
                                    {saving ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                                    <span>{saving ? 'Saving...' : 'Commit Changes'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteModal && selectedPatient && (
                <div className="ad-modal-overlay">
                    <div className="ad-modal-content" style={{ maxWidth: '450px', padding: '40px', borderRadius: '24px' }}>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                            <Ban size={40} />
                        </div>
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>Suspend Account</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '35px' }}>
                            You are about to deactivate <strong>{selectedPatient.name}</strong>. Access will be revoked and all pending appointments will be cancelled. Past medical data will be preserved for hospital analytics.
                        </p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={() => setShowDeleteModal(false)} className="ad-btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'var(--bg-soft)', color: 'var(--text-gray)', border: '1px solid var(--glass-border)' }}>Keep Active</button>
                            <button onClick={handleDelete} disabled={saving} className="ad-btn-duo" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                <span>{saving ? 'Processing...' : 'Confirm Suspension'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}

export default Patients
