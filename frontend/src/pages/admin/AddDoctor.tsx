import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Plus, Image, Mail, Phone, MapPin, Building, Award, Copy, Check, DollarSign } from "lucide-react"
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
        consultation_fee: "500",
        registration_number: "",
        qualification: ""
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [tempPassword, setTempPassword] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [copied, setCopied] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [proofFile, setProofFile] = useState<File | null>(null)

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
            if (!proofFile) {
                setError("Proof document is mandatory for doctor registration.")
                setLoading(false)
                return
            }

            const doctorFormData = new FormData()
            // Add basic fields
            Object.entries(formData).forEach(([key, value]) => {
                doctorFormData.append(key, value)
            });
            
            // Add professional numeric fields explicitly if needed, but Form handles strings too
            // Add mandatory proof document
            doctorFormData.append('proof_document', proofFile)
            
            // Add profile photo if exists
            if (selectedFile) {
                doctorFormData.append('profile_photo', selectedFile) // Note: Backend uses /image endpoint for separate upload usually, but let's see
            }

            const res = await addDoctor(doctorFormData)
            
            // If image is selected and backend supports separate upload, we keep it as fallback
            // but the new constraint says "Single step creation with document"
            // So we send everything in doctorFormData.
            
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
                        <div style={{ padding: '12px', background: 'var(--status-error-bg)', color: 'var(--status-error-text)', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid var(--status-error-text)' }}>
                            {error}
                        </div>
                    )}

                        <div className="pd-field" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                            <label style={{ marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-gray)' }}>Doctor Profile Photo (Passport Size)</label>
                            <div 
                                className="ad-upload-area" 
                                onClick={() => document.getElementById('doctor-photo-input')?.click()}
                                style={{ 
                                    cursor: 'pointer', 
                                    position: 'relative',
                                    border: '2px dashed var(--glass-border)',
                                    width: '150px',
                                    height: '180px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--input-bg)',
                                    boxShadow: 'var(--shadow-sm)',
                                    transition: 'all 0.2s',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <>
                                        <Image size={32} color="var(--primary)" />
                                        <span className="ad-upload-text" style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '0 10px' }}>Upload Photo</span>
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
                            <span className="pd-page-sub" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Recommended: 400x500px square or 3:4 ratio</span>
                        </div>
 
                    <h3 className="pd-card-subtitle" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--text-main)' }}>Personal Details</h3>
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
                                <Mail size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--primary)' }} />
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
                                <Phone size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--primary)' }} />
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
 
                    <h3 className="pd-card-subtitle" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginTop: '30px', marginBottom: '20px', color: 'var(--text-main)' }}>Professional Details</h3>
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
                                <Award size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--primary)' }} />
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
                                <DollarSign size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--primary)' }} />
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
                            <label>Registration Number (Medical Council)</label>
                            <input
                                type="text"
                                name="registration_number"
                                value={formData.registration_number}
                                onChange={handleChange}
                                className="ad-input"
                                placeholder="e.g. MC-12345"
                                required
                                minLength={5}
                            />
                        </div>

                        <div className="ad-field">
                            <label>Specialist Qualification</label>
                            <input
                                type="text"
                                name="qualification"
                                value={formData.qualification}
                                onChange={handleChange}
                                className="ad-input"
                                placeholder="e.g. MS (Orthopaedics), DNB"
                                required
                            />
                        </div>
                        <div className="ad-field">
                            <label>Department / Clinic</label>
                            <div className="pd-input-icon-wrap" style={{ position: 'relative' }}>
                                <Building size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--primary)' }} />
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
                                <MapPin size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--primary)' }} />
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

                    <h3 className="pd-card-subtitle" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginTop: '30px', marginBottom: '20px', color: 'var(--text-main)' }}>Verification Document</h3>
                    <div style={{ padding: '15px', background: 'var(--bg-soft)', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                            Please upload a scan of your Medical Registration Certificate or Degree (PDF or Image).
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                             <input 
                                type="file" 
                                id="proof-doc-input" 
                                accept=".pdf,image/*"
                                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                style={{ 
                                    fontSize: '0.85rem',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer'
                                }}
                                required
                             />
                             {proofFile && (
                                <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Check size={14} /> {proofFile.name} ready
                                </span>
                             )}
                        </div>
                    </div>

                        <div className="pd-settings-footer" style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button type="button" onClick={() => navigate("/admin/doctors")} className="ad-btn-danger" style={{ padding: '10px 20px', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
                            <button type="submit" className="ad-btn-success" disabled={loading} style={{ opacity: loading ? 0.7 : 1, padding: '10px 25px', borderRadius: '12px' }}>
                                <Plus size={18} />
                                <span>{loading ? "Adding..." : "Add Doctor"}</span>
                            </button>
                        </div>
                </form>

                {/* Temp Password Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto', zIndex: 1000,
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <div className="ad-card" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '40px', margin: 'auto' }}>
                            <div style={{ 
                                width: '60px', height: '60px', borderRadius: '50%', 
                                background: 'var(--status-success-bg)', color: 'var(--status-success-text)', 
                                border: '1px solid var(--status-success-text)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px',
                                boxShadow: 'var(--glow-success)'
                            }}>
                                <Check size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--text-main)' }}>Doctor Created Successfully!</h2>
                            <p style={{ color: 'var(--text-gray)', marginBottom: '24px' }}>Please share this temporary password with the doctor. They will be required to change it upon first login.</p>
                            
                            <div style={{ 
                                background: 'var(--bg-light)', border: '1px dashed var(--glass-border)', 
                                padding: '15px', borderRadius: '12px', 
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginBottom: '30px'
                            }}>
                                <code style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '2px', color: 'var(--primary)' }}>{tempPassword}</code>
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
