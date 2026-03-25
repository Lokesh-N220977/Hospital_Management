import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaEnvelope, FaLock, FaEye, FaEyeSlash,
    FaArrowLeft, FaSignInAlt, FaUserInjured, FaUserMd, FaUserShield
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import logo from '../../assets/logo.png';

const roleRedirects: Record<string, string> = {
    patient: '/patient/dashboard',
    doctor: '/doctor/dashboard',
    admin: '/admin/dashboard',
};

const roles = [
    { key: 'patient', label: 'Patient', icon: <FaUserInjured />, color: '#007bff', canRegister: true },
    { key: 'doctor', label: 'Doctor', icon: <FaUserMd />, color: '#0dcb6e', canRegister: false },
    { key: 'admin', label: 'Admin', icon: <FaUserShield />, color: '#8b5cf6', canRegister: false },
];

const heroLines = [
    "Streamline Your Health Journey",
    "Connect With Top Doctors",
    "Manage Your Health Records",
];

// Patient: 'email' (email+password) or 'phone' (phone+password)
// Doctor/Admin: always 'email'

import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [role, setRole] = useState('patient');
    const [heroLine, setHeroLine] = useState(0);
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Unified identifier (Email or Phone)
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    const activeRole = roles.find(r => r.key === role)!;

    React.useEffect(() => {
        const t = setInterval(() => setHeroLine(h => (h + 1) % heroLines.length), 3500);
        return () => clearInterval(t);
    }, []);

    // When role changes: reset fields
    React.useEffect(() => {
        setError('');
        setIdentifier('');
        setPassword('');
    }, [role]);

    // ── Unified Login Handler ───────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier || !password) {
            setError('Please enter your email and password');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const res = await authService.loginUnified(identifier.trim(), password, role);
            login(res);
            const user = res.user;
            if (user?.must_change_password && user.role === 'doctor') {
                navigate('/doctor/change-password');
            } else {
                navigate(roleRedirects[user.role] || '/');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Google Login Handler ────────────────────────────────────────────
    const handleGoogleSuccess = async (credentialResponse: any) => {
        setSubmitting(true);
        setError('');
        try {
            const res = await authService.googleLogin(credentialResponse.credential, role);
            login(res);
            navigate(roleRedirects[res.user.role] || '/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Google login failed');
        } finally {
            setSubmitting(false);
        }
    };

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
                    <div className="brand">
                    <img src={logo} alt="Logo" />
                    MedicPulse
                </div>
                    <div className="auth-tagline-wrap">
                        {heroLines.map((line, i) => (
                            <h2 key={i} className={`auth-tagline${heroLine === i ? ' active' : ''}`}>{line}</h2>
                        ))}
                    </div>
                    <p>Access your medical records, book appointments, and connect with top healthcare professionals securely.</p>
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
                <div className="split-form-box split-form-box--login"
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
                        <p>Sign in to your account as {activeRole.label}</p>
                    </div>

                    {/* Role Selector */}
                    <div className="role-pill-row">
                        {roles.map(r => (
                            <button key={r.key} type="button"
                                className={`role-pill${role === r.key ? ' active' : ''}`}
                                style={role === r.key ? {
                                    background: r.color, borderColor: r.color,
                                    color: '#fff', boxShadow: `0 4px 14px ${r.color}55`
                                } : {}}
                                onClick={() => setRole(r.key)}
                            >
                                <span className="rp-icon">{r.icon}</span> {r.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Error Banner ── */}
                    {error && (
                        <div style={{
                            backgroundColor: '#fef2f2', color: '#b91c1c',
                            padding: '10px 14px', borderRadius: '8px',
                            fontSize: '0.9rem', marginBottom: '15px',
                            border: '1px solid #fee2e2'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* ── Unified Form ── */}
                    <form className="sf-form sf-form--compact" onSubmit={handleLogin} style={{ marginBottom: '10px' }}>
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="your@email.com"
                            required
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            icon={<FaEnvelope />}
                        />
                        <div style={{ position: 'relative' }}>
                            <Input
                                label="Password"
                                type={showPass ? 'text' : 'password'}
                                placeholder="Your password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                icon={<FaLock />}
                            />
                            <button type="button" className="sf-eye" style={{ top: '38px' }}
                                onClick={() => setShowPass(p => !p)}>
                                {showPass ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        <div className="sf-meta">
                            <label className="sf-check"><input type="checkbox" /> Remember me</label>
                            <a href="#" className="sf-forgot">Forgot password?</a>
                        </div>
                        <Button type="submit" loading={submitting}
                            style={{ background: `linear-gradient(135deg, ${activeRole.color}, #003d99)` }}>
                            <FaSignInAlt style={{ marginRight: '8px' }} /> Login as {activeRole.label}
                        </Button>
                    </form>

                    {/* ── Social Login / Bottom Links ── */}
                    {role === 'patient' && (
                        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                                OR
                                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google Login Failed')}
                                    useOneTap
                                    theme="filled_blue"
                                    shape="pill"
                                    text="signin_with"
                                    width="100%"
                                />
                            </div>
                        </div>
                    )}

                    {activeRole.canRegister && (
                        <p className="sf-footer-text" style={{ marginTop: '20px' }}>
                            Don't have an account? <Link to="/register">Register here</Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
