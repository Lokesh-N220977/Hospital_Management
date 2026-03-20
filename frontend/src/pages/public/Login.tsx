import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaPlusSquare, FaPhone, FaEnvelope, FaLock, FaEye, FaEyeSlash,
    FaArrowLeft, FaSignInAlt, FaUserInjured, FaUserMd, FaUserShield, FaKey
} from 'react-icons/fa';
import { MdOutlineSms } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

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

// ─── Login mode ────────────────────────────────────────────────────────────────
//  'otp'   → send OTP to phone → verify                (patients, primary)
//  'email' → email + password                           (all roles, secondary/admin)
//  'phone' → phone + password                           (legacy / admin / doctor)
type LoginMode = 'otp' | 'email' | 'phone';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [role, setRole] = useState('patient');
    const [heroLine, setHeroLine] = useState(0);
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // OTP flow state
    const [mode, setMode] = useState<LoginMode>('otp');
    const [otpStep, setOtpStep] = useState<'enter_phone' | 'enter_otp'>('enter_phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    // Email / password state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const activeRole = roles.find(r => r.key === role)!;

    React.useEffect(() => {
        const t = setInterval(() => setHeroLine(h => (h + 1) % heroLines.length), 3500);
        return () => clearInterval(t);
    }, []);

    // When role changes, default patients to OTP and admin/doctor to email
    React.useEffect(() => {
        if (role === 'patient') setMode('otp');
        else setMode('email');
        setError('');
    }, [role]);

    // ── OTP Step 1: Send ────────────────────────────────────────────────────────
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone.trim()) { setError('Please enter your phone number'); return; }
        setSubmitting(true); setError('');
        try {
            await authService.sendOTP(phone.trim());
            setOtpStep('enter_otp');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to send OTP. Try again.');
        } finally { setSubmitting(false); }
    };

    // ── OTP Step 2: Verify ──────────────────────────────────────────────────────
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim()) { setError('Please enter the OTP'); return; }
        setSubmitting(true); setError('');
        try {
            const res = await authService.verifyOTP(phone.trim(), otp.trim());
            login(res);
            navigate(roleRedirects[res.user.role] || '/patient/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid or expired OTP');
        } finally { setSubmitting(false); }
    };

    // ── Email Login ─────────────────────────────────────────────────────────────
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) { setError('Email and password are required'); return; }
        setSubmitting(true); setError('');
        try {
            const res = await authService.loginWithEmail(email, password, role);
            login(res);
            const user = res.user;
            if (user?.must_change_password && user.role === 'doctor') {
                navigate('/doctor/dashboard');
            } else {
                navigate(roleRedirects[user.role] || '/');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
        } finally { setSubmitting(false); }
    };

    // ── Phone + Password (admin/doctor legacy) ──────────────────────────────────
    const handlePhoneLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || !password) { setError('Phone and password are required'); return; }
        setSubmitting(true); setError('');
        try {
            const res = await authService.loginWithPhone(phone, password, role);
            login(res);
            const user = res.user;
            navigate(roleRedirects[user.role] || '/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
        } finally { setSubmitting(false); }
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
                    <div className="split-brand">
                        <FaPlusSquare /><span>MedicPulse</span>
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
                        <p>Sign in to your account to continue</p>
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

                    {/* ── Login Mode Toggle (only for patient) ── */}
                    {role === 'patient' && (
                        <div className="login-mode-toggle" style={{
                            display: 'flex', gap: '6px', marginBottom: '20px',
                            background: '#f1f5f9', borderRadius: '10px', padding: '4px'
                        }}>
                            <button
                                type="button"
                                onClick={() => { setMode('otp'); setOtpStep('enter_phone'); setError(''); }}
                                style={{
                                    flex: 1, padding: '8px', border: 'none', borderRadius: '7px',
                                    fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    background: mode === 'otp' ? activeRole.color : 'transparent',
                                    color: mode === 'otp' ? '#fff' : '#64748b',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <MdOutlineSms /> Phone + OTP
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMode('email'); setError(''); }}
                                style={{
                                    flex: 1, padding: '8px', border: 'none', borderRadius: '7px',
                                    fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    background: mode === 'email' ? activeRole.color : 'transparent',
                                    color: mode === 'email' ? '#fff' : '#64748b',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <FaEnvelope /> Email + Password
                            </button>
                        </div>
                    )}

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

                    {/* ═══════════════════════════════════════════
                        MODE: OTP — STEP 1: Send OTP
                    ════════════════════════════════════════════ */}
                    {mode === 'otp' && otpStep === 'enter_phone' && (
                        <form className="sf-form sf-form--compact" onSubmit={handleSendOTP}>
                            <Input
                                label="Phone Number"
                                type="tel"
                                placeholder="+91 9876543210"
                                required
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                icon={<FaPhone />}
                            />
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
                                We'll send a 6-digit code to this number.
                            </p>
                            <Button type="submit" loading={submitting}
                                style={{ background: `linear-gradient(135deg, ${activeRole.color}, #003d99)` }}>
                                <MdOutlineSms style={{ marginRight: '8px' }} /> Send OTP
                            </Button>
                            {activeRole.canRegister && (
                                <p className="sf-footer-text">
                                    Don't have an account? <Link to="/register">Register here</Link>
                                </p>
                            )}
                        </form>
                    )}

                    {/* ═══════════════════════════════════════════
                        MODE: OTP — STEP 2: Verify Code
                    ════════════════════════════════════════════ */}
                    {mode === 'otp' && otpStep === 'enter_otp' && (
                        <form className="sf-form sf-form--compact" onSubmit={handleVerifyOTP}>
                            <div style={{
                                background: '#eff6ff', border: '1px solid #bfdbfe',
                                borderRadius: '8px', padding: '12px', marginBottom: '16px',
                                fontSize: '0.85rem', color: '#1e40af'
                            }}>
                                📱 OTP sent to <strong>{phone}</strong>
                                <button type="button"
                                    onClick={() => { setOtpStep('enter_phone'); setOtp(''); }}
                                    style={{ float: 'right', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    Change
                                </button>
                            </div>
                            <Input
                                label="Enter OTP"
                                type="text"
                                placeholder="6-digit code"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                icon={<FaKey />}
                            />
                            <Button type="submit" loading={submitting}
                                style={{ background: `linear-gradient(135deg, ${activeRole.color}, #003d99)` }}>
                                <FaSignInAlt style={{ marginRight: '8px' }} /> Verify & Login
                            </Button>
                            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b', marginTop: '10px' }}>
                                Didn't receive it?{' '}
                                <button type="button" style={{ background: 'none', border: 'none', color: activeRole.color, cursor: 'pointer', fontWeight: 600 }}
                                    onClick={() => handleSendOTP({ preventDefault: () => {} } as any)}>
                                    Resend OTP
                                </button>
                            </p>
                        </form>
                    )}

                    {/* ═══════════════════════════════════════════
                        MODE: EMAIL + PASSWORD
                    ════════════════════════════════════════════ */}
                    {mode === 'email' && (
                        <form className="sf-form sf-form--compact" onSubmit={handleEmailLogin}>
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="your@email.com"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
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
                            {activeRole.canRegister && (
                                <p className="sf-footer-text">
                                    Don't have an account? <Link to="/register">Register here</Link>
                                </p>
                            )}
                        </form>
                    )}

                    {/* ═══════════════════════════════════════════
                        MODE: PHONE + PASSWORD (doctor/admin)
                        Shown when role is doctor/admin and user wants phone login
                    ════════════════════════════════════════════ */}
                    {mode === 'phone' && (
                        <form className="sf-form sf-form--compact" onSubmit={handlePhoneLogin}>
                            <Input
                                label="Phone Number"
                                type="tel"
                                placeholder="+91 9876543210"
                                required
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                icon={<FaPhone />}
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
                            <Button type="submit" loading={submitting}
                                style={{ background: `linear-gradient(135deg, ${activeRole.color}, #003d99)` }}>
                                <FaSignInAlt style={{ marginRight: '8px' }} /> Login
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
