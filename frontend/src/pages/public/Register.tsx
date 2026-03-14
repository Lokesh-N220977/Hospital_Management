import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FaPlusSquare, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash,
    FaPhone, FaVenusMars, FaArrowLeft, FaUserPlus,
    FaCalendarAlt, FaHeartbeat, FaShieldAlt, FaClock
} from 'react-icons/fa';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [showPass,    setShowPass]    = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed,      setAgreed]      = useState(false);

    return (
        <div className="split-auth-page reg-page">

            {/* ── Left Panel ── */}
            <div className="split-left reg-left"
                 style={{ background: 'linear-gradient(155deg, #001354 0%, #003d99 50%, #0060cc 100%)' }}>
                <div className="split-left-bg" />
                <div className="auth-shape auth-shape-1" />
                <div className="auth-shape auth-shape-2" />

                <div className="split-left-content">
                    <div className="split-brand">
                        <FaPlusSquare /><span>MedicPulse</span>
                    </div>
                    <h2>Join Our Healthcare Platform</h2>
                    <p>Create your free account to book appointments with verified specialists and manage your health seamlessly.</p>

                    <div className="reg-benefits">
                        <div className="reg-benefit">
                            <div className="rb-icon"><FaCalendarAlt /></div>
                            <div><strong>Book Appointments</strong><span>Find & book instantly</span></div>
                        </div>
                        <div className="reg-benefit">
                            <div className="rb-icon"><FaHeartbeat /></div>
                            <div><strong>Health Tracking</strong><span>Monitor your records</span></div>
                        </div>
                        <div className="reg-benefit">
                            <div className="rb-icon"><FaShieldAlt /></div>
                            <div><strong>Secure & Private</strong><span>Encrypted data storage</span></div>
                        </div>
                        <div className="reg-benefit">
                            <div className="rb-icon"><FaClock /></div>
                            <div><strong>24/7 Access</strong><span>Available anytime</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right Panel ── */}
            <div className="split-right reg-right">
                <div className="split-form-box split-form-box--wide reg-form-box">

                    <Link to="/" className="back-link"><FaArrowLeft /> Back to Home</Link>

                    <div className="sf-header">
                        <h1>Create Your Account</h1>
                        <p>Join thousands of patients using MedicPulse — it's free!</p>
                    </div>

                    <form className="sf-form" onSubmit={e => { e.preventDefault(); navigate('/patient/dashboard'); }}>

                        {/* Full Name */}
                        <div className="sf-field">
                            <label>Full Name</label>
                            <div className="sf-input-wrap">
                                <FaUser className="sf-icon" />
                                <input type="text" placeholder="Enter your full name" required />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="sf-field">
                            <label>Email Address</label>
                            <div className="sf-input-wrap">
                                <FaEnvelope className="sf-icon" />
                                <input type="email" placeholder="email@example.com" required />
                            </div>
                        </div>

                        {/* Gender + Phone */}
                        <div className="sf-row">
                            <div className="sf-field">
                                <label>Gender</label>
                                <div className="sf-input-wrap">
                                    <FaVenusMars className="sf-icon" />
                                    <select required>
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="sf-field">
                                <label>Phone Number</label>
                                <div className="sf-input-wrap">
                                    <FaPhone className="sf-icon" />
                                    <input type="tel" placeholder="+91 234 567 890" required />
                                </div>
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="sf-field">
                            <label>Date of Birth</label>
                            <div className="sf-input-wrap">
                                <FaCalendarAlt className="sf-icon" />
                                <input type="date" required />
                            </div>
                        </div>

                        {/* Password + Confirm */}
                        <div className="sf-row">
                            <div className="sf-field">
                                <label>Password</label>
                                <div className="sf-input-wrap">
                                    <FaLock className="sf-icon" />
                                    <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" required />
                                    <button type="button" className="sf-eye" onClick={() => setShowPass(p => !p)}>
                                        {showPass ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            <div className="sf-field">
                                <label>Confirm Password</label>
                                <div className="sf-input-wrap">
                                    <FaLock className="sf-icon" />
                                    <input type={showConfirm ? 'text' : 'password'} placeholder="Repeat password" required />
                                    <button type="button" className="sf-eye" onClick={() => setShowConfirm(p => !p)}>
                                        {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <label className="sf-terms">
                            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                            I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                        </label>

                        <button type="submit" className="sf-submit-btn reg-btn" disabled={!agreed}>
                            <FaUserPlus /> Create Account
                        </button>

                        <p className="sf-footer-text">
                            Already have an account? <Link to="/login">Login here</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
