import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/layout/public/PublicNavbar';
import PublicFooter from '../../components/layout/public/PublicFooter';
import { 
    FaSearch, FaCalendarCheck, FaClinicMedical, 
    FaHeartbeat, FaHandSparkles, FaTooth, FaUserMd,
    FaStar, FaCalendarAlt, FaUserCheck, FaShieldAlt, FaClock,
    FaArrowRight, FaUsers, FaHospital, FaHeadset, FaBriefcase
} from 'react-icons/fa';
import { getPublicStats, getAllDoctors } from '../../services/doctorService';
import heroDoc from '../../assets/hero-doc.png';

const SERVER_URL = "http://localhost:8000";

// Removed animated counter hook and components for static display

/* ── Floating particle spans ── */
const HeroParticles: React.FC = () => (
    <div className="hero-particles" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className={`particle p${i + 1}`} />
        ))}
        <span className="hero-blob hero-blob-1" />
        <span className="hero-blob hero-blob-2" />
        <span className="hero-blob hero-blob-3" />
    </div>
);

const Home: React.FC = () => {
    const [stats, setStats] = useState({
        total_doctors: 0,
        total_patients: 0,
        total_appointments: 0
    });
    const [specialists, setSpecialists] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsData = await getPublicStats();
                if (statsData) setStats(statsData);

                const doctorsData = await getAllDoctors();
                if (doctorsData) {
                    // Sort by experience (descending) and take top 3
                    const topSpecialists = [...doctorsData].sort((a, b) => {
                        const expA = parseInt(String(a.experience)) || 0;
                        const expB = parseInt(String(b.experience)) || 0;
                        return expB - expA;
                    }).slice(0, 3);
                    
                    setSpecialists(topSpecialists);
                }
            } catch (error) {
                console.error("Error fetching home page data:", error);
            }
        };
        fetchData();
    }, []);

    const whyChooseUs = [
        { icon: <FaCalendarAlt />, title: "Easy Appointment Booking",  desc: "Schedule your visits in just a few clicks. Reschedule or cancel anytime without any hassle." },
        { icon: <FaUserCheck />,   title: "Verified Doctors",          desc: "Every practitioner is thoroughly vetted to ensure you receive care from certified professionals." },
        { icon: <FaShieldAlt />,   title: "Secure Medical Records",    desc: "Your privacy is our priority. We use strict encryption for all patient data." },
        { icon: <FaClock />,       title: "24/7 Access",               desc: "Access your health dashboard, lab results, and upcoming appointments at any time." },
    ];

    const specialties = [
        { icon: <FaHeartbeat />,    name: "Cardiologist",      desc: "Heart & blood vessel specialists" },
        { icon: <FaHandSparkles />, name: "Dermatologist",     desc: "Skin, hair, & nail specialists" },
        { icon: <FaTooth />,        name: "Dentist",           desc: "Oral health & hygiene specialists" },
        { icon: <FaUserMd />,       name: "General Physician", desc: "Primary care & family medicine" },
    ];

    const testimonials = [
        { text: "Booking an appointment for my mother was incredibly easy. We didn't have to wait in long queues, and the doctor was very professional.", author: "Jane Doe",    role: "Patient", initials: "JD", color: "#007bff" },
        { text: "The app is so user-friendly! I was able to find a great dermatologist near me and schedule a visit the very next day. Highly recommended.", author: "Mark Smith",  role: "Patient", initials: "MS", color: "#dc3545" },
        { text: "Having all my medical records in one secure place is a game changer. The 24/7 access makes managing my health so much simpler.",           author: "Robert Brown", role: "Patient", initials: "RB", color: "#28a745" },
    ];

    return (
        <div className="landing-page">

            {/* ═══ Hero ═══ */}
            <section className="hero-section hero-v4">
                <PublicNavbar />
                <HeroParticles />
                <div className="container hero-container-v2">
                    <div className="hero-text-side">
                        <div className="hero-badge-v2" style={{ animation: 'fadeInDown 0.8s ease-out both', animationDelay: '0.6s' }}>🏥 India's #1 Healthcare Platform</div>
                        <h1 className="hero-title-v2" style={{ animation: 'fadeInLeft 1s cubic-bezier(0.16, 1, 0.3, 1) both', animationDelay: '0.7s' }}>
                            Your Health, Our <span className="hero-accent-v2">Priority</span>
                        </h1>
                        <p className="hero-subtitle-v2" style={{ animation: 'fadeInLeft 1s cubic-bezier(0.16, 1, 0.3, 1) both', animationDelay: '0.8s' }}>
                            Find trusted doctors, book appointments instantly, and manage your health — all in one place.
                        </p>
                        <div className="hero-btns-v2" style={{ animation: 'fadeInUp 1s ease-out both', animationDelay: '0.9s' }}>
                            <Link to="/doctors" className="btn-primary-v2">Find a Doctor <FaArrowRight /></Link>
                            <a href="#about" className="btn-secondary-v2">Learn More</a>
                        </div>
                    </div>
                    <div className="hero-image-side">
                        <div className="hero-img-box">
                            <img src={heroDoc} alt="Medical Professional" />
                            <div className="hero-img-accent" />
                        </div>
                    </div>
                </div>
                {/* Decorative Bottom Wave */}
                <div className="hero-bottom-curve">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </section>

            {/* ═══ Trust Metrics — Animated Counters ═══ */}
            <section className="trust-metrics-section">
                <div className="container">
                    <div className="trust-grid">
                        <div className="trust-item no-anim">
                            <div className="trust-icon"><FaUsers /></div>
                            <h3>{stats.total_patients > 0 ? `${stats.total_patients.toLocaleString()}+` : "1,000+"}</h3>
                            <p>Patients Served</p>
                        </div>
                        <div className="trust-item no-anim">
                            <div className="trust-icon"><FaUserCheck /></div>
                            <h3>{stats.total_doctors > 0 ? `${stats.total_doctors}+` : "50+"}</h3>
                            <p>Verified Doctors</p>
                        </div>
                        <div className="trust-item no-anim">
                            <div className="trust-icon"><FaHospital /></div>
                            <h3>{stats.total_appointments > 0 ? `${stats.total_appointments.toLocaleString()}+` : "500+"}</h3>
                            <p>Appointments Completed</p>
                        </div>
                        <div className="trust-item no-anim">
                            <div className="trust-icon"><FaHeadset /></div>
                            <h3>24/7</h3>
                            <p>Support</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Why Choose MedicPulse ═══ */}
            <section className="why-choose-section" id="about">
                <div className="container">
                    <h2 className="section-title">Why Choose <span className="blue">MedicPulse?</span></h2>
                    <p className="section-subtitle">We combine medical expertise with modern technology to provide you the best healthcare experience.</p>
                    <div className="why-grid">
                        {whyChooseUs.map((item, idx) => (
                            <div key={idx} className="why-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="why-icon">{item.icon}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ Meet Specialists ═══ */}
            <section className="specialists-section" id="doctors">
                <div className="container">
                    <h2 className="section-title">Meet Our <span className="blue">Specialists</span></h2>
                    <p className="section-subtitle">Consult with our top-rated specialists who are dedicated to your overall well-being.</p>
                    <div className="specialists-grid-v">
                        {specialists.length > 0 ? specialists.map((s, idx) => {
                            const fallbackImage = `https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=800`;
                            const imageUrl = s.profile_image_url 
                                ? (s.profile_image_url.startsWith('http') ? s.profile_image_url : `${SERVER_URL}${s.profile_image_url}`)
                                : fallbackImage;

                            return (
                                <div key={idx} className="specialist-card-v">
                                    <div className="sc-img">
                                        <img src={imageUrl} alt={s.name} />
                                        <div className="sc-img-badge">{s.specialization}</div>
                                        <div className="sc-img-overlay" />
                                    </div>
                                    <div className="sc-body">
                                        <span className="sc-spec">{s.specialization}</span>
                                        <h3 className="sc-name">
                                            {s.name}
                                            <FaUserCheck className="sc-verified" title="Verified Professional" />
                                        </h3>
                                        <div className="sc-meta">
                                            <span className="sc-meta-item">
                                                <FaBriefcase /> {String(s.experience).split(' ')[0]} Yrs Exp.
                                            </span>
                                            <span className="sc-meta-item">
                                                <FaStar className="sc-star" /> 4.9
                                            </span>
                                        </div>
                                        <Link to="/login" className="sc-btn">
                                            Book Appointment <FaArrowRight />
                                        </Link>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="loading-placeholder">Loading specialists...</div>
                        )}
                    </div>
                    <div className="view-all-home">
                        <Link to="/doctors" className="btn-view-all">View All Doctors</Link>
                    </div>
                </div>
            </section>

            {/* ═══ Browse by Specialty ═══ */}
            <section className="specialty-section" id="about">
                <div className="container">
                    <h2 className="section-title">Browse by <span className="blue">Specialty</span></h2>
                    <p className="section-subtitle">Find experienced specialists across various medical departments.</p>
                    <div className="specialty-grid">
                        {specialties.map((s, idx) => (
                            <div key={idx} className="specialty-card">
                                <div className="s-icon">{s.icon}</div>
                                <div className="s-info"><h3>{s.name}</h3><p>{s.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ How It Works ═══ */}
            <section className="how-it-works-section">
                <div className="container">
                    <h2 className="section-title">How It <span className="blue">Works</span></h2>
                    <p className="section-subtitle">Your journey to better health begins with three simple steps.</p>
                    <div className="steps-grid">
                        {[
                            { num: 1, icon: <FaSearch />, title: "Search Doctor", desc: "Find the right specialist based on symptoms, specialty, or location.", active: false },
                            { num: 2, icon: <FaCalendarCheck />, title: "Book Appointment", desc: "Choose an available time slot and confirm your booking instantly.", active: true },
                            { num: 3, icon: <FaClinicMedical />, title: "Visit Clinic", desc: "Visit the doctor on time or consult online for a seamless experience.", active: false },
                        ].map(s => (
                            <div key={s.num} className="step-card">
                                <div className="step-num">{s.num}</div>
                                <div className={`step-icon-wrapper${s.active ? ' active' : ''}`}>{s.icon}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ Testimonials ═══ */}
            <section className="testimonials-section">
                <div className="container">
                    <h2 className="section-title">Patient <span className="blue">Testimonials</span></h2>
                    <p className="section-subtitle">Read what our trusted patients have to say about their MedicPulse experience.</p>
                    <div className="testimonials-cards">
                        {testimonials.map((t, idx) => (
                            <div key={idx} className="testimonial-v2">
                                <span className="t-quote">"</span>
                                <p className="t-text">{t.text}"</p>
                                <div className="t-author">
                                    <div className="t-avatar" style={{ backgroundColor: t.color }}>{t.initials}</div>
                                    <div className="t-info"><h4>{t.author}</h4><span>{t.role}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="cta-bottom">
                <div className="container">
                    <h2 className="white">Ready to Book Your Appointment?</h2>
                    <p className="white-fade">Find trusted doctors and schedule your visit in seconds.</p>
                    <Link to="/login" className="btn-cta-white">Get Started <FaArrowRight /></Link>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};

export default Home;
