import DoctorLayout from "../../components/layout/doctor/DoctorLayout"
import { Mail, Phone, MapPin, Award, ShieldCheck, Camera } from "lucide-react"

function Profile() {
  return (
    <DoctorLayout>
      <div className="pd-page">
        <div className="pd-header">
          <div className="pd-header-content">
            <h1 className="pd-page-title">My Profile</h1>
            <p className="pd-page-sub">Manage your professional information, availability, and account settings.</p>
          </div>
        </div>

        <div className="pd-profile-grid">
          {/* Left Column - Basic Info */}
          <div className="pd-side-stack">
            <div className="pd-card pd-profile-main-card">
              <div className="pd-profile-avatar-wrap">
                <img 
                  src="https://img.freepik.com/free-photo/doctor-offering-medical-teleconsultation_23-2149329007.jpg" 
                  alt="Doctor" 
                  className="pd-profile-img"
                />
                <button className="pd-avatar-upload">
                  <Camera size={16} />
                </button>
              </div>
              <h2 className="pd-profile-name">Dr. John Doe</h2>
              <p className="pd-profile-specialty">Senior Cardiologist</p>
              
              <div className="pd-profile-stats-row">
                <div className="pd-profile-stat">
                  <span className="pd-pstat-val">12+</span>
                  <span className="pd-pstat-label">Exp. Yrs</span>
                </div>
                <div className="pd-profile-stat">
                  <span className="pd-pstat-val">1.2k</span>
                  <span className="pd-pstat-label">Patients</span>
                </div>
                <div className="pd-profile-stat">
                  <span className="pd-pstat-val">4.9</span>
                  <span className="pd-pstat-label">Rating</span>
                </div>
              </div>
            </div>

            <div className="pd-card">
              <h3 className="pd-card-subtitle">Contact Information</h3>
              <div className="pd-contact-list-alt">
                <div className="pd-contact-item-alt">
                  <Mail size={18} />
                  <div>
                    <span className="pd-contact-label">Email</span>
                    <span className="pd-contact-val">dr.johndoe@medicpulse.com</span>
                  </div>
                </div>
                <div className="pd-contact-item-alt">
                  <Phone size={18} />
                  <div>
                    <span className="pd-contact-label">Phone</span>
                    <span className="pd-contact-val">+1 234 567 890</span>
                  </div>
                </div>
                <div className="pd-contact-item-alt">
                  <MapPin size={18} />
                  <div>
                    <span className="pd-contact-label">Location</span>
                    <span className="pd-contact-val">New York, USA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details & Settings */}
          <div className="pd-main-stack">
            <div className="pd-card">
              <div className="pd-card-header">
                <h3 className="pd-card-title">Professional Bio</h3>
                <button className="pd-card-action">Edit Bio</button>
              </div>
              <p className="pd-bio-text">
                Dr. John Doe is a world-renowned cardiologist with over 12 years of experience in cardiovascular health. 
                He specializes in non-invasive cardiology and has helped thousands of patients manage complex heart conditions. 
                He is dedicated to providing compassionate, evidence-based care to his community.
              </p>
              
              <div className="pd-bio-sections">
                <div className="pd-bio-sec">
                  <div className="pd-bio-sec-title">
                    <Award size={18} />
                    <span>Education</span>
                  </div>
                  <ul className="pd-bio-list">
                    <li>MD in Cardiology, Harvard Medical School</li>
                    <li>Resident Physician, Mayo Clinic</li>
                  </ul>
                </div>
                <div className="pd-bio-sec">
                  <div className="pd-bio-sec-title">
                    <ShieldCheck size={18} />
                    <span>Board Certifications</span>
                  </div>
                  <ul className="pd-bio-list">
                    <li>American Board of Internal Medicine</li>
                    <li>American Board of Cardiology</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pd-card">
              <div className="pd-card-header">
                <h3 className="pd-card-title">Practice Information</h3>
                <button className="pd-card-action">Update Practice</button>
              </div>
              <div className="pd-practice-grid">
                <div className="pd-practice-item">
                  <span className="pd-practice-label">Hospital</span>
                  <span className="pd-practice-val">MedicPulse Central</span>
                </div>
                <div className="pd-practice-item">
                  <span className="pd-practice-label">Consultation Fee</span>
                  <span className="pd-practice-val">$150.00</span>
                </div>
                <div className="pd-practice-item">
                  <span className="pd-practice-label">Average Wait Time</span>
                  <span className="pd-practice-val">15 - 20 Mins</span>
                </div>
                <div className="pd-practice-item">
                  <span className="pd-practice-label">Language</span>
                  <span className="pd-practice-val">English, Spanish</span>
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
