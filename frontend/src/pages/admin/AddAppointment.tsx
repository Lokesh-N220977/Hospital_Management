import { useState, useEffect } from "react"
import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Search, UserCheck, AlertCircle, CheckCircle2, Loader2, Clock } from "lucide-react"
import api from "../../services/api"
import { appointmentService } from "../../services/appointment.service"
import { useNavigate } from "react-router-dom"

function AddAppointment() {
    const navigate = useNavigate();
    
    // Patient Search
    const [searchTerm, setSearchTerm] = useState("");
    const [foundPatients, setFoundPatients] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    
    // Selection State
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [selectedDoctorId, setSelectedDoctorId] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [reason, setReason] = useState("");
    
    // Data List
    const [doctors, setDoctors] = useState<any[]>([]);
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    
    // Feedback
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // 1. Search Patients in background as user types
    useEffect(() => {
        if (!searchTerm || (selectedPatientId && searchTerm.includes("("))) { return; }
        const t = setTimeout(async () => {
            setSearching(true);
            try {
                const data = await api.get("/admin/patients", { params: { search: searchTerm } }).then(res => res.data);
                setFoundPatients(Array.isArray(data) ? data : []);
            } catch (err) { console.error("Search failed"); }
            finally { setSearching(false); }
        }, 500);
        return () => clearTimeout(t);
    }, [searchTerm, selectedPatientId]);

    // 2. Fetch Doctors
    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const data = await appointmentService.getDoctors();
                setDoctors(data);
            } catch (err) { console.error("Docs fetch failed"); }
        };
        fetchDocs();
    }, []);

    // 3. Fetch Slots
    useEffect(() => {
        if (!selectedDoctorId || !selectedDate) { setAvailableSlots([]); return; }
        const fetchSlots = async () => {
            try {
                const data = await appointmentService.getAvailableSlots(selectedDoctorId, selectedDate);
                setAvailableSlots(data.slots || []);
                setSelectedSlot(""); // Reset slot when date/doctor changes
            } catch (err) { console.error("Slots fetch failed"); }
        };
        fetchSlots();
    }, [selectedDoctorId, selectedDate]);

    const handleConfirm = async () => {
        if (!selectedPatientId || !selectedDoctorId || !selectedDate || !selectedSlot) {
            setError("All fields are required. Please select a patient, doctor, date, and time slot.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await appointmentService.bookAppointment({
                doctor_id: selectedDoctorId,
                patient_id: selectedPatientId,
                date: selectedDate,
                time: selectedSlot,
                reason: reason || "Admin Scheduled Walk-in"
            });
            setSuccess(true);
            setTimeout(() => navigate("/admin/appointments"), 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Booking failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AdminLayout>
            <div className="ad-page" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1 className="ad-page-title">Book New Appointment</h1>
                        <p className="ad-page-sub">Schedule a medical consultation for existing hospital patients.</p>
                    </div>
                </div>

                <div className="ad-card" style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px' }}>
                    
                    {error && (
                        <div style={{ padding: '15px', background: '#fee2e2', color: '#b91c1c', borderRadius: '10px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 600 }}>
                            <AlertCircle size={20} /> {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ padding: '15px', background: '#dcfce7', color: '#166534', borderRadius: '10px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 600 }}>
                            <CheckCircle2 size={20} /> Appointment successfully booked! Redirecting to list...
                        </div>
                    )}

                    <div className="ad-form-section">
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#1e293b' }}>1. Patient Information</h3>
                        <div className="ad-field">
                            <label>Lookup Patient (Name, ID or Contact)</label>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                                <input 
                                    type="text" 
                                    className="ad-input" 
                                    placeholder="Start typing patient name..." 
                                    style={{ paddingLeft: '45px', fontSize: '1rem' }} 
                                    value={searchTerm}
                                    onChange={e => {
                                        setSearchTerm(e.target.value);
                                        if (selectedPatientId) setSelectedPatientId("");
                                    }}
                                />
                                {searching && (
                                    <div style={{ position: 'absolute', right: '16px', top: '16px' }}>
                                        <Loader2 size={18} className="animate-spin" color="#3b82f6" />
                                    </div>
                                )}
                                
                                {foundPatients.length > 0 && !selectedPatientId && searchTerm.length > 1 && (
                                    <div style={{ position: 'absolute', width: '100%', background: 'white', border: '1px solid #e2e8f0', zIndex: 100, borderRadius: '12px', marginTop: '5px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                        {foundPatients.map(p => (
                                            <div 
                                                key={p._id} 
                                                onClick={() => { 
                                                    setSelectedPatientId(p._id); 
                                                    setSearchTerm(`${p.name} (${p.phone || p._id.slice(-6).toUpperCase()})`); 
                                                    setFoundPatients([]);
                                                }}
                                                style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}
                                                className="ad-search-item-hover"
                                            >
                                                <div style={{ fontWeight: 700, color: '#1e293b' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.phone || "No contact"} • Patient ID: {p._id.slice(-6).toUpperCase()}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {selectedPatientId && (
                                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>
                                    <CheckCircle2 size={16} /> Patient Selected Successfully
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="ad-form-section" style={{ marginTop: '35px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#1e293b' }}>2. Schedule Appointment</h3>
                        <div className="ad-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="ad-field">
                                <label>Target Specialist</label>
                                <select 
                                    className="ad-input" 
                                    value={selectedDoctorId} 
                                    onChange={e => setSelectedDoctorId(e.target.value)}
                                    style={{ fontSize: '1rem' }}
                                >
                                    <option value="">Select Doctor</option>
                                    {doctors.map(d => (
                                        <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="ad-field">
                                <label>Consultation Date</label>
                                <input 
                                    type="date" 
                                    className="ad-input" 
                                    min={new Date().toISOString().split("T")[0]} 
                                    value={selectedDate} 
                                    onChange={e => setSelectedDate(e.target.value)} 
                                    onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()}
                                    style={{ fontSize: '1rem' }}
                                />
                            </div>
                        </div>

                        <div className="ad-field" style={{ marginTop: '25px' }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Choose Available Time Slot</span>
                                {selectedDoctorId && selectedDate && availableSlots.length === 0 && (
                                    <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>No slots found for this date.</span>
                                )}
                            </label>
                            
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', 
                                gap: '12px', 
                                marginTop: '10px' 
                            }}>
                                {availableSlots.map((s) => (
                                    <button
                                        key={s.time}
                                        onClick={() => setSelectedSlot(s.time)}
                                        disabled={s.booked}
                                        style={{
                                            padding: '12px 10px',
                                            borderRadius: '10px',
                                            border: '2px solid',
                                            borderColor: s.booked ? '#e2e8f0' : (selectedSlot === s.time ? '#3b82f6' : '#22c55e30'),
                                            background: s.booked ? '#f1f5f9' : (selectedSlot === s.time ? '#3b82f6' : '#fff'),
                                            color: s.booked ? '#94a3b8' : (selectedSlot === s.time ? '#fff' : '#16a34a'),
                                            cursor: s.booked ? 'not-allowed' : 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            textAlign: 'center',
                                            boxShadow: selectedSlot === s.time ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                                        }}
                                        type="button"
                                    >
                                        {s.time}
                                        {s.booked && <div style={{ fontSize: '0.65rem', marginTop: '2px', opacity: 0.7 }}>Occupied</div>}
                                    </button>
                                ))}
                            </div>
                            {!selectedDoctorId || !selectedDate ? (
                                <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                                    <Clock size={32} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
                                    <p>Select a doctor and date to view available time slots.</p>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="ad-field" style={{ marginTop: '30px' }}>
                        <label>Reason for Consultation / Special Instructions</label>
                        <textarea 
                            className="ad-input" 
                            rows={3} 
                            placeholder="Briefly state symptoms or follow-up reason..." 
                            style={{ resize: 'none', fontSize: '1rem', padding: '15px' }}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        ></textarea>
                    </div>

                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <button 
                            type="button" 
                            onClick={() => navigate("/admin/appointments")} 
                            className="ad-btn-primary" 
                            style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 25px', borderRadius: '10px', fontWeight: 600 }}
                        >
                            Back to List
                        </button>
                        <button 
                            className="ad-btn-duo" 
                            disabled={loading || success} 
                            onClick={handleConfirm}
                            style={{ padding: '12px 30px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserCheck size={18} />}
                            <span>{loading ? "Processing..." : "Confirm & Schedule Visit"}</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <style>{`
                .ad-search-item-hover:hover {
                    background: #f8fafc;
                }
                .ad-form-section {
                    background: #fff;
                    border-radius: 12px;
                }
            `}</style>
        </AdminLayout>
    )
}

export default AddAppointment
