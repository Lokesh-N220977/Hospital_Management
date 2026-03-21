import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Image, Mail, Phone, Building, Award, Loader2, DollarSign, Save, ArrowLeft, Edit3, Eye, CheckCircle2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { getDoctorById, updateDoctor, uploadDoctorImage } from "../../services/adminService"

function EditDoctor() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const location = useLocation()
    const [isEditMode, setIsEditMode] = useState(false)

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search)
        if (queryParams.get('edit') === 'true') {
            setIsEditMode(true)
        }
    }, [location.search])
    const [formData, setFormData] = useState({
        name: "",
        specialization: "",
        email: "",
        phone: "",
        degree: "",
        experience: "",
        department: "",
        location: "",
        gender: "Male",
        consultation_fee: "500",
        status: "active"
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    useEffect(() => {
        const fetchDoctor = async () => {
            if (!id) return
            setLoading(true)
            try {
                const data = await getDoctorById(id)
                setFormData({
                    name: data.name || "",
                    specialization: data.specialization || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    degree: data.degree || data.qualification || "",
                    experience: data.experience?.toString() || "",
                    department: data.department || "",
                    location: data.location || "",
                    gender: data.gender || "Male",
                    consultation_fee: data.consultation_fee?.toString() || "500",
                    status: data.status || "active"
                })
                if (data.profile_image_url) {
                    setImagePreview(data.profile_image_url)
                }
            } catch (err) {
                setError("Failed to load doctor profile. Please check the ID or your connection.")
            } finally {
                setLoading(false)
            }
        }
        fetchDoctor()
    }, [id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!id) return
        setSaving(true)
        setError("")
        setSuccess("")
        try {
            // Mapping frontend 'degree' to both 'degree' and 'qualification' for backend compatibility
            const updatePayload = {
                ...formData,
                experience: parseInt(formData.experience) || 0,
                consultation_fee: parseFloat(formData.consultation_fee) || 500,
                qualification: formData.degree,
                degree: formData.degree
            }
            
            await updateDoctor(id, updatePayload)
            
            if (selectedFile) {
                const imgData = new FormData()
                imgData.append('file', selectedFile)
                await uploadDoctorImage(id, imgData)
            }

            setSuccess("Doctor profile updated successfully!")
            setIsEditMode(false)
            setTimeout(() => setSuccess(""), 4000)
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to update doctor profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: '20px' }}>
                    <Loader2 className="animate-spin" size={48} color="#3b82f6" />
                    <p style={{ color: '#64748b', fontWeight: 500, animation: 'pulse 2s infinite' }}>Loading profile data...</p>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="ad-page" style={{ animation: 'slideUp 0.5s ease-out' }}>
                <div className="ad-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button 
                            onClick={() => navigate("/admin/doctors")}
                            className="ad-icon-btn"
                            style={{ background: '#fff' }}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className="ad-header-content">
                            <h1 className="ad-page-title">{isEditMode ? "Modify Doctor Account" : "Doctor Profile View"}</h1>
                            <p className="ad-page-sub">
                                {isEditMode 
                                    ? `Updating information for ${formData.name}. Ensure all details are accurate.` 
                                    : `Currently viewing full details for Dr. ${formData.name}.`
                                }
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {!isEditMode ? (
                            <button 
                                onClick={() => setIsEditMode(true)} 
                                className="ad-btn-duo"
                                style={{ background: '#3b82f6', color: '#fff' }}
                            >
                                <Edit3 size={18} />
                                <span>Edit Profile</span>
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsEditMode(false)} 
                                className="ad-btn-primary"
                                style={{ background: '#fff', color: '#64748b', border: '1px solid #e2e8f0' }}
                            >
                                <Eye size={18} />
                                <span>Switch to View</span>
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {error && (
                        <div style={{ padding: '15px', background: '#fef2f2', color: '#ef4444', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #fee2e2' }}>
                            <AlertCircle size={20} />
                            <span style={{ fontWeight: 500 }}>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div style={{ padding: '15px', background: '#f0fdf4', color: '#16a34a', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #dcfce7' }}>
                            <CheckCircle2 size={20} />
                            <span style={{ fontWeight: 500 }}>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="ad-card" style={{ padding: '40px' }}>
                        <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', alignItems: 'flex-start' }}>
                            <div 
                                onClick={() => isEditMode && document.getElementById('doctor-photo-input')?.click()}
                                style={{ 
                                    cursor: isEditMode ? 'pointer' : 'default', 
                                    position: 'relative', 
                                    border: isEditMode ? '2px dashed #cbd5e1' : '1px solid #e2e8f0',
                                    width: '180px', height: '220px', display: 'flex',
                                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden', borderRadius: '12px', backgroundColor: '#f8fafc',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <>
                                        <Image size={40} color="#94a3b8" />
                                        <span style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '12px' }}>{isEditMode ? "Upload Photo" : "No Photo"}</span>
                                    </>
                                )}
                                {isEditMode && (
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.4)', color: '#fff', padding: '6px', textAlign: 'center', fontSize: '0.7rem' }}>
                                        Click to Change
                                    </div>
                                )}
                                <input type="file" id="doctor-photo-input" hidden accept="image/*" onChange={handleFileChange} disabled={!isEditMode} />
                            </div>

                            <div style={{ flex: 1, pt: '10px' }}>
                                <div style={{ marginBottom: '25px' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{formData.name || "Unnamed Doctor"}</h3>
                                    <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{formData.specialization}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                                        <Mail size={16} /> <span>{formData.email}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                                        <Phone size={16} /> <span>{formData.phone}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                                        <Building size={16} /> <span>{formData.department}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                                        <Award size={16} /> <span>{formData.degree}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ad-form-grid" style={{ mt: '20px', pt: '30px', borderTop: '1px solid #f1f5f9' }}>
                            <div className="ad-field">
                                <label>Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="ad-input" required disabled={!isEditMode} />
                            </div>
                            <div className="ad-field">
                                <label>Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="ad-input" required disabled={!isEditMode} />
                            </div>
                            <div className="ad-field">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="ad-input" required disabled={!isEditMode} />
                            </div>
                            <div className="ad-field">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="ad-input" disabled={!isEditMode}>
                                    <option value="active">Active / Available</option>
                                    <option value="inactive">Inactive / On Hold</option>
                                </select>
                            </div>
                            <div className="ad-field">
                                <label>Specialization</label>
                                <select name="specialization" value={formData.specialization} onChange={handleChange} className="ad-input" required disabled={!isEditMode}>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="General Medicine">General Medicine</option>
                                    <option value="Dermatology">Dermatology</option>
                                    <option value="Gastroenterology">Gastroenterology</option>
                                </select>
                            </div>
                            <div className="ad-field">
                                <label>Medical Degree (e.g. MBBS, MD)</label>
                                <input type="text" name="degree" value={formData.degree} onChange={handleChange} className="ad-input" required disabled={!isEditMode} />
                            </div>
                            <div className="ad-field">
                                <label>Years of Experience</label>
                                <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="ad-input" required disabled={!isEditMode} />
                            </div>
                            <div className="ad-field">
                                <label>Consultation Fee</label>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                    <input type="number" name="consultation_fee" value={formData.consultation_fee} onChange={handleChange} className="ad-input" style={{ paddingLeft: '40px' }} required disabled={!isEditMode} />
                                </div>
                            </div>
                        </div>

                        {isEditMode && (
                            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                                <button type="button" onClick={() => setIsEditMode(false)} className="ad-btn-primary" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>Cancel Edits</button>
                                <button type="submit" disabled={saving} className="ad-btn-duo" style={{ minWidth: '180px' }}>
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    <span>{saving ? "Updating Profile..." : "Commit Changes"}</span>
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </AdminLayout>
    )
}

export default EditDoctor
