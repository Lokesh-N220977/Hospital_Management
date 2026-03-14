import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/layout/public/PublicNavbar';
import PublicFooter from '../../components/layout/public/PublicFooter';
import { 
    FaSearch, FaCalendarCheck, FaClinicMedical, 
    FaHeartbeat, FaHandSparkles, FaTooth, FaUserMd,
    FaStar, FaCalendarAlt, FaUserCheck, FaShieldAlt, FaClock,
    FaArrowRight, FaUsers, FaHospital, FaHeadset, FaBriefcase
} from 'react-icons/fa';

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

    const specialists = [
        {
            name: "Dr. Sarah Jenkins",
            specialization: "Cardiologist",
            image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=500&h=600&q=80",
            experience: "12+ Years Experience",
            rating: "4.9 (200 Reviews)"
        },
        {
            name: "Dr. Michael Lee",
            specialization: "Dermatologist",
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&h=600&q=80",
            experience: "8+ Years Experience",
            rating: "4.8 (95 Reviews)"
        },
        {
            name: "Dr. Emily Chen",
            specialization: "Dentist",
            image: "https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&w=500&h=600&q=80",
            experience: "10+ Years Experience",
            rating: "4.9 (150 Reviews)"
        },
    ];

    return (
        <div className="landing-page">
            <PublicNavbar />

            {/* ═══ Hero ═══ */}
            <section className="hero-section">
                <HeroParticles />
                <div className="container hero-content">
                    <div className="hero-badge">🏥 India's #1 Healthcare Platform</div>
                    <h1 className="hero-title">
                        Your Health, Our{' '}
                        <span className="hero-accent">Priority</span>
                    </h1>
                    <p className="hero-subtitle">
                        Find trusted doctors, book appointments instantly, and manage your health — all in one place.
                    </p>
                    <div className="hero-btns">
                        <Link to="/doctors" className="btn-get-started">Find a Doctor <FaArrowRight /></Link>
                        <a href="#about" className="btn-hero-outline">Learn More</a>
                    </div>
                </div>
            </section>

            {/* ═══ Trust Metrics — Animated Counters ═══ */}
            <section className="trust-metrics-section">
                <div className="container">
                    <div className="trust-grid">
                        <div className="trust-item no-anim">
                            <div className="trust-icon"><FaUsers /></div>
                            <h3>10,000+</h3>
                            <p>Patients Served</p>
                        </div>
                        <div className="trust-item no-anim">
                            <div className="trust-icon"><FaUserCheck /></div>
                            <h3>500+</h3>
                            <p>Verified Doctors</p>
                        </div>
                        <div className="trust-item no-anim">
                            <div className="trust-icon"><FaHospital /></div>
                            <h3>50+</h3>
                            <p>Partner Hospitals</p>
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
                        {specialists.map((s, idx) => (
                            <div key={idx} className="specialist-card-v">
                                {/* Top part: Image with name overlay */}
                                <div className="sc-img">
                                    <img src={s.image} alt={s.name} />
                                    <div className="sc-img-badge">{s.specialization}</div>
                                    <div className="sc-img-overlay">
                                        <div className="sc-name-row">
                                            <h3 className="sc-name">{s.name}</h3>
                                            <FaUserCheck className="sc-verified" />
                                        </div>
                                        <p className="sc-spec">{s.specialization}</p>
                                    </div>
                                </div>
                                {/* Bottom part: Details in white space */}
                                <div className="sc-body">
                                    <div className="sc-meta">
                                        <span className="sc-meta-item">
                                            <FaBriefcase /> {s.experience}
                                        </span>
                                        <span className="sc-meta-item">
                                            <FaStar className="sc-star" /> {s.rating.split(' ')[0]}
                                        </span>
                                    </div>
                                    <Link to="/login" className="sc-btn">
                                        Book Appointment <FaArrowRight />
                                    </Link>
                                </div>
                            </div>
                        ))}
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
