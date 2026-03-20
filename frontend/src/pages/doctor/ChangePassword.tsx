import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/doctor/DoctorLayout';
import { FaLock, FaKey, FaShieldAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ChangePassword: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
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
            setSuccess(true);
            // After success, we might want to logout or refresh user state
            setTimeout(() => {
                // If they were forced to change, they should probably log in again with new password
                // or we just redirect to dashboard if we updated the token/state.
                // For safety, let's just go to dashboard.
                navigate('/doctor/dashboard');
                window.location.reload(); // Refresh to update user state globally
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DoctorLayout>
            <div className="pd-page" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="pd-header">
                    <h1 className="pd-page-title">Change Password</h1>
                    <p className="pd-page-sub">Secure your account by updating your password.</p>
                </div>

                <div className="pd-card">
                    {success ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{ 
                                width: '70px', height: '70px', borderRadius: '50%', 
                                background: '#f0fdf4', color: '#16a34a', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}>
                                <FaCheckCircle size={40} />
                            </div>
                            <h2 style={{ marginBottom: '10px' }}>Password Updated!</h2>
                            <p style={{ color: '#64748b' }}>Your password has been changed successfully. Redirecting you to your dashboard...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="ad-form">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff9eb', color: '#d97706', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #fde68a' }}>
                                <FaShieldAlt size={20} />
                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                    If this is your first time logging in, you must change the temporary password provided by the administrator.
                                </span>
                            </div>

                            {error && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fee2e2' }}>
                                    <FaExclamationTriangle />
                                    <span style={{ fontSize: '0.9rem' }}>{error}</span>
                                </div>
                            )}

                            <div className="ad-field">
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>
                                    Old Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FaKey style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                                    <input
                                        type="password"
                                        className="ad-input"
                                        style={{ paddingLeft: '40px' }}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="ad-field" style={{ marginTop: '20px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>
                                    New Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FaLock style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                                    <input
                                        type="password"
                                        className="ad-input"
                                        style={{ paddingLeft: '40px' }}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new secure password"
                                        required
                                    />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '5px' }}>Must be at least 6 characters long.</p>
                            </div>

                            <div className="ad-field" style={{ marginTop: '20px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>
                                    Confirm New Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FaLock style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                                    <input
                                        type="password"
                                        className="ad-input"
                                        style={{ paddingLeft: '40px' }}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your new password"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '30px' }}>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="ad-btn-duo"
                                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </DoctorLayout>
    );
};

export default ChangePassword;
