import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaKey, FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaPlusSquare } from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DoctorLayout from '../../components/layout/doctor/DoctorLayout';

const ChangePassword: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            await api.put('/auth/change-password', {
                old_password: oldPassword,
                new_password: newPassword
            });
            
            // Clear session and logout
            setSuccess(true);
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2500);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DoctorLayout>
            <div className="force-change-overlay" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                zIndex: 1000,
                animation: 'fadeIn 0.4s ease-out'
            }}>
                <div className="cp-card" style={{ 
                    maxWidth: '480px', 
                    width: '100%', 
                    background: '#fff', 
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                    padding: success ? '60px 40px' : '40px',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative Top Bar */}
                    <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        height: '6px', 
                        background: 'linear-gradient(90deg, #3b82f6, #6366f1)' 
                    }} />

                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '12px', 
                            color: '#3b82f6', 
                            marginBottom: '20px',
                            background: '#eff6ff',
                            width: 'fit-content',
                            margin: '0 auto 20px',
                            padding: '10px 20px',
                            borderRadius: '12px'
                        }}>
                            <FaPlusSquare size={28} />
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.5px' }}>MedicPulse</span>
                        </div>
                        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px', letterSpacing: '-0.025em' }}>
                            {success ? 'Account Secured' : 'Update Password'}
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.5 }}>
                            {success ? 'Your security credentials have been updated.' : 'For your protection, please replace your temporary password.'}
                        </p>
                    </div>

                    {success ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                                width: '90px', height: '90px', borderRadius: '50%', 
                                background: '#ecfdf5', color: '#10b981', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 24px',
                                animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}>
                                <FaCheckCircle size={48} />
                            </div>
                            <p style={{ color: '#475569', fontSize: '1.1rem', fontWeight: 500 }}>Redirecting you to log in with your new credentials...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                gap: '12px', 
                                background: '#fffbeb', 
                                color: '#92400e', 
                                padding: '16px', 
                                borderRadius: '14px', 
                                border: '1px solid #fde68a', 
                                fontSize: '0.9rem',
                                lineHeight: 1.5
                            }}>
                                <FaShieldAlt size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span><strong>Security Notice:</strong> Your administrator has requested a password update to ensure your medical records remain private.</span>
                            </div>

                            {error && (
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px', 
                                    background: '#fef2f2', 
                                    color: '#b91c1c', 
                                    padding: '14px', 
                                    borderRadius: '12px', 
                                    border: '1px solid #fee2e2', 
                                    fontSize: '0.875rem' 
                                }}>
                                    <FaExclamationTriangle style={{ flexShrink: 0 }} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Current Temporary Password</label>
                                <div style={{ position: 'relative' }}>
                                    <FaKey style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type="password"
                                        style={{ 
                                            width: '100%',
                                            padding: '14px 14px 14px 48px', 
                                            borderRadius: '12px', 
                                            border: '1.5px solid #e2e8f0',
                                            fontSize: '1rem',
                                            transition: 'all 0.2s',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>New Secure Password</label>
                                <div style={{ position: 'relative' }}>
                                    <FaLock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type="password"
                                        style={{ 
                                            width: '100%',
                                            padding: '14px 14px 14px 48px', 
                                            borderRadius: '12px', 
                                            border: '1.5px solid #e2e8f0',
                                            fontSize: '1rem',
                                            transition: 'all 0.2s',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimum 6 characters"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Confirm New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <FaLock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type="password"
                                        style={{ 
                                            width: '100%',
                                            padding: '14px 14px 14px 48px', 
                                            borderRadius: '12px', 
                                            border: '1.5px solid #e2e8f0',
                                            fontSize: '1rem',
                                            transition: 'all 0.2s',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                style={{ 
                                    width: '100%', 
                                    padding: '16px', 
                                    marginTop: '8px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                {loading ? 'Updating Credentials...' : 'Securing Account'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .cp-card:hover { transform: translateY(-2px); transition: transform 0.3s ease; }
            `}</style>
        </DoctorLayout>
    );
};

export default ChangePassword;
