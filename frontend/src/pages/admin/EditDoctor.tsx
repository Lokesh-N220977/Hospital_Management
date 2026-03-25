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

                    <form onSubmit={handleSubmit} className="ad-card" style={{ animationDelay: '0.1s' }}>
                        {/* Profile Header Banner */}
                        <div className="ad-profile-banner">
                            <div 
                                className="ad-profile-photo-wrap" 
                                onClick={() => isEditMode && document.getElementById('doctor-photo-input')?.click()}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                        <Image size={48} />
                                        <span style={{ fontSize: '0.75rem', marginTop: '10px' }}>No Photo</span>
                                    </div>
                                )}
                                {isEditMode && (
                                    <div className="ad-profile-photo-edit-overlay">
                                        Change Photo
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    id="doctor-photo-input" 
                                    hidden 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    disabled={!isEditMode} 
                                />
                            </div>

                            <div className="ad-profile-name-group">
                                <h3>{formData.name || "Doctor Profile"}</h3>
                                <span className="ad-profile-spec">
                                    {formData.specialization || "Specialization Not Set"}
                                </span>
                                
                                <div className="ad-profile-info-grid">
                                    <div className="ad-profile-info-item">
                                        <Mail size={16} />
                                        <span>{formData.email}</span>
                                    </div>
                                    <div className="ad-profile-info-item">
                                        <Phone size={16} />
                                        <span>{formData.phone}</span>
                                    </div>
                                    <div className="ad-profile-info-item">
                                        <Building size={16} />
                                        <span>{formData.department || "General Department"}</span>
                                    </div>
                                    <div className="ad-profile-info-item">
                                        <Award size={16} />
                                        <span>{formData.degree || "Medical Degree"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Sections */}
                        <h4 className="ad-section-title">Personal Information</h4>
                        <div className="ad-input-group">
                            <div className="ad-field-premium">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    className="ad-input-premium" 
                                    required 
                                    disabled={!isEditMode} 
                                />
                            </div>
                            <div className="ad-field-premium">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    className="ad-input-premium" 
                                    required 
                                    disabled={!isEditMode} 
                                />
                            </div>
                            <div className="ad-field-premium">
                                <label>Contact Number</label>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                    className="ad-input-premium" 
                                    required 
                                    disabled={!isEditMode} 
                                />
                            </div>
                            <div className="ad-field-premium">
                                <label>Gender</label>
                                <select 
                                    name="gender" 
                                    value={formData.gender} 
                                    onChange={handleChange} 
                                    className="ad-input-premium" 
                                    disabled={!isEditMode}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <h4 className="ad-section-title">Professional Credentials</h4>
                        <div className="ad-input-group">
                            <div className="ad-field-premium">
                                <label>Specialization</label>
                                <select 
                                    name="specialization" 
                                    value={formData.specialization} 
                                    onChange={handleChange} 
                                    className="ad-input-premium" 
                                    required 
                                    disabled={!isEditMode}
                                >
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="General Medicine">General Medicine</option>
                                    <option value="Dermatology">Dermatology</option>
                                    <option value="Gastroenterology">Gastroenterology</option>
                                </select>
                            </div>
                            <div className="ad-field-premium">
                                <label>Medical Qualification</label>
                                <input 
                                    type="text" 
                                    name="degree" 
                                    value={formData.degree} 
                                    onChange={handleChange} 
                                    className="ad-input-premium" 
                                    required 
                                    disabled={!isEditMode} 
                                    placeholder="e.g. MS, MBBS, MD"
                                />
                            </div>
                            <div className="ad-field-premium">
                                <label>Experience (Years)</label>
                                <input 
                                    type="number" 
                                    name="experience" 
                                    value={formData.experience} 
                                    onChange={handleChange} 
                                    className="ad-input-premium" 
                                    required 
                                    disabled={!isEditMode} 
                                />
                            </div>
                            <div className="ad-field-premium">
                                <label>Consultation Fee</label>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                    <input 
                                        type="number" 
                                        name="consultation_fee" 
                                        value={formData.consultation_fee} 
                                        onChange={handleChange} 
                                        className="ad-input-premium" 
                                        style={{ paddingLeft: '40px' }} 
                                        required 
                                        disabled={!isEditMode} 
                                    />
                                </div>
                            </div>
                            <div className="ad-field-premium">
                                <label>Department / Clinic</label>
                                <input 
                                    type="text" 
                                    name="department" 
                                    value={formData.department} 
                                    onChange={handleChange} 
                                    className="ad-input-premium" 
                                    disabled={!isEditMode} 
                                />
                            </div>
                            <div className="ad-field-premium">
                                <label>Operating Location</label>
                                <input 
                                    type="text" 
                                    name="location" 
                                    value={formData.location} 
                                    onChange={handleChange} 
                                    className="ad-input-premium" 
                                    disabled={!isEditMode} 
                                />
                            </div>
                        </div>

                        {isEditMode && (
                            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditMode(false)} 
                                    className="ad-btn-primary" 
                                    style={{ background: 'var(--bg-soft)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}
                                >
                                    Discard Changes
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving} 
                                    className="ad-btn-duo" 
                                    style={{ minWidth: '200px', justifyContent: 'center' }}
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    <span>{saving ? "Processing..." : "Commit Profile Updates"}</span>
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
