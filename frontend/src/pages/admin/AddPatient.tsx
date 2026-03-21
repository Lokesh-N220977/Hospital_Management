import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "../../components/layout/admin/AdminLayout"
import { UserPlus, Calendar, Phone, Mail, AlertCircle, CheckCircle2 } from "lucide-react"
import api from "../../services/api"

function AddPatient() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [gender, setGender] = useState("male");
    
    const [age, setAge] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            await api.post("/admin/add-patient", { name, phone, email, gender, age: parseInt(age) || null });
            setSuccess(true);
            setTimeout(() => navigate("/admin/patients"), 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="ad-page">
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1>Register New Patient</h1>
                        <p>Manually onboard new patients. They can link this record later using their phone number.</p>
                    </div>
                </div>

                <div className="ad-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="ad-card-header">
                        <h2 className="ad-card-title">Patient Intake Form</h2>
                    </div>

                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '16px' }}>
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '16px' }}>
                            <CheckCircle2 size={20} />
                            Patient registered successfully! Redirecting...
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="ad-form-grid">
                            <div className="ad-field" style={{ gridColumn: '1 / -1' }}>
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    className="ad-input" 
                                    required 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    placeholder="e.g. Emily Clark" 
                                />
                            </div>
                            <div className="ad-field">
                                <label>Phone Number</label>
                                <div className="pd-input-icon-wrap" style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                                    <input 
                                        type="tel" 
                                        className="ad-input" 
                                        required 
                                        value={phone} 
                                        onChange={e => setPhone(e.target.value)} 
                                        placeholder="+91 0000000000" 
                                        style={{ paddingLeft: '40px' }} 
                                    />
                                </div>
                            </div>
                            <div className="ad-field">
                                <label>Gender</label>
                                <select className="ad-input" value={gender} onChange={e => setGender(e.target.value)}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="ad-field">
                                <label>Age *</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                                    <input 
                                        type="number" 
                                        className="ad-input" 
                                        required
                                        value={age} 
                                        onChange={e => setAge(e.target.value)} 
                                        placeholder="e.g. 25" 
                                        style={{ paddingLeft: '40px' }} 
                                        min="0"
                                        max="120"
                                    />
                                </div>
                            </div>
                            <div className="ad-field" style={{ gridColumn: '1 / -1' }}>
                                <label>Email (Optional)</label>
                                <div className="pd-input-icon-wrap" style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                                    <input 
                                        type="email" 
                                        className="ad-input" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                        placeholder="emily@example.com" 
                                        style={{ paddingLeft: '40px' }} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pd-settings-footer" style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button type="button" onClick={() => navigate("/admin/patients")} className="ad-btn-primary" style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                            <button type="submit" className="ad-btn-duo" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                                <UserPlus size={18} />
                                <span>{loading ? "Registering..." : "Register Patient"}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AddPatient
