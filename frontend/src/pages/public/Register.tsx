import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash,
    FaPhone, FaVenusMars, FaArrowLeft, FaUserPlus,
    FaCalendarAlt, FaHeartbeat, FaShieldAlt, FaClock, FaCheckCircle
} from 'react-icons/fa';
import { Loader2 } from 'lucide-react';

import authService from '../../services/auth.service';
import logo from '../../assets/logo.png';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    
    // Email Verification State
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [otpError, setOtpError] = useState('');

    // Phone Verification State
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [showPhoneOtpInput, setShowPhoneOtpInput] = useState(false);
    const [otpPhone, setOtpPhone] = useState('');
    const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
    const [verifyingPhoneOtp, setVerifyingPhoneOtp] = useState(false);
    const [resendPhoneTimer, setResendPhoneTimer] = useState(0);
    const [otpPhoneError, setOtpPhoneError] = useState('');

    const validateIndianPhone = (p: string): boolean => {
        const cleaned = p.replace(/\s+/g, '');
        return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
    };

    // Resend Timer Logic
    React.useEffect(() => {
        let interval: any;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    React.useEffect(() => {
        let interval: any;
        if (resendPhoneTimer > 0) {
            interval = setInterval(() => {
                setResendPhoneTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendPhoneTimer]);

    const handleSendOtp = async () => {
        if (!email) {
            setError("Please enter an email address first");
            return;
        }
        setSendingOtp(true);
        setError('');
        try {
            await authService.sendEmailOTP(email);
            setShowOtpInput(true);
            setResendTimer(60);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to send verification code");
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            setOtpError("Enter 6-digit code");
            return;
        }
        setVerifyingOtp(true);
        setOtpError('');
        try {
            await authService.verifyEmailOTP(email, otp);
            setIsEmailVerified(true);
            setShowOtpInput(false);
        } catch (err: any) {
            setOtpError(err.response?.data?.detail || "Invalid code");
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleSendPhoneOtp = async () => {
        if (!phone) {
            setError("Please enter a phone number first");
            return;
        }
        if (!validateIndianPhone(phone)) {
            setError("Enter a valid Indian phone number");
            return;
        }
        setSendingPhoneOtp(true);
        setError('');
        try {
            await authService.sendPhoneVerifyOTP(phone);
            setShowPhoneOtpInput(true);
            setResendPhoneTimer(60);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to send phone verification code");
        } finally {
            setSendingPhoneOtp(false);
        }
    };

    const handleVerifyPhoneOtp = async () => {
        if (!otpPhone || otpPhone.length < 6) {
            setOtpPhoneError("Enter 6-digit code");
            return;
        }
        setVerifyingPhoneOtp(true);
        setOtpPhoneError('');
        try {
            await authService.verifyPhoneVerifyOTP(phone, otpPhone);
            setIsPhoneVerified(true);
            setShowPhoneOtpInput(false);
        } catch (err: any) {
            setOtpPhoneError(err.response?.data?.detail || "Invalid code");
        } finally {
            setVerifyingPhoneOtp(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!isEmailVerified) {
            setError("Please verify your email address first");
            return;
        }
        // If phone entered, it must be verified
        if (phone && !isPhoneVerified) {
            setError("Please verify your phone number first");
            return;
        }
        if (phone && !validateIndianPhone(phone)) {
            setError('Enter a valid 10-digit Indian phone number (e.g. 9876543210 or +919876543210)');
            return;
        }

        setError('');
        setSubmitting(true);

        try {
            await authService.register({ 
                name, 
                phone: phone || '', 
                email, 
                password, 
                gender, 
                age: parseInt(age) || undefined, 
                role: "patient" 
            });
            navigate('/login', { state: { message: "Account created! You can now login with your email or phone number." } });
        } catch (err: any) {
            let errorMessage = "Registration failed. Please try again.";
            const detail = err.response?.data?.detail;
            if (typeof detail === 'string') errorMessage = detail;
            else if (Array.isArray(detail)) errorMessage = detail.map((e: any) => e.msg).join(", ");
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="split-auth-page reg-page">

            {/* ── Left Panel ── */}
            <div className="split-left reg-left"
                style={{ background: 'linear-gradient(155deg, #001354 0%, #003d99 50%, #0060cc 100%)' }}>
                <div className="split-left-bg" />
                <div className="auth-shape auth-shape-1" />
                <div className="auth-shape auth-shape-2" />

                <div className="split-left-content">
                    <div className="brand">
                        <img src={logo} alt="MedicPulse Logo" />
                        MedicPulse
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

                    <form className="sf-form" onSubmit={handleSubmit}>
                        {error && (
                            <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '15px', border: '1px solid #fee2e2' }}>
                                {error}
                            </div>
                        )}


                        {/* Full Name */}
                        <div className="sf-field">
                            <label>Full Name</label>
                            <div className="sf-input-wrap">
                                <FaUser className="sf-icon" />
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="sf-field">
                            <label>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div className="sf-input-wrap" style={{ flex: 1, borderColor: isEmailVerified ? '#10b981' : undefined }}>
                                    <FaEnvelope className="sf-icon" />
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        required
                                        disabled={isEmailVerified || sendingOtp || showOtpInput}
                                        value={email}
                                        onChange={e => {
                                            setEmail(e.target.value);
                                            setIsEmailVerified(false);
                                        }}
                                        style={{ backgroundColor: isEmailVerified ? '#f0fdf4' : undefined }}
                                    />
                                    {isEmailVerified && <FaCheckCircle style={{ color: '#10b981', marginRight: '10px' }} />}
                                </div>
                                {!isEmailVerified && !showOtpInput && (
                                    <button 
                                        type="button" 
                                        onClick={handleSendOtp}
                                        disabled={sendingOtp || !email}
                                        style={{ 
                                            padding: '0 20px', 
                                            borderRadius: '8px', 
                                            background: '#3b82f6', 
                                            color: '#fff', 
                                            fontSize: '0.85rem', 
                                            fontWeight: 600,
                                            cursor: (sendingOtp || !email) ? 'not-allowed' : 'pointer',
                                            opacity: (sendingOtp || !email) ? 0.6 : 1,
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {sendingOtp ? <Loader2 size={16} className="animate-spin" /> : "Verify Email"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* OTP Input Section */}
                        {showOtpInput && !isEmailVerified && (
                            <div className="sf-field" style={{ animation: 'slideDown 0.3s ease-out', background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <label style={{ fontSize: '0.85rem', color: '#475569' }}>Enter 6-digit Verification Code</label>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                        style={{ 
                                            flex: 1, 
                                            padding: '10px', 
                                            borderRadius: '6px', 
                                            border: '1px solid #cbd5e1',
                                            textAlign: 'center',
                                            letterSpacing: '4px',
                                            fontSize: '1.1rem',
                                            fontWeight: 700
                                        }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleVerifyOtp}
                                        disabled={verifyingOtp || otp.length < 6}
                                        style={{ 
                                            padding: '0 20px', 
                                            borderRadius: '6px', 
                                            background: '#10b981', 
                                            color: '#fff', 
                                            fontWeight: 600,
                                            cursor: verifyingOtp ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {verifyingOtp ? <Loader2 size={16} className="animate-spin" /> : "Confirm"}
                                    </button>
                                </div>
                                {otpError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '5px' }}>{otpError}</p>}
                                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Didn't receive code?</span>
                                    <button 
                                        type="button"
                                        disabled={resendTimer > 0 || sendingOtp}
                                        onClick={handleSendOtp}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: resendTimer > 0 ? '#94a3b8' : '#3b82f6', 
                                            fontSize: '0.76rem', 
                                            fontWeight: 700,
                                            cursor: resendTimer > 0 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setShowOtpInput(false);
                                            setOtp('');
                                            setOtpError('');
                                        }}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: '#ef4444', 
                                            fontSize: '0.76rem', 
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Gender + Age */}
                        <div className="sf-row">
                            <div className="sf-field">
                                <label>Gender</label>
                                <div className="sf-input-wrap">
                                    <FaVenusMars className="sf-icon" />
                                    <select
                                        required
                                        value={gender}
                                        onChange={e => setGender(e.target.value)}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="sf-field">
                                <label>Age *</label>
                                <div className="sf-input-wrap">
                                    <FaCalendarAlt className="sf-icon" />
                                    <input
                                        type="number"
                                        placeholder="e.g. 25"
                                        required
                                        value={age}
                                        onChange={e => setAge(e.target.value)}
                                        min="0"
                                        max="120"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Phone Number — Optional but needs verification if entered */}
                        <div className="sf-field">
                            <label>Phone Number <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.78rem' }}>(optional — for phone login)</span></label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div className="sf-input-wrap" style={{ flex: 1, borderColor: isPhoneVerified ? '#10b981' : undefined }}>
                                    <FaPhone className="sf-icon" />
                                    <input
                                        type="tel"
                                        placeholder="9876543210 or +919876543210"
                                        disabled={isPhoneVerified || sendingPhoneOtp || showPhoneOtpInput}
                                        value={phone}
                                        onChange={e => {
                                            setPhone(e.target.value);
                                            setIsPhoneVerified(false);
                                        }}
                                        style={{ backgroundColor: isPhoneVerified ? '#f0fdf4' : undefined }}
                                    />
                                    {isPhoneVerified && <FaCheckCircle style={{ color: '#10b981', marginRight: '10px' }} />}
                                </div>
                                {phone && !isPhoneVerified && !showPhoneOtpInput && (
                                    <button 
                                        type="button" 
                                        onClick={handleSendPhoneOtp}
                                        disabled={sendingPhoneOtp || !validateIndianPhone(phone)}
                                        style={{ 
                                            padding: '0 20px', 
                                            borderRadius: '8px', 
                                            background: '#3b82f6', 
                                            color: '#fff', 
                                            fontSize: '0.85rem', 
                                            fontWeight: 600,
                                            cursor: (sendingPhoneOtp || !validateIndianPhone(phone)) ? 'not-allowed' : 'pointer',
                                            opacity: (sendingPhoneOtp || !validateIndianPhone(phone)) ? 0.6 : 1,
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {sendingPhoneOtp ? <Loader2 size={16} className="animate-spin" /> : "Verify Phone"}
                                    </button>
                                )}
                            </div>
                            {phone && !isPhoneVerified && !validateIndianPhone(phone) && (
                                <p style={{ color: '#dc2626', fontSize: '0.76rem', marginTop: '4px' }}>⚠ Enter a valid 10-digit Indian number</p>
                            )}
                        </div>

                        {/* Phone OTP Input Section */}
                        {showPhoneOtpInput && !isPhoneVerified && (
                            <div className="sf-field" style={{ animation: 'slideDown 0.3s ease-out', background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <label style={{ fontSize: '0.85rem', color: '#475569' }}>Enter 6-digit Phone Verification Code</label>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={otpPhone}
                                        onChange={e => setOtpPhone(e.target.value.replace(/\D/g, ''))}
                                        style={{ 
                                            flex: 1, 
                                            padding: '10px', 
                                            borderRadius: '6px', 
                                            border: '1px solid #cbd5e1',
                                            textAlign: 'center',
                                            letterSpacing: '4px',
                                            fontSize: '1.1rem',
                                            fontWeight: 700
                                        }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleVerifyPhoneOtp}
                                        disabled={verifyingPhoneOtp || otpPhone.length < 6}
                                        style={{ 
                                            padding: '0 20px', 
                                            borderRadius: '6px', 
                                            background: '#10b981', 
                                            color: '#fff', 
                                            fontWeight: 600,
                                            cursor: verifyingPhoneOtp ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {verifyingPhoneOtp ? <Loader2 size={16} className="animate-spin" /> : "Confirm"}
                                    </button>
                                </div>
                                {otpPhoneError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '5px' }}>{otpPhoneError}</p>}
                                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Didn't receive code?</span>
                                    <button 
                                        type="button"
                                        disabled={resendPhoneTimer > 0 || sendingPhoneOtp}
                                        onClick={handleSendPhoneOtp}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: resendPhoneTimer > 0 ? '#94a3b8' : '#3b82f6', 
                                            fontSize: '0.76rem', 
                                            fontWeight: 700,
                                            cursor: resendPhoneTimer > 0 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {resendPhoneTimer > 0 ? `Resend in ${resendPhoneTimer}s` : "Resend Code"}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setShowPhoneOtpInput(false);
                                            setOtpPhone('');
                                            setOtpPhoneError('');
                                        }}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: '#ef4444', 
                                            fontSize: '0.76rem', 
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Password + Confirm */}
                        <div className="sf-row">
                            <div className="sf-field">
                                <label>Password</label>
                                <div className="sf-input-wrap">
                                    <FaLock className="sf-icon" />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Min. 8 characters"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    <button type="button" className="sf-eye" onClick={() => setShowPass(p => !p)}>
                                        {showPass ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            <div className="sf-field">
                                <label>Confirm Password</label>
                                <div className="sf-input-wrap">
                                    <FaLock className="sf-icon" />
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Repeat password"
                                        required
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                    />
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

                        <button
                            type="submit"
                            className="sf-submit-btn reg-btn"
                            disabled={!agreed || submitting || !isEmailVerified || (phone !== '' && !isPhoneVerified)}
                            style={{
                                background: (!agreed || submitting || !isEmailVerified || (phone !== '' && !isPhoneVerified)) ? '#94a3b8' : 'linear-gradient(135deg, #003d99, #0060cc)',
                                cursor: (!agreed || submitting || !isEmailVerified || (phone !== '' && !isPhoneVerified)) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <FaUserPlus /> {submitting ? "Creating Account..." : "Create Account"}
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
