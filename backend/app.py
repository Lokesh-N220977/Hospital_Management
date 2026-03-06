import sys
import os
from flask import Flask, jsonify
from flask_cors import CORS

# Add the project root to sys.path to resolve 'backend' and 'database' packages
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.routes.auth_routes import auth_bp
from backend.routes.patient_routes import patient_bp
from backend.routes.doctor_routes import doctor_bp
from backend.routes.appointment_routes import appointment_bp
from backend.config.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS
    CORS(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patient_bp, url_prefix='/api')
    app.register_blueprint(doctor_bp, url_prefix='/api')
    app.register_blueprint(appointment_bp, url_prefix='/api')

    @app.route('/')
    def status():
        return jsonify({
            "status": "online",
            "message": "Hospital Appointment System Backend Running"
        })

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000)
