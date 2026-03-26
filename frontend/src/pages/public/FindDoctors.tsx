import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/layout/public/PublicNavbar';
import PublicFooter from '../../components/layout/public/PublicFooter';
import { 
    FaSearch, FaBriefcase, FaStar, 
    FaAward
} from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import { getAllDoctors, getSpecializations } from '../../services/doctorService';

const SERVER_URL = "http://localhost:8000";

interface Doctor {
    _id: string;
    name: string;
    specialization: string;
    profile_image_url?: string;
    experience: number | string;
    location?: string;
    hospital?: string;
    average_rating?: number;
    total_reviews?: number;
    about?: string;
    degree?: string;
    consultation_fee?: number;
    qualification?: string;
}

const MOBILE_BP = 768;

const FindDoctors: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [specialization, setSpecialization] = useState('All Specialties');
    const [minExperience, setMinExperience] = useState<number>(0);
    const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);
    const [flipped, setFlipped] = useState<number | null>(null);
    const visibleCount = 8;
    const [showModal, setShowModal] = useState(false);
    const [selectedDocForModal, setSelectedDocForModal] = useState<Doctor | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const fetchFilters = async () => {
        try {
            const specs = await getSpecializations();
            if (specs) setAvailableSpecializations(specs);
        } catch (error) {
            console.error("Error fetching filters:", error);
        }
    };

    const fetchDoctors = async (paramsOverride?: any) => {
        setLoading(true);
        try {
            const params = {
                specialization: paramsOverride?.specialization ?? specialization,
                min_experience: paramsOverride?.minExperience ?? minExperience,
                ...paramsOverride
            };
            // Ensure trailing slash for backend matching and avoid 307
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
                        <button className="btn-search" onClick={handleSearch} aria-label="Search"><FaSearch /></button>
                    </div>
                </div>
            </section>

            {/* ── Doctors Grid ── */}
            <section className="doctors-list-section">
                <div className="container">
                    <div className="flip-doctors-grid" ref={gridRef}>
                        {loading ? (
                            <div className="loading-state">Loading professional details...</div>
                        ) : doctors.length > 0 ? (() => {
                            const filtered = doctors.filter(doc => 
                                doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
                            );
                            
                            if (filtered.length === 0) return (
                                <div className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', color: '#64748b' }}>
                                    <p>No specialists found matching your criteria.</p>
                                    <button onClick={() => { setSearchTerm(''); setSpecialization('All Specialties'); setMinExperience(0); fetchDoctors(); }} style={{ marginTop: '15px', background: 'none', border: '1px solid #007bff', color: '#007bff', padding: '10px 25px', borderRadius: '50px', cursor: 'pointer' }}>Reset All Filters</button>
                                </div>
                            );

                            return (
                                <>
                                    {filtered.slice(0, visibleCount).map((doc, idx) => {
                                        const cleanBio = doc.about 
                                            ? doc.about.replace(/Dr\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s+is a specialist in [A-Za-z\s]+ with \d+ years of experience\.?\s+/i, "")
                                            : `Highly specialized in ${doc.specialization} with a focus on advanced patient-first treatment.`;

                                        return (
                                            <div
                                                key={doc._id}
                                                className={`flip-card${flipped === idx ? ' tapped' : ''}`}
                                                onClick={() => handleCardClick(idx)}
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
                                                            <div className="sc-floating-meta">
                                                                <div className="sc-chip experience" style={{ background: 'white', color: '#1e293b' }}>
                                                                    <FaBriefcase /> {String(doc.experience).split(' ')[0]} Years
                                                                </div>
                                                                <div className="sc-chip rating" style={{ background: 'white', color: '#1e293b' }}>
                                                                    <FaStar color="#f59e0b" /> {doc.average_rating || "0.0"} ({doc.total_reviews || 0})
                                                                </div>
                                                            </div>
                                                            <div className="sc-name-on-front" style={{ position: 'absolute', bottom: '0', left: 0, right: 0, padding: '25px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', color: 'white', textAlign: 'center' }}>
                                                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{doc.name}</h3>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Back */}
                                                    <div className="flip-back">
                                                        <div className="flip-back-content">
                                                            <h3 className="flip-back-name">{doc.name}</h3>
                                                            <p style={{ color: '#60a5fa', fontWeight: 700, margin: '5px 0 15px', fontSize: '13px' }}>{doc.specialization}</p>
                                                            
                                                            <p className="flip-bio" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', marginBottom: '15px', height: '62px', overflow: 'hidden' }}>
                                                                {cleanBio}
                                                            </p>

                                                            <ul className="flip-details" style={{ margin: 'auto 0 20px', padding: 0, listStyle: 'none' }}>
                                                                <li style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><FaBriefcase color="#3b82f6" /> {String(doc.experience).split(' ')[0]}+ Experience</li>
                                                                <li style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#10b981', fontWeight: 800 }}>₹{doc.consultation_fee || 500}</span> Consultation Fee</li>
                                                            </ul>

                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedDocForModal(doc); setShowModal(true); }}
                                                                    style={{ flex: 1, padding: '12px 0', fontSize: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}
                                                                >
                                                                    Full Profile
                                                                </button>
                                                                <Link
                                                                    to="/login"
                                                                    style={{ flex: 1, padding: '12px 0', fontSize: '12px', background: '#3b82f6', color: 'white', borderRadius: '12px', textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}
                                                                    onClick={e => e.stopPropagation()}
                                                                >
                                                                    Book Now
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            );
                        })() : (
                            <div className="loading-state">No doctors available.</div>
                        )}
                    </div>
                </div>
            </section>

            <PublicFooter />

            {/* Doctor Detail Modal */}
            {showModal && selectedDocForModal && (
                <div 
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    onClick={() => setShowModal(false)}
                >
                    <div 
                        style={{ 
                            background: '#ffffff', 
                            border: '1px solid rgba(0, 0, 0, 0.05)', 
                            borderRadius: '28px', 
                            width: '100%', 
                            maxWidth: '640px', 
                            overflow: 'hidden', 
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.05)', 
                            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
                            position: 'relative' 
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setShowModal(false)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '10px', borderRadius: '12px', zIndex: 10, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                        >
                            <FaXmark size={18} />
                        </button>

                        <div style={{ padding: '40px 40px 32px', background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                                <div style={{ 
                                    width: '100px', 
                                    height: '100px', 
                                    borderRadius: '24px', 
                                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: '2.5rem', 
                                    fontWeight: 900, 
                                    color: 'white', 
                                    boxShadow: '0 15px 30px rgba(37, 99, 235, 0.25)',
                                    flexShrink: 0
                                }}>
                                    {selectedDocForModal.name.replace('Dr. ', '').charAt(0)}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', lineHeight: 1.2 }}>{selectedDocForModal.name}</h2>
                                    <p style={{ margin: '6px 0 12px', color: '#2563eb', fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{selectedDocForModal.specialization}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        <span style={{ padding: '6px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', color: '#475569', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>{selectedDocForModal.degree || "M.D. Specialist"}</span>
                                        <span style={{ padding: '6px 12px', background: '#ecfdf5', borderRadius: '10px', fontSize: '0.85rem', color: '#059669', fontWeight: 800, border: '1px solid #d1fae5' }}>₹{selectedDocForModal.consultation_fee || 500} / Session</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '32px 40px 40px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', marginBottom: '32px' }}>
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaBriefcase size={12} /> Experience</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>{selectedDocForModal.experience}+ Years</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaStar size={12} color="#3b82f6" /> Educational Level</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{selectedDocForModal.degree || selectedDocForModal.qualification || "Specialist"}</div>
                                </div>
                            </div>

                            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '32px' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px', color: '#334155' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', color: '#3b82f6', width: '28px', height: '28px', borderRadius: '8px' }}><FaAward size={14} /></span>
                                    About Professional
                                </h4>
                                <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                                    {selectedDocForModal.about || `Dr. ${selectedDocForModal.name} is a highly accomplished specialist in ${selectedDocForModal.specialization}, known for excellence in diagnostics and patient-first clinical methodology.`}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Link to="/login" style={{ flex: 1.5, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>Initiate Appointment</Link>
                                <button onClick={() => setShowModal(false)} style={{ flex: 1, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }} onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

// Add standard animation for the modal
if (typeof document !== 'undefined') {
    const styleId = 'modal-animations';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(30px) scale(0.98); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}

export default FindDoctors;