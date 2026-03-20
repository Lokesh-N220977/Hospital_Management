import { useState, useEffect } from "react"
import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Calendar, Stethoscope, Search, UserCheck, AlertCircle, CheckCircle2 } from "lucide-react"
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
        if (!searchTerm) { setFoundPatients([]); return; }
        const t = setTimeout(async () => {
            setSearching(true);
            try {
                const { data } = await api.get("/admin/patients", { params: { phone: searchTerm } });
                setFoundPatients(data);
            } catch (err) { console.error("Search failed"); }
            finally { setSearching(false); }
        }, 500);
        return () => clearTimeout(t);
    }, [searchTerm]);

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
            } catch (err) { console.error("Slots fetch failed"); }
        };
        fetchSlots();
    }, [selectedDoctorId, selectedDate]);

    const handleConfirm = async () => {
        if (!selectedPatientId || !selectedDoctorId || !selectedDate || !selectedSlot) {
            setError("All fields are required");
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
            <div className="ad-page">
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1>Book Appointment</h1>
                        <p>Search for a patient and schedule their visit.</p>
                    </div>
                </div>

                <div className="ad-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    
                    {error && (
                        <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '16px' }}>
                            <AlertCircle size={20} /> {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ padding: '12px', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '16px' }}>
                            <CheckCircle2 size={20} /> Appointment booked! Redirecting...
                        </div>
                    )}

                    <div className="ad-form-grid">
                        <div className="ad-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Lookup Patient (Search by Phone Number)</label>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                                <input 
                                    type="text" 
                                    className="ad-input" 
                                    placeholder="Search by phone e.g. +91..." 
                                    style={{ paddingLeft: '40px' }} 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                {searching && <span style={{ position: 'absolute', right: '16px', top: '16px', fontSize: '12px', color: '#999' }}>Searching...</span>}
                                {foundPatients.length > 0 && selectedPatientId === "" && (
                                    <div style={{ position: 'absolute', width: '100%', background: 'white', border: '1px solid #e2e8f0', borderTop: 'none', zIndex: 10, borderRadius: '0 0 8px 8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                        {foundPatients.map(p => (
                                            <div 
                                                key={p._id} 
                                                onClick={() => { setSelectedPatientId(p._id); setSearchTerm(p.name + " (" + p.phone + ")"); }}
                                                style={{ padding: '12px 16px', cursor: 'pointer', hover: { background: '#f8fafc' } }}
                                                className="ad-search-item"
                                            >
                                                <strong>{p.name}</strong> • {p.phone}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {selectedPatientId && (
                                <div style={{ marginTop: '8px', fontSize: '13px', color: '#16a34a' }}>
                                    Patient Linked: {searchTerm} 
                                    <button onClick={() => { setSelectedPatientId(""); setSearchTerm(""); }} style={{ background: 'none', border: 'none', color: '#ef4444', marginLeft: '10px', cursor: 'pointer', textDecoration: 'underline' }}>Change</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <h3 style={{ borderBottom: '1px solid #eef2f6', paddingBottom: '10px', marginTop: '30px', marginBottom: '20px' }}>Select Doctor & Timing</h3>
                    <div className="ad-form-grid">
                        <div className="ad-field">
                            <label>Select Doctor</label>
                            <select 
                                className="ad-input" 
                                value={selectedDoctorId} 
                                onChange={e => setSelectedDoctorId(e.target.value)}
                            >
                                <option value="">Select Doctor</option>
                                {doctors.map(d => (
                                    <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
                                ))}
                            </select>
                        </div>
                        <div className="ad-field">
                            <label>Appointment Date</label>
                            <input 
                                type="date" 
                                className="ad-input" 
                                min={new Date().toISOString().split("T")[0]} 
                                value={selectedDate} 
                                onChange={e => setSelectedDate(e.target.value)} 
                            />
                        </div>
                        <div className="ad-field">
                            <label>Available Slots</label>
                            <select 
                                className="ad-input" 
                                value={selectedSlot} 
                                onChange={e => setSelectedSlot(e.target.value)}
                                disabled={!selectedDate || !selectedDoctorId}
                            >
                                <option value="">Select Slot</option>
                                {availableSlots.map(s => (
                                    <option key={s.time} value={s.time} disabled={s.booked}>
                                        {s.time} {s.booked ? "(Full)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="ad-field" style={{ marginTop: '20px' }}>
                        <label>Reason for Visit / Symptoms</label>
                        <textarea 
                            className="ad-input" 
                            rows={4} 
                            placeholder="Symptoms or note..." 
                            style={{ resize: 'vertical' }}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="pd-settings-footer" style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <button type="button" onClick={() => navigate("/admin/appointments")} className="ad-btn-primary" style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                        <button 
                            className="ad-btn-duo" 
                            disabled={loading || success} 
                            onClick={handleConfirm}
                            style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            <UserCheck size={18} />
                            <span>{loading ? "Scheduling..." : "Confirm Appointment"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AddAppointment
