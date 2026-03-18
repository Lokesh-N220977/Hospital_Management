import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/legal-pages.css';

const Terms: React.FC = () => {
  return (
    <div className="legal-page-wrapper">
      <div className="legal-page-card">
        <Link to="/register" className="legal-back-btn">&larr; Back to Register</Link>
        <h1>Terms of Service</h1>

        <p>Welcome to MedicPulse. By using our platform, you agree to the following terms:</p>

        <h3>1. Use of Service</h3>
        <p>Use the platform only for booking appointments and managing health records responsibly.</p>

        <h3>2. User Responsibility</h3>
        <p>Keep your account details confidential and secure. Avoid sharing passwords.</p>

        <h3>3. Privacy</h3>
        <p>All personal and health data is encrypted and stored securely.</p>

        <h3>4. Modifications</h3>
        <p>We may update these terms periodically. Users will be notified of significant changes.</p>
      </div>
    </div>
  );
};

export default Terms;


