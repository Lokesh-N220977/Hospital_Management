import { useState, useEffect } from "react"
import PatientLayout from "../../components/layout/patient/PatientLayout"
import {
  User, Mail, Phone, Camera, Shield,
  Save, X, Pencil, Calendar, PlusCircle,
  Users, Trash2, CheckCircle2, AlertCircle, LogOut
} from "lucide-react"
import { getPatientProfile, updatePatientProfile } from "../../services/patientService"
import { appointmentService } from "../../services/appointment.service"
import api from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

// ─── Types ────────────────────────────────────────────────────────────────────
interface FamilyMember {
  _id: string;
  name: string;
  phone: string;
  gender?: string;
  relation?: string;
  age?: number;
  created_by?: string;
}

// ─── Shared Modal Wrapper ─────────────────────────────────────────────────────
function ModalWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="pf-modal-overlay">
      <div className="pf-modal-box">
        {children}
      </div>
    </div>
  );
}

// ─── Add / Edit Member Modal ──────────────────────────────────────────────────
function MemberModal({
  mode, existing, onClose, onDone
}: {
  mode: "add" | "edit";
  existing?: FamilyMember;
  onClose: () => void;
  onDone: () => void;
}) {
  const [name, setName] = useState(existing?.name || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [gender, setGender] = useState(existing?.gender || "male");
  const [relation, setRelation] = useState(existing?.relation || "Spouse");
  const [age, setAge] = useState<string>(existing?.age?.toString() || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Phone Verify State for Modal
  const [isPhoneVerified, setIsPhoneVerified] = useState(mode === "edit");
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [otpPhone, setOtpPhone] = useState("");
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
  const [verifyingPhoneOtp, setVerifyingPhoneOtp] = useState(false);
  const [otpPhoneError, setOtpPhoneError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !age) { setError("Name, phone, and age are required"); return; }
    if (!isPhoneVerified) { setError("Please verify the phone number first"); return; }
    
    setLoading(true); setError("");
    try {
      const payload = { name, phone, gender, relation, age: parseInt(age) };
      if (mode === "add") {
        await api.post("/patients/add", payload);
      } else {
        await api.put(`/patients/${existing!._id}`, payload);
      }
      onDone();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Operation failed");
    } finally { setLoading(false); }
  };

  return (
    <ModalWrapper>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
            {mode === "add" ? "Add Family Member" : "Edit Member"}
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
            {mode === "add" ? "They can be selected when booking appointments" : "Update member details"}
          </p>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
          <X size={20} />
        </button>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px", display: "flex", gap: "8px" }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>Full Name *</label>
        <input type="text" required placeholder="e.g. Priya Sharma" value={name} onChange={e => setName(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", boxSizing: "border-box", marginBottom: "14px" }} />

        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>Phone Number *</label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <input 
            type="tel" 
            required 
            placeholder="+91 9876543210" 
            value={phone} 
            disabled={isPhoneVerified && mode === "edit" && phone === existing?.phone}
            onChange={e => {
              setPhone(e.target.value);
              setIsPhoneVerified(mode === "edit" && e.target.value === existing?.phone);
              setShowPhoneVerify(false);
            }}
            style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: isPhoneVerified ? "1px solid #10b981" : "1px solid #e2e8f0", fontSize: "14px", boxSizing: "border-box", background: isPhoneVerified ? "#f0fdf4" : "white" }} 
          />
          {phone && !isPhoneVerified && !showPhoneVerify && (
            <button 
              type="button"
              onClick={async () => {
                setSendingPhoneOtp(true);
                try {
                  await api.post("/auth/send-phone-verify-otp", { phone });
                  setShowPhoneVerify(true);
                } catch (err: any) {
                  setError(err.response?.data?.detail || "Failed to send OTP");
                } finally { setSendingPhoneOtp(false); }
              }}
              disabled={sendingPhoneOtp}
              style={{ background: "#3b82f6", color: "white", border: "none", padding: "0 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
            >
              {sendingPhoneOtp ? "..." : "Verify"}
            </button>
          )}
          {isPhoneVerified && <CheckCircle2 size={18} color="#10b981" style={{ alignSelf: "center" }} />}
        </div>

        {/* Verification UI for Modal */}
        {showPhoneVerify && !isPhoneVerified && (
          <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "14px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input 
                placeholder="6-digit code" 
                maxLength={6}
                value={otpPhone}
                onChange={e => setOtpPhone(e.target.value)}
                style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              />
              <button 
                type="button"
                onClick={async () => {
                  setVerifyingPhoneOtp(true);
                  try {
                    await api.post("/auth/verify-phone-verify-otp", { phone, otp: otpPhone });
                    setIsPhoneVerified(true);
                    setShowPhoneVerify(false);
                    setOtpPhone("");
                  } catch (err: any) {
                    setOtpPhoneError("Invalid code");
                  } finally { setVerifyingPhoneOtp(false); }
                }}
                disabled={verifyingPhoneOtp || otpPhone.length < 6}
                style={{ background: "#10b981", color: "white", border: "none", padding: "0 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
              >
                {verifyingPhoneOtp ? "..." : "Confirm"}
              </button>
            </div>
            {otpPhoneError && <p style={{ color: "#ef4444", fontSize: "11px", margin: "4px 0 0" }}>{otpPhoneError}</p>}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "22px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>Relation</label>
            <select value={relation} onChange={e => setRelation(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px" }}>
              {["Spouse", "Child", "Parent", "Sibling", "Other"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px" }}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "5px" }}>Age *</label>
        <input type="number" required placeholder="e.g. 25" value={age} onChange={e => setAge(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", boxSizing: "border-box", marginBottom: "22px" }}
          min="0" max="120" />

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={onClose}
            style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" disabled={loading || !isPhoneVerified}
            style={{ flex: 2, padding: "11px", borderRadius: "8px", border: "none", background: (loading || !isPhoneVerified) ? "#94a3b8" : "linear-gradient(135deg,#3b82f6,#2563eb)", color: "white", fontWeight: 600, cursor: (loading || !isPhoneVerified) ? "not-allowed" : "pointer" }}>
            {loading ? "Saving..." : mode === "add" ? "Add Member" : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({
  title, message, confirmLabel, danger,
  onConfirm, onCancel, loading
}: {
  title: string; message: string; confirmLabel: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
  return (
    <ModalWrapper>
      <div style={{ textAlign: "center", padding: "0 8px" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: danger ? "#fee2e2" : "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <AlertCircle size={26} color={danger ? "#ef4444" : "#f59e0b"} />
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>{title}</h3>
        <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "none", background: danger ? "#ef4444" : "#f59e0b", color: "white", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
const avatarColors = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [form, setForm] = useState({ name: "", email: "", phone: "", gender: "Male", age: 0 })
  const [family, setFamily] = useState<FamilyMember[]>([])
  const [familyLoading, setFamilyLoading] = useState(true)

  // Modal state
  const [showAdd, setShowAdd] = useState(false)
  const [editMember, setEditMember] = useState<FamilyMember | null>(null)
  const [deleteMember, setDeleteMember] = useState<FamilyMember | null>(null)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [originalPhone, setOriginalPhone] = useState("")

  // Phone Verify State for main profile
  const [isPhoneVerified, setIsPhoneVerified] = useState(true)
  const [showPhoneVerify, setShowPhoneVerify] = useState(false)
  const [otpPhone, setOtpPhone] = useState("")
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false)
  const [verifyingPhoneOtp, setVerifyingPhoneOtp] = useState(false)
  const [otpPhoneError, setOtpPhoneError] = useState("")

  useEffect(() => { fetchProfile(); fetchFamily(); }, [])

  const fetchProfile = async () => {
    try {
      const data = await getPatientProfile();
      setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "", gender: data.gender || "Male", age: data.age || 0 })
      setOriginalPhone(data.phone || "")
      setIsPhoneVerified(true)
    } catch { setError("Failed to load profile.") }
    finally { setLoading(false) }
  }

  const fetchFamily = async () => {
    setFamilyLoading(true);
    try { setFamily(await appointmentService.getMyPatients()); }
    catch {/* silent */}
    finally { setFamilyLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      await updatePatientProfile(form);
      setSuccess("Profile updated successfully!")
      setEditing(false)
      setTimeout(() => setSuccess(""), 3000)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.name = form.name;
      localStorage.setItem('user', JSON.stringify(user));
    } catch { setError("Failed to update profile.") }
    finally { setSaving(false) }
  }

  const handleDeleteMember = async () => {
    if (!deleteMember) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/patients/${deleteMember._id}`);
      setDeleteMember(null);
      setSuccess("Member removed.");
      setTimeout(() => setSuccess(""), 3000);
      fetchFamily();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to remove member.");
      setDeleteMember(null);
    } finally { setDeleteLoading(false); }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete("/auth/my-account");
    } catch {/* account may not exist — proceed */}
    logout();
    navigate("/login");
  }

  const getInitials = (name: string) =>
    name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const change = (f: string, v: any) => setForm(p => ({ ...p, [f]: v }));

  if (loading) return <PatientLayout><div style={{ padding: "100px", textAlign: "center" }}>Loading...</div></PatientLayout>;

  return (
    <PatientLayout>
      {/* Modals */}
      {showAdd && <MemberModal mode="add" onClose={() => setShowAdd(false)} onDone={fetchFamily} />}
      {editMember && <MemberModal mode="edit" existing={editMember} onClose={() => setEditMember(null)} onDone={fetchFamily} />}
      {deleteMember && (
        <ConfirmDeleteModal
          title="Remove Family Member?"
          message={`This will remove ${deleteMember.name} from your family list. Their appointment history will be preserved.`}
          confirmLabel="Remove"
          danger
          loading={deleteLoading}
          onConfirm={handleDeleteMember}
          onCancel={() => setDeleteMember(null)}
        />
      )}
      {showDeleteAccount && (
        <ConfirmDeleteModal
          title="Delete Your Account?"
          message="This action is permanent. Your account, login access, and all linked data will be removed. Appointment records may still be retained for hospital records."
          confirmLabel="Yes, Delete My Account"
          danger
          loading={deleteLoading}
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteAccount(false)}
        />
      )}

      <div className="pf-page">
        {/* Toast */}
        {success && (
          <div style={{ background: "#10b981", color: "white", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={16} /> {success}
          </div>
        )}
        {error && (
          <div style={{ background: "#ef4444", color: "white", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <X size={16} /> {error}
            <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "white", cursor: "pointer" }}><X size={14} /></button>
          </div>
        )}

        {/* ── Hero Card ── */}
        <div className="pf-hero-card">
          <div style={{ position: "relative" }}>
            <div className="pf-avatar-circle">
              {(form.name || "U")[0].toUpperCase()}
            </div>
            <button className="pf-camera-btn">
              <Camera size={13} />
            </button>
          </div>
          <div style={{ flex: 1, minWidth: "140px" }}>
            <h2 className="pf-hero-name">{form.name || "Your Name"}</h2>
            <p className="pf-hero-sub">
              {form.phone}{form.email ? ` • ${form.email}` : ""}
            </p>
            <span className="pf-verified-badge">
              <Shield size={12} /> Verified Profile
            </span>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {editing ? (
              <>
                <button 
                  onClick={handleSave} 
                  disabled={saving || (form.phone !== originalPhone && !isPhoneVerified)} 
                  className="pf-save-btn"
                  style={{ opacity: (saving || (form.phone !== originalPhone && !isPhoneVerified)) ? 0.6 : 1 }}
                >
                  <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={() => { setEditing(false); setForm(p => ({...p, phone: originalPhone})); setIsPhoneVerified(true); setShowPhoneVerify(false); }} className="pf-cancel-btn">
                  <X size={16} /> Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="pf-edit-btn">
                <Pencil size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* ── Personal Details ── */}
        <div className="pf-section-block">
          <h3 className="pf-section-heading">
            <User size={16} color="#3b82f6" /> Personal Details
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            {[
              { label: "Full Name", field: "name", type: "text", icon: <User size={13} />, readOnly: false },
              { label: "Email Address", field: "email", type: "email", icon: <Mail size={13} />, readOnly: true },
              { label: "Phone Number", field: "phone", type: "tel", icon: <Phone size={13} />, readOnly: false },
              { label: "Age", field: "age", type: "number", icon: <Calendar size={13} />, readOnly: false },
            ].map(({ label, field, type, icon, readOnly }) => (
              <div key={field}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  {icon} {label} {readOnly && <span style={{ fontSize: "11px", color: "#94a3b8" }}>(locked)</span>}
                </label>
                <input type={type} min={type === "number" ? 0 : undefined} max={type === "number" ? 120 : undefined}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: editing && !readOnly ? "1px solid #3b82f6" : "1px solid #e2e8f0", background: editing && !readOnly ? "white" : "#f8fafc", boxSizing: "border-box", fontSize: "14px", color: readOnly ? "#94a3b8" : "#1e293b" }}
                  value={(form as any)[field]}
                  onChange={e => {
                    const val = type === "number" ? parseInt(e.target.value) || 0 : e.target.value;
                    change(field, val);
                    if (field === "phone") {
                      setIsPhoneVerified(val === originalPhone);
                      setShowPhoneVerify(false);
                    }
                  }}
                  readOnly={!editing || readOnly}
                />
                
                {/* Phone Verification Sub-UI */}
                {editing && field === "phone" && form.phone !== originalPhone && !isPhoneVerified && (
                  <div style={{ marginTop: "10px", padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    {!showPhoneVerify ? (
                      <button 
                        type="button"
                        onClick={async () => {
                          setSendingPhoneOtp(true);
                          try {
                            await api.post("/auth/send-phone-verify-otp", { phone: form.phone });
                            setShowPhoneVerify(true);
                          } catch (err: any) {
                            setError(err.response?.data?.detail || "Failed to send OTP");
                          } finally { setSendingPhoneOtp(false); }
                        }}
                        disabled={sendingPhoneOtp}
                        style={{ background: "#3b82f6", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                      >
                        {sendingPhoneOtp ? "Sending..." : "Verify New Phone"}
                      </button>
                    ) : (
                      <div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input 
                            placeholder="6-digit code" 
                            maxLength={6}
                            value={otpPhone}
                            onChange={e => setOtpPhone(e.target.value)}
                            style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                          />
                          <button 
                            type="button"
                            onClick={async () => {
                              setVerifyingPhoneOtp(true);
                              try {
                                await api.post("/auth/verify-phone-verify-otp", { phone: form.phone, otp: otpPhone });
                                setIsPhoneVerified(true);
                                setShowPhoneVerify(false);
                              } catch (err: any) {
                                setOtpPhoneError("Invalid code");
                              } finally { setVerifyingPhoneOtp(false); }
                            }}
                            disabled={verifyingPhoneOtp || otpPhone.length < 6}
                            style={{ background: "#10b981", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                          >
                            {verifyingPhoneOtp ? "..." : "Confirm"}
                          </button>
                        </div>
                        {otpPhoneError && <p style={{ color: "#ef4444", fontSize: "11px", margin: "4px 0 0" }}>{otpPhoneError}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                <User size={13} /> Gender
              </label>
              <select style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: editing ? "1px solid #3b82f6" : "1px solid #e2e8f0", background: editing ? "white" : "#f8fafc", boxSizing: "border-box", fontSize: "14px" }}
                value={form.gender} onChange={e => change("gender", e.target.value)} disabled={!editing}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* ═══════════════════════ FAMILY MEMBERS ═══════════════════════ */}
        <div className="pf-section-block">
          <div className="pf-fam-header">
            <h3 className="pf-fam-title">
              <Users size={16} color="#3b82f6" /> Family Members
              <span className="pf-fam-count">{family.length}</span>
            </h3>
            <button onClick={() => setShowAdd(true)} className="pf-add-member-btn">
              <PlusCircle size={15} /> Add Member
            </button>
          </div>

          <div className="pf-fam-info-box">
            ℹ️ Each family member has their own medical identity used when booking appointments. Visit history is kept separate per member.
          </div>

          {familyLoading ? (
            <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>Loading...</p>
          ) : family.filter(m => m.created_by !== "self").length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px", color: "#94a3b8" }}>
              <Users size={36} style={{ marginBottom: "10px", opacity: 0.4 }} />
              <p style={{ margin: 0, fontWeight: 500 }}>No family members added yet</p>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>Click "Add Member" to get started</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {family.filter(m => m.created_by !== "self").map((member, i) => (
                <div key={member._id} className="pf-member-row pf-member-other">
                  {/* Avatar */}
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: avatarColors[i % avatarColors.length] + "28", color: avatarColors[i % avatarColors.length], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "16px", flexShrink: 0 }}>
                    {getInitials(member.name)}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <p className="pf-member-name">
                      {member.name}
                      {member.created_by === "self" ? (
                        <span className="pf-badge pf-badge-primary">You (Primary)</span>
                      ) : member.relation ? (
                        <span className="pf-badge pf-badge-relation">{member.relation}</span>
                      ) : (
                        <span className="pf-badge pf-badge-family">Family</span>
                      )}
                    </p>
                    <p className="pf-member-phone">
                      📞 {member.phone}{member.gender ? ` • ${member.gender}` : ""}{member.age ? ` • ${member.age} Yrs` : ""}
                    </p>
                  </div>
                  {/* Actions — only for family members */}
                  {member.created_by !== "self" && (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button title="Edit member" onClick={() => setEditMember(member)} className="pf-member-edit-btn">
                        <Pencil size={15} />
                      </button>
                      <button title="Remove member" onClick={() => setDeleteMember(member)} className="pf-member-del-btn">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════════════ DANGER ZONE ═══════════════════════ */}
        <div className="pf-danger-block">
          <h3 className="pf-danger-title">
            <AlertCircle size={16} /> Danger Zone
          </h3>
          <p className="pf-danger-sub">
            Actions below are permanent and cannot be undone.
          </p>
          <div className="pf-danger-inner">
            <div>
              <p className="pf-danger-label">Delete My Account</p>
              <p className="pf-danger-desc">Permanently removes your login access and associated data.</p>
            </div>
            <button onClick={() => setShowDeleteAccount(true)} className="pf-delete-account-btn">
              <LogOut size={15} /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </PatientLayout>
  )
}

export default Profile
