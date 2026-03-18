// export default function FindDoctors() { return <div>FindDoctors</div>; }
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/layout/public/PublicNavbar';
import PublicFooter from '../../components/layout/public/PublicFooter';
import { 
    FaSearch, FaBriefcase, FaStar, FaMapMarkerAlt, 
    FaClock, FaArrowRight, FaHandPointer, FaUserCheck
} from 'react-icons/fa';

interface Doctor {
    name: string;
    specialization: string;
    image: string;
    experience: string;
    rating: string;
    hospital: string;
    available: string;
}

const MOBILE_BP = 768;

const FindDoctors: React.FC = () => {
    const [flipped, setFlipped] = useState<number | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const doctors: Doctor[] = [
        { name: "Dr. Rahul Sharma",  specialization: "Cardiologist",     image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&h=600&q=80&crop=faces", experience: "12+ Years", rating: "4.9 ★", hospital: "Apollo Heart Center",   available: "Mon 10:00 AM" },
        { name: "Dr. Priya Patel",   specialization: "Dermatologist",    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=500&h=600&q=80&crop=faces", experience: "8+ Years",  rating: "4.8 ★", hospital: "City Skin Clinic",      available: "Tue 2:00 PM"  },
        { name: "Dr. Ananya Singh",  specialization: "Dentist",          image: "https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&w=500&h=600&q=80&crop=faces", experience: "6+ Years",  rating: "4.7 ★", hospital: "Bright Smile Dental",   available: "Wed 11:00 AM" },
        { name: "Dr. Rohan Gupta",   specialization: "Orthopedic",       image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&h=600&q=80&crop=faces", experience: "10+ Years", rating: "4.9 ★", hospital: "Bone & Joint Clinic",   available: "Thu 3:00 PM"  },
        { name: "Dr. John Davis",    specialization: "General Physician", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&h=600&q=80&crop=faces", experience: "15+ Years", rating: "5.0 ★", hospital: "City General Hospital", available: "Mon 9:00 AM"  },
        { name: "Dr. Emily White",   specialization: "Pediatrician",     image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=500&h=600&q=80&crop=faces", experience: "9+ Years",  rating: "4.8 ★", hospital: "Kids Care Center",      available: "Fri 1:00 PM"  },
        { name: "Dr. Vikram Rao",    specialization: "Neurologist",      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&h=600&q=80&crop=faces", experience: "14+ Years", rating: "5.0 ★", hospital: "Apollo Neuro Center",   available: "Fri 4:00 PM"  },
        { name: "Dr. Chloe Smith",   specialization: "Psychiatrist",     image: "https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&w=500&h=600&q=80&crop=faces", experience: "7+ Years",  rating: "4.6 ★", hospital: "MindCare Clinic",       available: "Sat 10:00 AM" },
    ];

    const testimonials = [
        { text: "Booking with Dr. Sharma was very smooth and professional. The seamless platform matched me with the right specialist right away.", author: "Arjun K.", role: "Cardiology Patient", initials: "AK", color: "#007bff" },
        { text: "I easily found Dr. Priya using the filter feature. Her acne treatment cleared my skin within weeks. Highly recommend this service!", author: "Samira R.", role: "Dermatology Patient", initials: "SR", color: "#dc3545" },
    ];

    // ── Robust reset flipped when viewport grows to desktop ──
    useEffect(() => {
        const onResize = () => {
            // If we cross the breakpoint either way, or just resizing in desktop, clear any stuck states
            if (window.innerWidth >= MOBILE_BP) {
                setFlipped(null);
            }
        };
        window.addEventListener('resize', onResize);
        // Also fire on orientation change specifically for some mobile browsers
        window.addEventListener('orientationchange', onResize);
        
        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('orientationchange', onResize);
        };
    }, []);

    // ── Tap outside any card collapses the open one on mobile ──
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (window.innerWidth > MOBILE_BP) return;
            if (!gridRef.current) return;
            // If click target is not inside the grid, close all
            if (!gridRef.current.contains(e.target as Node)) {
                setFlipped(null);
            }
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);

    const handleCardClick = (idx: number) => {
        if (window.innerWidth <= MOBILE_BP) {
            setFlipped(prev => (prev === idx ? null : idx));
        }
    };


    return (
        <div className="find-doctors-page">
            <PublicNavbar />

            {/* ── Hero ── */}
            <section className="doctors-hero">
                <div className="dh-bg" />
                <div className="container dh-content">
                    <h1 className="dh-title">Find the Right Doctor<br />for Your Needs</h1>
                    <p className="dh-sub">Browse verified specialists and book appointments instantly.</p>
                </div>
            </section>

            {/* ── Search Filter ── */}
            <section className="search-filter-section">
                <div className="container">
                    <div className="search-card">
                        <div className="filter-group">
                            <label>Search Doctor</label>
                            <input type="text" placeholder="Name or Specialization..." />
                        </div>
                        <div className="filter-group">
                            <label>Specialization</label>
                            <select><option>All Specialties</option><option>Cardiology</option><option>Dermatology</option><option>Dentistry</option><option>Orthopedic</option><option>Neurology</option></select>
                        </div>
                        <div className="filter-group">
                            <label>Location</label>
                            <select><option>Any Location</option><option>Mumbai</option><option>Delhi</option><option>Bangalore</option></select>
                        </div>
                        <div className="filter-group">
                            <label>Experience</label>
                            <select><option>Any Experience</option><option>5+ Years</option><option>10+ Years</option><option>15+ Years</option></select>
                        </div>
                        <button className="btn-search"><FaSearch /></button>
                    </div>
                </div>
            </section>

            {/* ── Doctors Grid — Flip Cards (hover on desktop, tap on mobile) ── */}
            <section className="doctors-list-section">
                <div className="container">
                    <div className="flip-doctors-grid" ref={gridRef}>
                        {doctors.map((doc, idx) => (
                            <div
                                key={idx}
                                className={`flip-card${flipped === idx ? ' tapped' : ''}`}
                                onClick={() => handleCardClick(idx)}
                                role="button"
                                aria-label={`View details for ${doc.name}`}
                            >
                                <div className="flip-card-inner">
                                    {/* Front */}
                                    <div className="flip-front">
                                        <div className="flip-img">
                                            <img src={doc.image} alt={doc.name} />
                                            <div className="flip-spec-badge">{doc.specialization}</div>
                                            
                                            {/* Floating Stats */}
                                            <div className="sc-floating-meta">
                                                <div className="sc-chip experience">
                                                    <FaBriefcase /> {doc.experience.split(' ')[0]}
                                                </div>
                                                <div className="sc-chip rating">
                                                    <FaStar /> {doc.rating.split(' ')[0]}
                                                </div>
                                            </div>

                                            <div className="sc-img-overlay">
                                                <div className="sc-name-row">
                                                    <h3 className="sc-name">{doc.name}</h3>
                                                    <FaUserCheck className="sc-verified" />
                                                </div>
                                                <p className="sc-spec">{doc.specialization}</p>
                                            </div>
                                        </div>
                                        <div className="flip-front-body">
                                            <p className="flip-hint">
                                                <FaHandPointer className="flip-hint-icon" />
                                                <span className="hint-desktop">Hover</span>
                                                <span className="hint-mobile">Tap</span>
                                                {' '}to view details
                                            </p>
                                        </div>
                                    </div>

                                    {/* Back */}
                                    <div className="flip-back">
                                        <div className="flip-back-content">
                                            <h3 className="flip-back-name">{doc.name}</h3>
                                            <p className="flip-back-spec">{doc.specialization}</p>
                                            <ul className="flip-details">
                                                <li><FaBriefcase /> {doc.experience} Experience</li>
                                                <li><FaStar />     {doc.rating} Rating</li>
                                                <li><FaMapMarkerAlt /> {doc.hospital}</li>
                                                <li><FaClock />    Next: {doc.available}</li>
                                            </ul>
                                            <Link
                                                to="/login"
                                                className="flip-book-btn"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                Book Now <FaArrowRight />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="load-more">
                        <button className="btn-load-more">Load More Doctors</button>
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="what-patients-say">
                <div className="container">
                    <h2 className="section-title">What Our <span className="blue">Patients Say</span></h2>
                    <p className="section-subtitle">Read honest feedback from patients who booked specialists through our platform.</p>
                    <div className="testimonials-grid">
                        {testimonials.map((t, idx) => (
                            <div key={idx} className="testimonial-card">
                                <p className="testimonial-text">"{t.text}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar" style={{ backgroundColor: t.color }}>{t.initials}</div>
                                    <div className="author-info"><h4>{t.author}</h4><span>{t.role}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="consultation-cta">
                <div className="container">
                    <h2 className="white">Need medical consultation today?</h2>
                    <p className="white-fade">Find verified doctors and schedule your appointment in minutes.</p>
                    <Link to="/login" className="btn-book-now">Book Appointment <FaArrowRight /></Link>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};

export default FindDoctors;