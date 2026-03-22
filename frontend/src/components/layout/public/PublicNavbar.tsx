import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

import logo from '../../../assets/logo.png';

const PublicNavbar: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar pub-navbar ${scrolled ? 'scrolled' : 'not-scrolled'}`}>
            <div className="container navbar-content">

                {/* Brand / Logo */}
                <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
                    <img src={logo} alt="MedicPulse Logo" />
                    <span>MedicPulse</span>
                </Link>

                {/* Mobile Overlay */}
                {open && <div className="ps-overlay ps-overlay-open" onClick={() => setOpen(false)} />}

                {/* Hamburger — mobile only */}
                <button
                    className={`hamburger${open ? ' is-open' : ''}`}
                    onClick={() => setOpen(o => !o)}
                    aria-label="Toggle navigation"
                >
                    {open ? <FaTimes /> : <FaBars />}
                </button>

                {/* Nav links + auth — grouped right */}
                <div className={`nav-right${open ? ' nav-open' : ''}`}>
                    <div className="nav-menu">
                        <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setOpen(false)} end>Home</NavLink>
                        <NavLink to="/doctors" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}>Doctors</NavLink>
                        <a href="/#about" className="nav-link" onClick={() => setOpen(false)}>About</a>
                    </div>
                    <div className="nav-auth">
                        <Link to="/login" className="btn-login" onClick={() => setOpen(false)}>Login</Link>
                        <Link to="/register" className="btn-register" onClick={() => setOpen(false)}>Register</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;
