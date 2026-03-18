import React from 'react';
import '../styles/legal-pages.css';

const Terms: React.FC = () => {
    return (
        <div className="legal-page">
            <h1>Terms of Service</h1>

            <p>Welcome to MedicPulse. By using our platform, you agree to the following terms:</p>

            <h3>1. Use of Service</h3>
            <p>You agree to use the platform only for booking appointments and managing health records.</p>

            <h3>2. User Responsibility</h3>
            <p>You are responsible for maintaining the confidentiality of your account.</p>

            <h3>3. Privacy</h3>
            <p>Your data is securely stored and will not be shared without consent.</p>

            <h3>4. Modifications</h3>
            <p>We may update these terms at any time.</p>
        </div>
    );
};

export default Terms;
