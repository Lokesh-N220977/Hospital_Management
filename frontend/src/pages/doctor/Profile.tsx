import { useState, useEffect, useRef } from "react"
import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { 
  Mail, Phone, MapPin, Award, Camera, 
  Loader2, Briefcase, Save, X, Edit3, CheckCircle2,
  Globe, GraduationCap, Activity, Lock, Star, MessageSquare
} from "lucide-react"
import { getPortalProfile, updatePortalProfile, updatePortalProfileImage } from "../../services/doctorService"
import { reviewService } from "../../services/reviewService"
import "../../styles/pages/doctor.css"

const IMAGE_BASE_URL = "http://localhost:8000";

function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<any>({})
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await getPortalProfile()
      setProfile(data)
      setFormData(data)
    } catch (err: any) {
      setError(err.message || "Failed to load profile data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile?.doctor_id) {
      const fetchReviews = async () => {
        try {
          setReviewsLoading(true)
          const data = await reviewService.getDoctorReviews(profile.doctor_id)
          setReviews(data)
        } catch (err) {
          console.error("Failed to load reviews")
        } finally {
          setReviewsLoading(false)
        }
      }
      fetchReviews()
    }
  }, [profile?.doctor_id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      const updatePayload = {
        name: formData.name,
        phone: formData.phone,
        specialization: formData.specialization,
        experience: Number(formData.experience) || 0,
        qualification: formData.qualification,
        consultation_fee: Number(formData.consultation_fee) || 0,
        about: formData.about
      }
      
      await updatePortalProfile(updatePayload)
      setProfile({ ...profile, ...updatePayload })
      setEditMode(false)
      setSuccess("Profile updated successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update profile.")
    } finally {
      setSaving(false)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setSaving(true)
      setError(null)
      const data = new FormData()
      data.append("file", file)
      
      const res = await updatePortalProfileImage(data)
      setProfile((prev: any) => ({ ...prev, profile_image_url: res.image_url }))
      setFormData((prev: any) => ({ ...prev, profile_image_url: res.image_url }))
      setSuccess("Profile picture updated!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to upload image.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DoctorLayout>
        <div className="pd-loader-full">
          <div className="pd-loader-container">
            <Loader2 className="animate-spin" size={48} color="#0dcb6e" />
            <p>Gathering your credentials...</p>
          </div>
        </div>
      </DoctorLayout>
    )
  }

  const initials = (profile?.name || "D").split(" ").map((n: any) => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <DoctorLayout>
      <div className="pd-page">
        {/* Animated Background Decoration */}
        <div className="pd-bg-blob"></div>

        <div className="pd-header">
          <div className="pd-header-content">
            <h1 className="pd-page-title">Doctor Profile</h1>
            <p className="pd-page-sub">Your professional identity across the MedicPulse network.</p>
          </div>
          <div className="pd-header-actions">
            {!editMode ? (
              <button 
                className="pd-btn-edit"
                onClick={() => setEditMode(true)}
              >
                <Edit3 size={18} /> Edit Identity
              </button>
            ) : (
              <div className="pd-edit-actions">
                <button 
                  className="pd-btn-cancel"
                  onClick={() => { setEditMode(false); setFormData(profile); setError(null); }}
                  disabled={saving}
                >
                  <X size={18} /> Cancel
                </button>
                <button 
                  className="pd-btn-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Complete Update
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="pd-alert pd-alert-error">
            <Activity size={20} />
            <div className="pd-alert-content">
               <strong>Correction Required</strong>
               <p className="pd-alert-text">{error}</p>
            </div>
            <X size={16} className="pd-alert-close" onClick={() => setError(null)} />
          </div>
        )}

        {success && (
          <div className="pd-alert pd-alert-success">
            <CheckCircle2 size={20} />
            <div className="pd-alert-content">
               <strong>Success</strong>
               <p>{success}</p>
            </div>
          </div>
        )}

        <div className="pd-profile-grid">
          {/* Left Column - Identity Card */}
          <div className="pd-side-column">
            <div className="pd-card pd-id-card">
              <div className="pd-avatar-container">
                <div className="pd-avatar-inner">
                  {profile?.profile_image_url ? (
                     <img
                      src={profile.profile_image_url.startsWith('http') ? profile.profile_image_url : `${IMAGE_BASE_URL}${profile.profile_image_url}`}
                      alt={profile?.name}
                      className="pd-avatar-img"
                    />
                  ) : (
                    <div className="pd-avatar-placeholder">
                      {initials}
                    </div>
                  )}
                  <button className="pd-avatar-trigger" onClick={handleImageClick} title="Update Profile Picture">
                    <Camera size={20} />
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="pd-id-info">
                {editMode ? (
                  <div className="pd-input-group">
                    <label>Professional Name</label>
                    <input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      className="pd-input-premium"
                      placeholder="Dr. Name"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="pd-doc-name">{profile?.name}</h2>
                    <div className="pd-doc-tag">
                       <span className="pd-tag-specialty">{profile?.specialization || "Physician"}</span>
                       <CheckCircle2 size={14} className="pd-icon-verified" />
                    </div>
                  </>
                )}
              </div>

              <div className="pd-stat-grid">
                <div className="pd-stat-box">
                  {editMode ? (
                    <div className="pd-input-compact-wrap">
                       <label className="pd-label-mini">EXP</label>
                       <input 
                        name="experience" 
                        type="number"
                        value={formData.experience} 
                        onChange={handleInputChange} 
                        className="pd-input-compact"
                      />
                    </div>
                  ) : (
                    <span className="pd-stat-num">{profile?.experience || "0"}</span>
                  )}
                  <span className="pd-stat-unit">Years Exp</span>
                </div>
                <div className="pd-stat-box">
                  <span className="pd-stat-num">
                    <Star size={18} className="pd-stat-star-icon" />
                    {profile?.average_rating || "0.0"}
                  </span>
                  <span className="pd-stat-unit">{profile?.total_reviews || 0} Reviews</span>
                </div>
              </div>

              <div className="pd-contact-list-vertical">
                <div className="pd-contact-item-vertical">
                   <div className="pd-contact-header-wrap">
                      <Mail size={16} />
                      <label>Registered Email</label>
                      <Lock size={12} className="pd-icon-lock" />
                   </div>
                   <span className="pd-contact-value-static">{profile?.email}</span>
                </div>
                
                <div className="pd-contact-item-vertical">
                   <div className="pd-contact-header-wrap">
                      <Phone size={16} />
                      <label>Contact Number</label>
                   </div>
                   {editMode ? (
                     <input 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        className="pd-input-premium-small"
                        placeholder="Update Phone"
                     />
                   ) : (
                     <span className="pd-contact-value-static">{profile?.phone || "Not provided"}</span>
                   )}
                </div>
              </div>
            </div>

            <div className="pd-card pd-location-card">
              <div className="pd-card-badge">Facility</div>
              <div className="pd-loc-detail">
                <MapPin size={20} className="pd-loc-icon" />
                <div>
                   <h4 className="pd-loc-name">MedicPulse Central</h4>
                   <p className="pd-loc-addr">{profile?.location || "Primary Care Division"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Career & Metadata */}
          <div className="pd-main-column">
            <div className="pd-card pd-about-card">
              <div className="pd-card-header-premium">
                <Activity size={20} />
                <h3>Professional Summary</h3>
              </div>
              
              {editMode ? (
                <div className="pd-field-block">
                   <textarea 
                    name="about" 
                    value={formData.about} 
                    onChange={handleInputChange} 
                    className="pd-textarea-premium" 
                    rows={6}
                    placeholder="Tell patients about your expertise, philosophy, and clinical focus..."
                  />
                </div>
              ) : (
                <p className="pd-summary-text">
                  {profile?.about || "Elevate your profile by sharing your professional journey and clinical passion with prospective patients."}
                </p>
              )}

              <div className="pd-credentials-grid">
                <div className="pd-credential-box">
                  <div className="pd-cred-header">
                    <GraduationCap size={18} />
                    <span>Academic Qualification</span>
                  </div>
                  {editMode ? (
                    <input 
                      name="qualification" 
                      value={formData.qualification} 
                      onChange={handleInputChange} 
                      className="pd-input-premium"
                      placeholder="e.g. MBBS, MD (Cardiology)"
                    />
                  ) : (
                    <p className="pd-cred-val">{profile?.qualification || "Awaiting credentials"}</p>
                  )}
                </div>
                <div className="pd-credential-box">
                  <div className="pd-cred-header">
                    <Award size={18} />
                    <span>Primary Specialty</span>
                  </div>
                  {editMode ? (
                    <input 
                      name="specialization" 
                      value={formData.specialization} 
                      onChange={handleInputChange} 
                      className="pd-input-premium"
                      placeholder="e.g. Cardiology"
                    />
                  ) : (
                    <p className="pd-cred-val">{profile?.specialization || "General Medicine"}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pd-card pd-practice-card">
              <div className="pd-card-header-premium">
                <Briefcase size={20} />
                <h3>Practice Metadata</h3>
              </div>
              
              <div className="pd-meta-row">
                <div className="pd-meta-item">
                   <div className="pd-meta-label">Consultation Fee (₹)</div>
                   {editMode ? (
                     <div className="pd-fee-input-wrap">
                        <span className="pd-fee-symbol">₹</span>
                        <input 
                          name="consultation_fee" 
                          type="number"
                          value={formData.consultation_fee} 
                          onChange={handleInputChange} 
                          className="pd-input-fee"
                        />
                     </div>
                   ) : (
                      <div className="pd-meta-val pd-fee-text">
                        <span>₹</span>{profile?.consultation_fee || "500"}
                        <span className="pd-fee-freq">/ session</span>
                      </div>
                   )}
                </div>

                <div className="pd-meta-item">
                   <div className="pd-meta-label">Clinical Status</div>
                   <div className="pd-status-pill">
                      <div className="pd-status-dot"></div>
                      <span>Active Provider</span>
                   </div>
                </div>

                <div className="pd-meta-item">
                   <div className="pd-meta-label">Primary Languages</div>
                   <div className="pd-lang-group">
                      <Globe size={14} />
                      <span>English, Hindi</span>
                   </div>
                </div>
              </div>
            </div>

              <div className="pd-card pd-reviews-card pd-mt-l">
                <div className="pd-card-header-premium">
                  <MessageSquare size={20} />
                  <h3>Recent Patient Feedback</h3>
                </div>
                
                <div className="pd-reviews-list">
                  {reviewsLoading ? (
                    <p className="pd-review-empty">Loading feedback...</p>
                  ) : reviews.length > 0 ? (
                   reviews.map((rev) => (
                     <div key={rev.id} className="pd-review-item">
                       <div className="pd-review-header">
                         <div className="pd-review-stars">
                           {[1, 2, 3, 4, 5].map((s) => (
                             <Star 
                               key={s} 
                               size={12} 
                               fill={s <= rev.rating ? "#fbbf24" : "none"} 
                               color={s <= rev.rating ? "#fbbf24" : "#d1d5db"} 
                             />
                           ))}
                         </div>
                          <div className="pd-review-info">
                            <span className="pd-patient-name">{rev.patient_name || "Self"}</span>
                            <span className="pd-review-date">{new Date(rev.created_at).toLocaleDateString()}</span>
                          </div>
                      </div>
                       <p className="pd-review-comment">{rev.comment || "No comment provided."}</p>
                     </div>
                   ))
                 ) : (
                    <p className="pd-review-empty">No reviews received yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DoctorLayout>
    )
  }

export default Profile
