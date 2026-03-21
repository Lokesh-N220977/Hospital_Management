import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/layout/public/PublicNavbar';
import PublicFooter from '../../components/layout/public/PublicFooter';
import { 
    FaSearch, FaBriefcase, FaStar, FaMapMarkerAlt, 
    FaClock, FaArrowRight, FaHandPointer, FaUserCheck
} from 'react-icons/fa';
import { getAllDoctors, getSpecializations, getLocations } from '../../services/doctorService';

const SERVER_URL = "http://localhost:8000";

interface Doctor {
    _id: string;
    name: string;
    specialization: string;
    profile_image_url?: string;
    experience: number;
    location?: string;
    hospital?: string;
    average_rating?: number;
    total_reviews?: number;
}

const MOBILE_BP = 768;

const FindDoctors: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [specialization, setSpecialization] = useState('All Specialties');
    const [location, setLocation] = useState('Any Location');
    const [minExperience, setMinExperience] = useState<number>(0);
    const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);
    const [availableLocations, setAvailableLocations] = useState<string[]>([]);
    const [flipped, setFlipped] = useState<number | null>(null);
    const [visibleCount, setVisibleCount] = useState(8);
    const gridRef = useRef<HTMLDivElement>(null);

    const fetchFilters = async () => {
        try {
            const [specs, locs] = await Promise.all([
                getSpecializations(),
                getLocations()
            ]);
            if (specs) setAvailableSpecializations(specs);
            if (locs) setAvailableLocations(locs);
        } catch (error) {
            console.error("Error fetching filters:", error);
        }
    };

    const fetchDoctors = async (paramsOverride?: any) => {
        setLoading(true);
        try {
            const params = {
                specialization: paramsOverride?.specialization ?? specialization,
                location: paramsOverride?.location ?? location,
                min_experience: paramsOverride?.minExperience ?? minExperience,
                ...paramsOverride
            };
            const data = await getAllDoctors(params);
            if (data) setDoctors(data);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFilters();
        fetchDoctors();
    }, []);

    const handleSearch = () => {
        fetchDoctors();
    };

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
                            <input 
                                type="text" 
                                placeholder="Name or Specialization..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <label>Specialization</label>
                            <select 
                                value={specialization}
                                onChange={(e) => {
                                    setSpecialization(e.target.value);
                                    fetchDoctors({ specialization: e.target.value });
                                }}
                            >
                                <option>All Specialties</option>
                                {availableSpecializations.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Location</label>
                            <select 
                                value={location}
                                onChange={(e) => {
                                    setLocation(e.target.value);
                                    fetchDoctors({ location: e.target.value });
                                }}
                            >
                                <option>Any Location</option>
                                {availableLocations.map(l => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Experience</label>
                            <select 
                                value={minExperience}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setMinExperience(val);
                                    fetchDoctors({ minExperience: val });
                                }}
                            >
                                <option value="0">Any Experience</option>
                                <option value="5">5+ Years</option>
                                <option value="10">10+ Years</option>
                                <option value="15">15+ Years</option>
                            </select>
                        </div>
                        <button className="btn-search" onClick={handleSearch}><FaSearch /></button>
                    </div>
                </div>
            </section>

            {/* ── Doctors Grid — Flip Cards (hover on desktop, tap on mobile) ── */}
            <section className="doctors-list-section">
                <div className="container">
                    <div className="flip-doctors-grid" ref={gridRef}>
                        {loading ? (
                            <div className="loading-state">Loading doctors...</div>
                        ) : doctors.length > 0 ? (() => {
                            const filtered = doctors.filter(doc => 
                                doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
                            );
                            
                            if (filtered.length === 0) return (
                                <div className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', color: '#64748b' }}>
                                    <p>No doctors found matching your criteria.</p>
                                    <button onClick={() => { setSearchTerm(''); setSpecialization('All Specialties'); setLocation('Any Location'); setMinExperience(0); fetchDoctors(); }} style={{ marginTop: '15px', background: 'none', border: '1px solid #007bff', color: '#007bff', padding: '8px 20px', borderRadius: '50px', cursor: 'pointer' }}>Clear All Filters</button>
                                </div>
                            );

                            return (
                                <>
                                    {filtered.slice(0, visibleCount).map((doc, idx) => (
                                        <div
                                            key={doc._id || idx}
                                            className={`flip-card${flipped === idx ? ' tapped' : ''}`}
                                            onClick={() => handleCardClick(idx)}
                                            role="button"
                                            aria-label={`View details for ${doc.name}`}
                                        >
                                            <div className="flip-card-inner">
                                                {/* Front */}
                                                <div className="flip-front">
                                                    <div className="flip-img">
                                                        <img 
                                                            src={doc.profile_image_url 
                                                                ? (doc.profile_image_url.startsWith('http') ? doc.profile_image_url : `${SERVER_URL}${doc.profile_image_url}`)
                                                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=random&size=500`
                                                            } 
                                                            alt={doc.name} 
                                                        />
                                                        <div className="flip-spec-badge">{doc.specialization}</div>
                                                        
                                                        {/* Floating Stats */}
                                                        <div className="sc-floating-meta">
                                                            <div className="sc-chip experience">
                                                                <FaBriefcase /> {String(doc.experience).split(' ')[0]} Years
                                                            </div>
                                                            <div className="sc-chip rating">
                                                                <FaStar /> {doc.average_rating || "0.0"} ({doc.total_reviews || 0})
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
                                                            <li><FaBriefcase /> {String(doc.experience).split(' ')[0]} Years Experience</li>
                                                            <li><FaStar /> {doc.average_rating || "0.0"} ({doc.total_reviews || 0} reviews)</li>
                                                            <li><FaMapMarkerAlt /> {doc.hospital || doc.location || "Available Nearby"}</li>
                                                            <li><FaClock />    Next: Available Now</li>
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
                                    {filtered.length > visibleCount && (
                                        <div className="load-more" style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '40px' }}>
                                            <button 
                                                className="btn-load-more" 
                                                onClick={() => setVisibleCount(prev => prev + 8)}
                                                style={{
                                                    backgroundColor: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '12px 30px',
                                                    borderRadius: '8px',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 4px 12px rgba(0,123,255,0.2)'
                                                }}
                                            >
                                                Load More Doctors
                                            </button>
                                        </div>
                                    )}
                                </>
                            );
                        })() : (
                            <div className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', color: '#64748b' }}>
                                <p>No doctors found matching your criteria.</p>
                            </div>
                        )}
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