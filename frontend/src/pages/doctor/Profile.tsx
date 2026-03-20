import { useState, useEffect } from "react"
import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { Mail, Phone, MapPin, Award, ShieldCheck, Camera, Loader2, Briefcase } from "lucide-react"
import { getPortalProfile } from "../../services/doctorService"

function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getPortalProfile()
        setProfile(data)
      } catch (err) {
        console.error("Failed to fetch profile", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <DoctorLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Loader2 className="animate-spin" size={48} color="#0dcb6e" />
        </div>
      </DoctorLayout>
    )
  }

  return (
    <DoctorLayout>
      <div className="pd-page">
        <div className="pd-header">
          <div className="pd-header-content">
            <h1 className="pd-page-title">Management Profile</h1>
            <p className="pd-page-sub">Review and maintain your professional identity and clinical credentials.</p>
          </div>
        </div>

        <div className="pd-profile-grid">
          {/* Left Column - Basic Info */}
          <div className="pd-side-stack">
            <div className="pd-card pd-profile-main-card">
              <div className="pd-profile-avatar-wrap">
                <img
                  src={profile?.profile_img || "https://img.freepik.com/free-photo/doctor-offering-medical-teleconsultation_23-2149329007.jpg"}
                  alt="Doctor"
                  className="pd-profile-img"
                />
                <button className="pd-avatar-upload">
                  <Camera size={16} />
                </button>
              </div>
              <h2 className="pd-profile-name">{profile?.name || "Dr. Practitioner"}</h2>
              <p className="pd-profile-specialty">{profile?.specialization || "Specialist"}</p>

              <div className="pd-profile-stats-row">
                <div className="pd-profile-stat">
                  <span className="pd-pstat-val">{profile?.experience || "0"}+</span>
                  <span className="pd-pstat-label">Years Experience</span>
                </div>
                <div className="pd-profile-stat">
                  <span className="pd-pstat-val">{profile?.languages ? profile.languages.length : 1}</span>
                  <span className="pd-pstat-label">Languages</span>
                </div>
              </div>
            </div>

            <div className="pd-card">
              <h3 className="pd-card-subtitle">Secure Contact</h3>
              <div className="pd-contact-list-alt">
                <div className="pd-contact-item-alt">
                  <Mail size={18} />
                  <div>
                    <span className="pd-contact-label">Registered Email</span>
                    <span className="pd-contact-val">{profile?.email}</span>
                  </div>
                </div>
                <div className="pd-contact-item-alt">
                  <Phone size={18} />
                  <div>
                    <span className="pd-contact-label">Contact Number</span>
                    <span className="pd-contact-val">{profile?.phone || "Not provided"}</span>
                  </div>
                </div>
                <div className="pd-contact-item-alt">
                  <MapPin size={18} />
                  <div>
                    <span className="pd-contact-label">Clinical Location</span>
                    <span className="pd-contact-val">{profile?.location || "Main Hospital Branch"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details & Settings */}
          <div className="pd-main-stack">
            <div className="pd-card">
              <div className="pd-card-header">
                <h3 className="pd-card-title">Professional Summary</h3>
                <button className="pd-card-action">Modify</button>
              </div>
              <p className="pd-bio-text">
                {profile?.bio || "No professional biography has been recorded yet. Update your profile to help patients understand your expertise."}
              </p>

              <div className="pd-bio-sections">
                <div className="pd-bio-sec">
                  <div className="pd-bio-sec-title">
                    <Award size={18} />
                    <span>Education</span>
                  </div>
                  <ul className="pd-bio-list">
                    {profile?.education && profile.education.length > 0 ? (
                      profile.education.map((edu: string, i: number) => <li key={i}>{edu}</li>)
                    ) : (
                      <li>No education details added.</li>
                    )}
                  </ul>
                </div>
                <div className="pd-bio-sec">
                  <div className="pd-bio-sec-title">
                    <ShieldCheck size={18} />
                    <span>Board Certifications</span>
                  </div>
                  <ul className="pd-bio-list">
                    {profile?.certifications && profile.certifications.length > 0 ? (
                      profile.certifications.map((cert: string, i: number) => <li key={i}>{cert}</li>)
                    ) : (
                      <li>Awaiting certification verification.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pd-card">
              <div className="pd-card-header">
                <h3 className="pd-card-title">Practice Metadata</h3>
              </div>
              <div className="pd-practice-grid">
                <div className="pd-practice-item">
                  <Briefcase size={16} className="inline mr-2" />
                  <span className="pd-practice-label">Hospital</span>
                  <span className="pd-practice-val">MedicPulse Central</span>
                </div>
                <div className="pd-practice-item">
                  <span className="pd-practice-label">Consultation Fee</span>
                  <span className="pd-practice-val">${profile?.consultation_fee || "0.00"}</span>
                </div>
                <div className="pd-practice-item">
                  <span className="pd-practice-label">Communication</span>
                  <span className="pd-practice-val">{profile?.languages ? profile.languages.join(", ") : "English"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  )
}

export default Profile
