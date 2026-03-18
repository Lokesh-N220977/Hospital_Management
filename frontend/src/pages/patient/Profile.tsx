import { useState } from "react"
import PatientLayout from "../../components/layout/patient/PatientLayout"
import {
  User, Mail, Phone, MapPin, Calendar,
  Pencil, Save, X, Camera, Shield,
  Heart, AlertCircle, Droplets
} from "lucide-react"

function Profile() {
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<"personal" | "medical" | "security">("personal")
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+91 98765 43210",
    dob: "1990-05-15",
    gender: "Male",
    address: "123 Main Street, Mumbai, MH 400001",
    bloodGroup: "O+",
    emergencyContact: "Jane Doe - +91 98765 00000",
    allergies: "Penicillin, Pollen",
    chronicConditions: "Hypertension",
    height: "175",
    weight: "68",
  })

  const handleSave = () => {
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const change = (field: string, val: string) =>
    setForm(f => ({ ...f, [field]: val }))

  const InputField = ({
    icon: Icon, label, field, type = "text", options
  }: {
    icon: React.ElementType, label: string, field: keyof typeof form, type?: string, options?: string[]
  }) => (
    <div className="pf-field">
      <label className="pf-label">
        <Icon size={14} /> {label}
      </label>
      {options ? (
        <select
          className={`pf-input${editing ? " pf-input-edit" : ""}`}
          value={form[field]}
          onChange={e => change(field, e.target.value)}
          disabled={!editing}
        >
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          className={`pf-input${editing ? " pf-input-edit" : ""}`}
          value={form[field]}
          onChange={e => change(field, e.target.value)}
          readOnly={!editing}
        />
      )}
    </div>
  )

  return (
    <PatientLayout>
      <div className="pf-page">

        {saved && (
          <div className="pf-toast">
            <Shield size={16} /> Profile updated successfully!
          </div>
        )}

        {/* Profile Hero */}
        <div className="pf-hero">
          <div className="pf-avatar-wrap">
            <div className="pf-avatar">JD</div>
            <button className="pf-avatar-edit">
              <Camera size={14} />
            </button>
          </div>
          <div className="pf-hero-info">
            <h2 className="pf-hero-name">{form.firstName} {form.lastName}</h2>
            <p className="pf-hero-email">{form.email}</p>
            <span className="pf-hero-badge">
              <Shield size={13} /> Verified Patient
            </span>
          </div>
          <div className="pf-hero-actions">
            {editing ? (
              <>
                <button className="pf-save-btn" onClick={handleSave}>
                  <Save size={15} /> Save Changes
                </button>
                <button className="pf-cancel-btn" onClick={() => setEditing(false)}>
                  <X size={15} /> Cancel
                </button>
              </>
            ) : (
              <button className="pf-edit-btn" onClick={() => setEditing(true)}>
                <Pencil size={15} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="pf-tabs">
          {(["personal", "medical", "security"] as const).map(tab => (
            <button
              key={tab}
              className={`pf-tab${activeTab === tab ? " pf-tab-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "personal" && <User size={15} />}
              {tab === "medical" && <Heart size={15} />}
              {tab === "security" && <Shield size={15} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Info
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="pf-content">

          {activeTab === "personal" && (
            <div className="pf-section">
              <h3 className="pf-section-title">Personal Information</h3>
              <div className="pf-grid">
                <InputField icon={User} label="First Name" field="firstName" />
                <InputField icon={User} label="Last Name" field="lastName" />
                <InputField icon={Mail} label="Email Address" field="email" type="email" />
                <InputField icon={Phone} label="Phone Number" field="phone" />
                <InputField icon={Calendar} label="Date of Birth" field="dob" type="date" />
                <InputField icon={User} label="Gender" field="gender" options={["Male", "Female", "Other"]} />
                <div className="pf-field pf-field-full">
                  <label className="pf-label"><MapPin size={14} /> Address</label>
                  <input
                    type="text"
                    className={`pf-input${editing ? " pf-input-edit" : ""}`}
                    value={form.address}
                    onChange={e => change("address", e.target.value)}
                    readOnly={!editing}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "medical" && (
            <div className="pf-section">
              <h3 className="pf-section-title">Medical Information</h3>
              <div className="pf-med-cards">
                {[
                  { icon: Droplets, label: "Blood Group", value: form.bloodGroup, color: "#ef4444" },
                  { icon: User, label: "Height (cm)", value: form.height, color: "#3b82f6" },
                  { icon: User, label: "Weight (kg)", value: form.weight, color: "#10b981" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div className="pf-med-card" key={label}>
                    <div className="pf-med-icon" style={{ background: `${color}18`, color }}>
                      <Icon size={22} />
                    </div>
                    <p className="pf-med-label">{label}</p>
                    <p className="pf-med-value">{value}</p>
                  </div>
                ))}
              </div>
              <div className="pf-grid">
                <div className="pf-field pf-field-full">
                  <label className="pf-label"><AlertCircle size={14} /> Known Allergies</label>
                  <input
                    type="text"
                    className={`pf-input${editing ? " pf-input-edit" : ""}`}
                    value={form.allergies}
                    onChange={e => change("allergies", e.target.value)}
                    readOnly={!editing}
                  />
                </div>
                <div className="pf-field pf-field-full">
                  <label className="pf-label"><Heart size={14} /> Chronic Conditions</label>
                  <input
                    type="text"
                    className={`pf-input${editing ? " pf-input-edit" : ""}`}
                    value={form.chronicConditions}
                    onChange={e => change("chronicConditions", e.target.value)}
                    readOnly={!editing}
                  />
                </div>
                <div className="pf-field pf-field-full">
                  <label className="pf-label"><Phone size={14} /> Emergency Contact</label>
                  <input
                    type="text"
                    className={`pf-input${editing ? " pf-input-edit" : ""}`}
                    value={form.emergencyContact}
                    onChange={e => change("emergencyContact", e.target.value)}
                    readOnly={!editing}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="pf-section">
              <h3 className="pf-section-title">Security Settings</h3>
              <div className="pf-security-items">
                {[
                  { label: "Change Password", desc: "Update your login password regularly", action: "Update" },
                  { label: "Two-Factor Authentication", desc: "Add an extra layer of security", action: "Enable" },
                  { label: "Login History", desc: "View your recent login sessions", action: "View" },
                  { label: "Delete Account", desc: "Permanently delete your account", action: "Delete", danger: true },
                ].map(({ label, desc, action, danger }) => (
                  <div className={`pf-security-item${danger ? " pf-security-danger" : ""}`} key={label}>
                    <div>
                      <p className="pf-sec-label">{label}</p>
                      <p className="pf-sec-desc">{desc}</p>
                    </div>
                    <button className={`pf-sec-btn${danger ? " pf-sec-btn-danger" : ""}`}>
                      {action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </PatientLayout>
  )
}

export default Profile
