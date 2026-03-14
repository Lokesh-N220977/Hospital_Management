import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlusSquare, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const PublicFooter: React.FC = () => {
    return (
        <footer className="footer">
            <div className="container footer-grid">
                <div className="footer-brand-col">
                    <div className="footer-logo">
                        <FaPlusSquare className="brand-icon" />
                        <span>MedicPulse</span>
                    </div>
                    <p className="brand-desc">
                        A modern, intuitive, and secure platform bridging the gap between patients and healthcare providers. Making quality healthcare accessible to everyone.
                    </p>
                    <div className="social-links">
                        <a href="#"><FaFacebookF /></a>
                        <a href="#"><FaTwitter /></a>
                        <a href="#"><FaInstagram /></a>
                        <a href="#"><FaLinkedinIn /></a>
                    </div>
                </div>

                <div className="footer-links-col">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/doctors">Doctors</Link></li>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </ul>
                </div>

                <div className="footer-contact-col">
                    <h3>Contact Info</h3>
                    <ul className="contact-list">
                        <li><FaMapMarkerAlt /> Medical District Healthcare Center</li>
                        <li><FaPhoneAlt /> +91 XXXXX XXXXX</li>
                        <li><FaEnvelope /> support@medicpulse.com</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2026 MedicPulse. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default PublicFooter;
