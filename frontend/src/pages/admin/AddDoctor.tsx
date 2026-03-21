import AdminLayout from "../../components/layout/admin/AdminLayout"
import { UserPlus, Image, Mail, Phone, MapPin, Building, Award, Loader2, Copy, Check, DollarSign } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { addDoctor, uploadDoctorImage } from "../../services/adminService"

function AddDoctor() {
    const navigate = useNavigate()
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
        consultation_fee: "500" // Added default fee
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [tempPassword, setTempPassword] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [copied, setCopied] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

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
        setLoading(true)
        setError("")
        try {
            const res = await addDoctor({
                ...formData,
                experience: parseInt(formData.experience) || 0,
                consultation_fee: parseInt(formData.consultation_fee) || 500
            })
            
            // If image is selected, upload it
            if (selectedFile && res.doctor_id) {
                const imgData = new FormData()
                imgData.append('file', selectedFile)
                await uploadDoctorImage(res.doctor_id, imgData)
            }

            setTempPassword(res.temp_password) 
            setShowModal(true)
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to add doctor")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (!tempPassword) return
        navigator.clipboard.writeText(tempPassword)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <AdminLayout>
            <div className="ad-page" style={{ animationDelay: '0.1s' }}>
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1 className="ad-page-title">Add New Doctor</h1>
                        <p className="ad-page-sub">Onboard a new healthcare professional to the platform.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="ad-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div className="ad-card-header">
                        <h2 className="ad-card-title">Doctor Information Form</h2>
                    </div>

                    {error && (
                        <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                        <div className="pd-field" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                            <label style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#64748b' }}>Doctor Profile Photo (Passport Size)</label>
                            <div 
                                className="ad-upload-area" 
                                onClick={() => document.getElementById('doctor-photo-input')?.click()}
                                style={{ 
                                    cursor: 'pointer', 
                                    position: 'relative',
                                    border: '2px dashed #cbd5e1',
                                    width: '150px',
                                    height: '180px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    borderRadius: '8px',
                                    backgroundColor: '#f8fafc',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <>
                                        <Image size={32} color="#94a3b8" />
                                        <span className="ad-upload-text" style={{ marginTop: '10px', color: '#64748b', fontSize: '0.75rem', textAlign: 'center', padding: '0 10px' }}>Upload Photo</span>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    id="doctor-photo-input" 
                                    hidden 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                />
                            </div>
                            <span className="pd-page-sub" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>Recommended: 400x500px square or 3:4 ratio</span>
                        </div>

                    <h3 className="pd-card-subtitle" style={{ borderBottom: '1px solid #eef2f6', paddingBottom: '10px', marginBottom: '20px' }}>Personal Details</h3>
                    <div className="ad-form-grid">
                        <div className="ad-field">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="ad-input"
                                placeholder="e.g. Dr. John Doe"
                                required
                            />
                        </div>
                        <div className="ad-field">
                            <label>Email Address</label>
                            <div className="pd-input-icon-wrap" style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="ad-input"
                                    placeholder="doctor@example.com"
                                    style={{ paddingLeft: '40px' }}
                                    required
                                />
                            </div>
                        </div>
                        <div className="ad-field">
                            <label>Phone Number</label>
                            <div className="pd-input-icon-wrap" style={{ position: 'relative' }}>
                                <Phone size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="ad-input"
                                    placeholder="+1 (555) 000-0000"
                                    style={{ paddingLeft: '40px' }}
                                    required
                                />
                            </div>
                        </div>
                        <div className="ad-field">
                            <label>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="ad-input">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <h3 className="pd-card-subtitle" style={{ borderBottom: '1px solid #eef2f6', paddingBottom: '10px', marginTop: '30px', marginBottom: '20px' }}>Professional Details</h3>
                    <div className="ad-form-grid">
                        <div className="ad-field">
                            <label>Specialization</label>
                            <select
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleChange}
                                className="ad-input"
                                required
                            >
                                <option value="">Select Specialization</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="Neurology">Neurology</option>
                                <option value="Orthopedics">Orthopedics</option>
                                <option value="Pediatrics">Pediatrics</option>
                                <option value="General Medicine">General Medicine</option>
                            </select>
                        </div>
                        <div className="ad-field">
                            <label>Medical Degree</label>
                            <div className="pd-input-icon-wrap" style={{ position: 'relative' }}>
                                <Award size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                                <input
                                    type="text"
                                    name="degree"
                                    value={formData.degree}
                                    onChange={handleChange}
                                    className="ad-input"
                                    placeholder="e.g. MD, MBBS"
                                    style={{ paddingLeft: '40px' }}
                                    required
                                />
                            </div>
                        </div>
                        <div className="ad-field">
                            <label>Years of Experience</label>
                            <input
                                type="number"
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                className="ad-input"
                                placeholder="e.g. 10"
                                required
                            />
                        </div>
                        <div className="ad-field">
                            <label>Consultation Fee</label>
                            <div className="pd-input-icon-wrap" style={{ position: 'relative' }}>
                                <DollarSign size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                                <input
                                    type="number"
                                    name="consultation_fee"
                                    value={formData.consultation_fee}
                                    onChange={handleChange}
                                    className="ad-input"
                                    placeholder="e.g. 500"
                                    style={{ paddingLeft: '40px' }}
                                    required
                                />
                            </div>
                        </div>
                        <div className="ad-field">
                            <label>Department / Clinic</label>
                            <div className="pd-input-icon-wrap" style={{ position: 'relative' }}>
                                <Building size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="ad-input"
                                    placeholder="e.g. Heart Center"
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                        <div className="ad-field">
                            <label>Location / City</label>
                            <div className="pd-input-icon-wrap" style={{ position: 'relative' }}>
                                <MapPin size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="ad-input"
                                    placeholder="e.g. New York"
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pd-settings-footer" style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <button type="button" onClick={() => navigate("/admin/doctors")} className="ad-btn-primary" style={{ background: '#f1f5f9', color: '#475569' }}>Cancel</button>
                        <button type="submit" disabled={loading} className="ad-btn-duo">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                            <span>{loading ? "Creating..." : "Create Doctor Profile"}</span>
                        </button>
                    </div>
                </form>

                {/* Temp Password Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <div className="ad-card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', padding: '30px' }}>
                            <div style={{ 
                                width: '60px', height: '60px', borderRadius: '50%', 
                                background: '#f0fdf4', color: '#16a34a', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}>
                                <Check size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Doctor Created Successfully!</h2>
                            <p style={{ color: '#64748b', marginBottom: '24px' }}>Please share this temporary password with the doctor. They will be required to change it upon first login.</p>
                            
                            <div style={{ 
                                background: '#f8fafc', border: '1px dashed #cbd5e1', 
                                padding: '15px', borderRadius: '8px', 
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginBottom: '30px'
                            }}>
                                <code style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '2px', color: '#0f172a' }}>{tempPassword}</code>
                                <button 
                                    onClick={copyToClipboard}
                                    style={{ 
                                        background: 'none', border: 'none', color: copied ? '#16a34a' : '#3b82f6', 
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' 
                                    }}
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{copied ? "Copied!" : "Copy"}</span>
                                </button>
                            </div>

                            <button 
                                onClick={() => navigate("/admin/doctors")}
                                className="ad-btn-duo"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                <span>Go to Doctor List</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default AddDoctor
