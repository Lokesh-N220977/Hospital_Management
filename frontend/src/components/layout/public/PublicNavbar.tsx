import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlusSquare, FaBars, FaTimes } from 'react-icons/fa';

const PublicNavbar: React.FC = () => {
    const [open, setOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="container navbar-content">

                {/* Brand / Logo */}
                <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
                    <FaPlusSquare className="brand-icon" />
                    <span>MedicPulse</span>
                </Link>

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
                        <Link to="/"        className="nav-link" onClick={() => setOpen(false)}>Home</Link>
                        <Link to="/doctors" className="nav-link" onClick={() => setOpen(false)}>Doctors</Link>
                        <a href="/#about"   className="nav-link" onClick={() => setOpen(false)}>About</a>
                    </div>
                    <div className="nav-auth">
                        <Link to="/login"    className="btn-login"    onClick={() => setOpen(false)}>Login</Link>
                        <Link to="/register" className="btn-register" onClick={() => setOpen(false)}>Register</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;
