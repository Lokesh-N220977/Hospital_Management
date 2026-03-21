import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlusSquare, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import api from '../../../services/api';

const PublicFooter: React.FC = () => {
    const [hospitalInfo, setHospitalInfo] = useState({
        hospital_name: "MedicPulse General",
        email: "support@medicpulse.com",
        mobile_number: "+91 99999 99999",
        address: "Medical District Healthcare Center"
    });

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const res = await api.get('/public/hospital-settings');
                if (res.data) setHospitalInfo(res.data);
            } catch (err) {
                console.error("Failed to load hospital info", err);
            }
        };
        fetchInfo();
    }, []);

    return (
        <footer className="footer">
            <div className="container footer-grid">
                <div className="footer-brand-col">
                    <div className="footer-logo">
                        <FaPlusSquare className="brand-icon" />
                        <span>{hospitalInfo.hospital_name || "MedicPulse"}</span>
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
                        <li><FaMapMarkerAlt /> {hospitalInfo.address}</li>
                        <li><FaPhoneAlt /> {hospitalInfo.mobile_number}</li>
                        <li><FaEnvelope /> {hospitalInfo.email}</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} {hospitalInfo.hospital_name}. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default PublicFooter;
