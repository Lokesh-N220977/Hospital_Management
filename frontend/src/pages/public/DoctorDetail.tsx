import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/layout/public/PublicNavbar';
import PublicFooter from '../../components/layout/public/PublicFooter';
import { 
    FaBriefcase, FaStar, FaMapMarkerAlt, FaClock, 
    FaArrowLeft, FaArrowRight, FaUserCheck, FaGraduationCap,
    FaHospital, FaWallet, FaAward, FaCalendarAlt, FaShieldAlt
} from 'react-icons/fa';
import { getDoctorById } from '../../services/doctorService';

const SERVER_URL = "http://localhost:8000";

const DoctorDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDoctor = async () => {
            if (!id) return;
            try {
                const data = await getDoctorById(id);
                if (data) setDoctor(data);
                else setError('Doctor profile not found');
            } catch (err) {
                console.error("Error fetching doctor details:", err);
                setError('Failed to load doctor profile');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) return (
        <div style={{ background: '#020617', minHeight: '100vh', color: 'white' }}>
            <PublicNavbar />
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ padding: '40px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="loading-spinner">Synchronizing Credentials...</div>
                </div>
            </div>
            <PublicFooter />
        </div>
    );

    if (error || !doctor) return (
        <div style={{ background: '#020617', minHeight: '100vh', color: 'white' }}>
            <PublicNavbar />
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '30px' }}>
                <h2 style={{ color: '#94a3b8', fontSize: '2rem', fontWeight: 800 }}>{error || 'Profile Not Located'}</h2>
                <button 
                    onClick={() => navigate('/doctors')} 
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '50px', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem' }}
                >
                    Return to Registry
                </button>
            </div>
            <PublicFooter />
        </div>
    );

    const fallbackImage = `https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=800`;
    const imageUrl = doctor.profile_image_url 
        ? (doctor.profile_image_url.startsWith('http') ? doctor.profile_image_url : `${SERVER_URL}${doctor.profile_image_url}`)
        : fallbackImage;

    return (
        <div className="doctor-detail-page-dark">
            <PublicNavbar />
            
            <div className="dd-neon-wrapper">
                <div className="container">
                    <button onClick={() => navigate(-1)} className="dd-back-glow">
                        <FaArrowLeft /> Professional Directory
                    </button>
                    
                    <div className="dd-glass-header">
                        <div className="dd-profile-side">
                            <div className="dd-img-container">
                                <img src={imageUrl} alt={doctor.name} />
                                <div className="dd-live-status">LIVE</div>
                            </div>
                            
                            <div className="dd-name-stack">
                                <div className="dd-chip-row">
                                    <span className="dd-neon-badge">{doctor.specialization}</span>
                                    <span className="dd-secure-badge"><FaShieldAlt /> Verified Expert</span>
                                </div>
                                <h1 className="dd-main-name">{doctor.name} <span className="dd-suffix">{doctor.degree || "M.D."}</span></h1>
                                <p className="dd-expert-tag">{doctor.qualification || `Senior ${doctor.specialization} Consultant`}</p>
                            </div>
                        </div>
                        
                        <div className="dd-grid-stats">
                            <div className="dd-glass-stat">
                                <div className="dd-stat-icon-neon"><FaBriefcase /></div>
                                <div className="dd-stat-content">
                                    <span className="dd-stat-num">{doctor.experience}+</span>
                                    <span className="dd-stat-desc">Years Exp.</span>
                                </div>
                            </div>
                            <div className="dd-glass-stat">
                                <div className="dd-stat-icon-neon rating"><FaStar /></div>
                                <div className="dd-stat-content">
                                    <span className="dd-stat-num">{doctor.average_rating || "4.9"}</span>
                                    <span className="dd-stat-desc">Patient Rating</span>
                                </div>
                            </div>
                            <div className="dd-glass-stat">
                                <div className="dd-stat-icon-neon fee"><FaWallet /></div>
                                <div className="dd-stat-content">
                                    <span className="dd-stat-num">₹{doctor.consultation_fee || 500}</span>
                                    <span className="dd-stat-desc">Booking Fee</span>
                                </div>
                            </div>
                        </div>

                        <div className="dd-booking-neon-card">
                            <div className="dd-neon-pulse-dot" />
                            <h3 className="dd-card-title">Reservation Center</h3>
                            <p className="dd-slot-info">Available for Consultations</p>
                            <div className="dd-slot-highlight">Today: <span>4:30 PM - 7:00 PM</span></div>
                            <Link to="/login" className="dd-btn-neon">
                                Secure This Slot <FaArrowRight />
                            </Link>
                            <p className="dd-lock-note">Instant Confirmation • No Waiting</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dd-content-grid-section">
                <div className="container">
                    <div className="dd-main-layout">
                        <div className="dd-content-left">
                            <div className="dd-neon-section">
                                <h3 className="dd-section-title-neon"><FaAward /> Clinical Expertise</h3>
                                <div className="dd-bio-glow">
                                    {doctor.about || `Dr. ${doctor.name} is a renowned specialist in ${doctor.specialization} with an extensive track record of patient success. Utilizing precision medicine and state-of-the-art diagnostic protocols.`}
                                </div>
                            </div>

                            <div className="dd-neon-section">
                                <h3 className="dd-section-title-neon"><FaGraduationCap /> Academic Foundation</h3>
                                <div className="dd-credential-list">
                                    <div className="dd-cred-item">
                                        <div className="dd-cred-icon"><FaAward /></div>
                                        <div className="dd-cred-text">
                                            <h4>{doctor.qualification || "Post-Graduate Specialization"}</h4>
                                            <p>{doctor.degree || doctor.specialization} Professional Board Certification</p>
                                        </div>
                                    </div>
                                    <div className="dd-cred-item">
                                        <div className="dd-cred-icon"><FaUserCheck /></div>
                                        <div className="dd-cred-text">
                                            <h4>Medical Registry ID</h4>
                                            <p>Verified Practitioner No: {doctor.registration_number || "Verified MD-99201"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="dd-content-right">
                            <div className="dd-neon-section">
                                <h3 className="dd-section-title-neon"><FaHospital /> Clinical Practice</h3>
                                <div className="dd-hospital-neon-card">
                                    <h4 className="dd-hosp-name">{doctor.hospital || "MedicPulse Advanced Care Center"}</h4>
                                    <p className="dd-hosp-coord"><FaMapMarkerAlt /> {doctor.location || "North Wing, Specialist Block B"}</p>
                                    <div className="dd-map-neon">
                                        <div className="dd-map-overlay" />
                                        <FaMapMarkerAlt size={30} color="#3b82f6" style={{ position: 'relative', zIndex: 2 }} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="dd-neon-section">
                                <h3 className="dd-section-title-neon"><FaCalendarAlt /> Operational Hours</h3>
                                <div className="dd-hours-neon">
                                    <div className="dd-h-row"><span>Monday - Friday</span> <span>09:00 - 18:00</span></div>
                                    <div className="dd-h-row"><span>Saturday</span> <span>10:00 - 14:00</span></div>
                                    <div className="dd-h-row emergency"><span>Sunday</span> <span>EMERGENCY ONLY</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PublicFooter />
            
            <style>{`
                .doctor-detail-page-dark {
                    background: #020617;
                    min-height: 100vh;
                    color: #e2e8f0;
                }
                .dd-neon-wrapper {
                    background: radial-gradient(circle at 50% -20%, #1e3a8a 0%, #020617 70%);
                    padding: 40px 0 80px;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.1);
                }
                .dd-back-glow {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
                    color: rgba(255,255,255,0.7); padding: 10px 20px; border-radius: 12px;
                    display: inline-flex; align-items: center; gap: 10px; cursor: pointer;
                    margin-bottom: 40px; font-weight: 600; font-size: 14px;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .dd-back-glow:hover { background: rgba(255,255,255,0.08); color: white; transform: translateX(-5px); }

                .dd-glass-header {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr;
                    gap: 30px;
                    align-items: center;
                }

                .dd-profile-side { display: flex; gap: 30px; align-items: center; }
                .dd-img-container {
                    position: relative; width: 140px; height: 140px;
                    border-radius: 40px; overflow: hidden;
                    border: 3px solid rgba(59, 130, 246, 0.3);
                    box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
                }
                .dd-img-container img { width: 100%; height: 100%; object-fit: cover; }
                .dd-live-status {
                    position: absolute; top: 12px; left: 12px;
                    background: #ef4444; color: white; font-size: 8px; font-weight: 900;
                    padding: 2px 6px; border-radius: 4px; letter-spacing: 1px;
                }

                .dd-main-name { font-size: 2.4rem; font-weight: 900; margin: 0; color: white; letter-spacing: -1px; }
                .dd-suffix { font-size: 1.2rem; color: #60a5fa; font-weight: 500; }
                .dd-expert-tag { color: #94a3b8; font-size: 1.1rem; margin-top: 5px; font-weight: 500; }
                .dd-chip-row { display: flex; gap: 12px; margin-bottom: 12px; }
                .dd-neon-badge { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 4px 14px; border-radius: 50px; font-size: 12px; font-weight: 700; border: 1px solid rgba(59, 130, 246, 0.2); }
                .dd-secure-badge { display: flex; align-items: center; gap: 6px; color: #10b981; font-size: 12px; font-weight: 700; }

                .dd-grid-stats { display: flex; flex-direction: column; gap: 15px; }
                .dd-glass-stat {
                    background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255,255,255,0.05);
                    padding: 15px 20px; border-radius: 20px; display: flex; align-items: center; gap: 18px;
                    backdrop-filter: blur(10px);
                }
                .dd-stat-icon-neon {
                    width: 45px; height: 45px; border-radius: 14px; background: rgba(59, 130, 246, 0.1);
                    display: flex; align-items: center; justify-content: center; color: #3b82f6; font-size: 20px;
                    border: 1px solid rgba(59, 130, 246, 0.2);
                }
                .dd-stat-icon-neon.rating { color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
                .dd-stat-icon-neon.fee { color: #10b981; background: rgba(16, 185, 129, 0.05); }
                .dd-stat-content { display: flex; flex-direction: column; }
                .dd-stat-num { font-size: 1.4rem; font-weight: 800; color: white; line-height: 1; }
                .dd-stat-desc { font-size: 0.8rem; color: #64748b; font-weight: 600; margin-top: 4px; }

                .dd-booking-neon-card {
                    background: linear-gradient(160deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
                    padding: 30px; border-radius: 32px; border: 1px solid rgba(59, 130, 246, 0.2);
                    box-shadow: 0 30px 60px -15px rgba(0,0,0,0.5); position: relative;
                }
                .dd-neon-pulse-dot {
                    position: absolute; top: 30px; right: 30px; width: 10px; height: 10px;
                    background: #10b981; border-radius: 50%; box-shadow: 0 0 15px #10b981;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
                .dd-card-title { margin: 0; fontSize: 1.25rem; font-weight: 800; color: white; }
                .dd-slot-info { color: #94a3b8; font-size: 0.9rem; margin: 10px 0 20px; }
                .dd-slot-highlight { background: rgba(255,255,255,0.03); color: #cbd5e1; padding: 12px; border-radius: 14px; font-size: 14px; margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.05); }
                .dd-slot-highlight span { color: #3b82f6; font-weight: 800; margin-left: 5px; }
                .dd-btn-neon {
                    display: flex; align-items: center; justify-content: center; gap: 12px;
                    width: 100%; padding: 16px; background: #3b82f6; color: white;
                    border-radius: 18px; font-weight: 800; text-decoration: none;
                    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3); transition: all 0.3s;
                }
                .dd-btn-neon:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(59, 130, 246, 0.5); }
                .dd-lock-note { text-align: center; color: #475569; font-size: 12px; margin-top: 15px; font-weight: 600; }

                .dd-content-grid-section { padding: 60px 0; }
                .dd-main-layout { display: grid; grid-template-columns: 1.6fr 1fr; gap: 40px; }
                .dd-neon-section {
                    background: rgba(30, 41, 59, 0.4); padding: 35px; border-radius: 28px;
                    border: 1px solid rgba(255,255,255,0.05); margin-bottom: 40px;
                    backdrop-filter: blur(5px);
                }
                .dd-section-title-neon { display: flex; align-items: center; gap: 12px; font-size: 1.3rem; font-weight: 800; margin-bottom: 25px; color: white; }
                .dd-section-title-neon svg { color: #3b82f6; }
                .dd-bio-glow { font-size: 1.15rem; line-height: 1.8; color: #94a3b8; }

                .dd-credential-list { display: flex; flex-direction: column; gap: 20px; }
                .dd-cred-item { display: flex; gap: 20px; align-items: flex-start; }
                .dd-cred-icon { width: 50px; height: 50px; border-radius: 15px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center; color: #3b82f6; font-size: 20px; flex-shrink: 0; }
                .dd-cred-text h4 { margin: 0 0 5px; font-size: 1.1rem; color: #e2e8f0; }
                .dd-cred-text p { margin: 0; color: #64748b; font-size: 0.95rem; }

                .dd-hospital-neon-card { border-radius: 24px; }
                .dd-hosp-name { font-size: 1.25rem; font-weight: 800; margin-bottom: 8px; color: white; }
                .dd-hosp-coord { color: #64748b; font-size: 1rem; margin-bottom: 25px; display: flex; gap: 10px; }
                .dd-map-neon {
                    width: 100%; height: 180px; border-radius: 20px; background: #0f172a;
                    display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.05);
                    position: relative; overflow: hidden;
                }
                .dd-map-overlay {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: url('https://user-images.githubusercontent.com/10141970/171052671-50e5033c-62b2-4d08-a870-84f938c8dfa3.png');
                    background-size: cover; opacity: 0.3; filter: grayscale(1) invert(1);
                }

                .dd-hours-neon { display: flex; flex-direction: column; gap: 15px; }
                .dd-h-row { display: flex; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 14px; }
                .dd-h-row:last-child { border: none; }
                .dd-h-row span:last-child { color: white; font-weight: 700; }
                .dd-h-row.emergency { color: #ef4444; }
                .dd-h-row.emergency span:last-child { color: #ef4444; }

                @media (max-width: 1200px) {
                    .dd-glass-header { grid-template-columns: 1fr 1fr; }
                    .dd-booking-neon-card { grid-column: span 2; margin-top: 20px; }
                }

                @media (max-width: 768px) {
                    .dd-glass-header { grid-template-columns: 1fr; }
                    .dd-booking-neon-card { grid-column: span 1; }
                    .dd-profile-side { flex-direction: column; text-align: center; }
                    .dd-main-layout { grid-template-columns: 1fr; }
                    .dd-main-name { font-size: 2rem; }
                }
            `}</style>
        </div>
    );
};

export default DoctorDetail;
