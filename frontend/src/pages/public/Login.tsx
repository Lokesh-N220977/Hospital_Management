import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FaPlusSquare, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaSignInAlt,
    FaUserInjured, FaUserMd, FaUserShield
} from 'react-icons/fa';

const roleRedirects: Record<string, string> = {
    patient: '/patient/dashboard',
    doctor:  '/doctor/dashboard',
    admin:   '/admin/dashboard',
};

const roles = [
    { key: 'patient', label: 'Patient',      icon: <FaUserInjured />, color: '#007bff', canRegister: true  },
    { key: 'doctor',  label: 'Doctor',        icon: <FaUserMd />,      color: '#0dcb6e', canRegister: false },
    { key: 'admin',   label: 'Admin',         icon: <FaUserShield />,  color: '#8b5cf6', canRegister: false },
];

const heroLines = [
    "Streamline Your Health Journey",
    "Connect With Top Doctors",
    "Manage Your Health Records",
];

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [role, setRole]         = useState('patient');
    const [heroLine, setHeroLine] = useState(0);

    const activeRole = roles.find(r => r.key === role)!;

    React.useEffect(() => {
        const t = setInterval(() => setHeroLine(h => (h + 1) % heroLines.length), 3500);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="split-auth-page">

            {/* ── Left Panel ── */}
            <div className="split-left split-left--login"
                style={{ background: 'linear-gradient(155deg, #001f5e 0%, #003d99 40%, #0060cc 100%)' }}>
                <div className="split-left-bg" />
                <div className="auth-shape auth-shape-1" />
                <div className="auth-shape auth-shape-2" />
                <div className="auth-shape auth-shape-3" />

                <div className="split-left-content">
                    <div className="split-brand">
                        <FaPlusSquare /><span>MedicPulse</span>
                    </div>

                    {/* Cycling tagline */}
                    <div className="auth-tagline-wrap">
                        {heroLines.map((line, i) => (
                            <h2 key={i} className={`auth-tagline${heroLine === i ? ' active' : ''}`}>{line}</h2>
                        ))}
                    </div>

                    <p>Access your medical records, book appointments, and connect with top healthcare professionals securely from anywhere.</p>

                    <div className="auth-stats-row">
                        <div className="auth-stat"><strong>10K+</strong><span>Patients</span></div>
                        <div className="auth-stat-divider" />
                        <div className="auth-stat"><strong>500+</strong><span>Doctors</span></div>
                        <div className="auth-stat-divider" />
                        <div className="auth-stat"><strong>50+</strong><span>Hospitals</span></div>
                    </div>
                </div>
            </div>

            {/* ── Right Panel ── */}
            <div className="split-right split-right--compact">
                {/* Box shadow color matches selected role */}
                <div
                    className="split-form-box split-form-box--login"
                    style={{
                        boxShadow: `0 0 0 1px ${activeRole.color}22,
                                    0 6px 20px ${activeRole.color}25,
                                    0 0 60px ${activeRole.color}18,
                                   -12px 0 40px ${activeRole.color}10,
                                    12px 0 40px ${activeRole.color}10`
                    }}
                >
                    <Link to="/" className="back-link"><FaArrowLeft /> Back to Home</Link>

                    <div className="sf-header sf-header--compact">
                        <h1>Welcome Back</h1>
                        <p>Sign in to your account to continue</p>
                    </div>

                    {/* Role pill selector */}
                    <div className="role-pill-row">
                        {roles.map(r => (
                            <button
                                key={r.key}
                                type="button"
                                className={`role-pill${role === r.key ? ' active' : ''}`}
                                style={role === r.key ? {
                                    background: r.color,
                                    borderColor: r.color,
                                    color: '#fff',
                                    boxShadow: `0 4px 14px ${r.color}55`
                                } : {}}
                                onClick={() => setRole(r.key)}
                            >
                                <span className="rp-icon">{r.icon}</span> {r.label}
                            </button>
                        ))}
                    </div>

                    <form className="sf-form sf-form--compact" onSubmit={e => { e.preventDefault(); navigate(roleRedirects[role]); }}>
                        <div className="sf-field">
                            <label>Email Address</label>
                            <div className="sf-input-wrap">
                                <FaEnvelope className="sf-icon" />
                                <input type="email" placeholder="Enter your email" required />
                            </div>
                        </div>

                        <div className="sf-field">
                            <label>Password</label>
                            <div className="sf-input-wrap">
                                <FaLock className="sf-icon" />
                                <input type={showPass ? 'text' : 'password'} placeholder="Enter your password" required />
                                <button type="button" className="sf-eye" onClick={() => setShowPass(p => !p)}>
                                    {showPass ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="sf-meta">
                            <label className="sf-check"><input type="checkbox" /> Remember me</label>
                            <a href="#" className="sf-forgot">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            className="sf-submit-btn"
                            style={{ background: `linear-gradient(135deg, ${activeRole.color}, #003d99)` }}
                        >
                            <FaSignInAlt /> Login as {activeRole.label}
                        </button>

                        {/* Only for Patient */}
                        {activeRole.canRegister && (
                            <p className="sf-footer-text">
                                Don't have an account? <Link to="/register">Register here</Link>
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
