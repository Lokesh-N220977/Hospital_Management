import AdminLayout from "../../components/layout/admin/AdminLayout"
import { CheckCircle2, XCircle, Eye, Loader2, UserCheck, Search, ShieldCheck, FileText, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { getPendingDoctors, verifyDoctor } from "../../services/adminService"

function DoctorVerification() {
    const [doctors, setDoctors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchPendingDoctors()
    }, [])

    const fetchPendingDoctors = async () => {
        setLoading(true)
        try {
            const data = await getPendingDoctors()
            setDoctors(data)
        } catch (err) {
            console.error("Failed to fetch pending doctors", err)
            setError("Failed to load pending doctors")
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (doctorId: string, status: 'VERIFIED' | 'REJECTED') => {
        setActionLoading(doctorId)
        setError("")
        try {
            await verifyDoctor(doctorId, status)
            setSuccess(`Doctor ${status === 'VERIFIED' ? 'approved' : 'rejected'} successfully`)
            setDoctors(prev => prev.filter(d => d._id !== doctorId))
            setTimeout(() => setSuccess(""), 4000)
        } catch (err) {
            setError("Failed to update doctor status")
        } finally {
            setActionLoading(null)
        }
    }

    const filteredDoctors = doctors.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <AdminLayout>
            <div className="ad-page" style={{ animation: 'slideDownIn 0.4s ease-out' }}>
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1 className="ad-page-title text-primary-gradient">Doctor Verification</h1>
                        <p className="ad-page-sub">Review and verify professional credentials of newly registered healthcare providers.</p>
                    </div>
                    <div className="ad-stats-mini" style={{ display: 'flex', gap: '20px' }}>
                        <div className="ad-stat-item">
                            <span className="ad-stat-val" style={{ color: 'var(--primary)' }}>{doctors.length}</span>
                            <span className="ad-stat-label">Pending</span>
                        </div>
                    </div>
                </div>

                {success && (
                    <div className="pd-alert pd-alert-success" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--status-success-bg)', color: 'var(--status-success-text)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <CheckCircle2 size={18} />
                        <span>{success}</span>
                    </div>
                )}
                {error && (
                    <div className="pd-alert pd-alert-error" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--status-error-bg)', color: 'var(--status-error-text)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <XCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="ad-card">
                    <div className="ad-list-header">
                        <div className="ad-search-bar" style={{ maxWidth: '400px' }}>
                            <Search size={18} color="var(--text-muted)" />
                            <input 
                                type="text" 
                                placeholder="Search by name or email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="ad-table-wrap">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '80px' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>
                        ) : filteredDoctors.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                                <ShieldCheck size={48} style={{ opacity: 0.2, margin: '0 auto 15px' }} />
                                <p>No pending verification requests found.</p>
                            </div>
                        ) : (
                            <table className="ad-table">
                                <thead>
                                    <tr>
                                        <th>Doctor Info</th>
                                        <th>Credentials</th>
                                        <th>Proof Document</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDoctors.map((doc) => (
                                        <tr key={doc._id} style={{ opacity: actionLoading === doc._id ? 0.5 : 1 }}>
                                            <td>
                                                <div className="ad-user-cell">
                                                    <div className="ad-premium-avatar">
                                                        {doc.name.replace('Dr. ', '').charAt(0)}
                                                    </div>
                                                    <div className="ad-user-info">
                                                        <span className="ad-user-name">{doc.name}</span>
                                                        <span className="ad-user-sub">{doc.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ad-user-info">
                                                    <span className="ad-user-name" style={{ fontSize: '0.85rem' }}>Reg: {doc.registration_number}</span>
                                                    <span className="ad-user-sub" style={{ color: 'var(--primary)', fontWeight: 600 }}>{doc.qualification}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {doc.proof_document_url ? (
                                                    <a 
                                                        href={`http://localhost:8000${doc.proof_document_url}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="ad-btn-icon-soft"
                                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                                                    >
                                                        <FileText size={16} />
                                                        <span>View Proof</span>
                                                        <ExternalLink size={12} />
                                                    </a>
                                                ) : (
                                                    <span style={{ color: 'var(--status-error-text)', fontSize: '0.8rem' }}>No Proof!</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="ad-actions" style={{ justifyContent: 'flex-end', gap: '10px' }}>
                                                    <button 
                                                        className="ad-btn-success" 
                                                        style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                                                        onClick={() => handleVerify(doc._id, 'VERIFIED')}
                                                        disabled={!!actionLoading}
                                                    >
                                                        {actionLoading === doc._id ? <Loader2 className="animate-spin" size={14} /> : <UserCheck size={14} />}
                                                        <span>Approve</span>
                                                    </button>
                                                    <button 
                                                        className="ad-btn-danger" 
                                                        style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                                                        onClick={() => handleVerify(doc._id, 'REJECTED')}
                                                        disabled={!!actionLoading}
                                                    >
                                                        <XCircle size={14} />
                                                        <span>Reject</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default DoctorVerification 
