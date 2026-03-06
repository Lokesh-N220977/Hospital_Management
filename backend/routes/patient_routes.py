from flask import Blueprint, request
from backend.utils.helpers import format_response

patient_bp = Blueprint('patient', __name__)

@patient_bp.route('/patients', methods=['GET'])
def get_patients():
    mock_patients = [
        {"patient_id": "PAT001", "name": "John Doe", "email": "john@example.com"},
        {"patient_id": "PAT002", "name": "Jane Smith", "email": "jane@example.com"}
    ]
    return format_response("Patients retrieved successfully", data=mock_patients)

@patient_bp.route('/patients/<id>', methods=['GET'])
def get_patient(id):
    mock_patient = {"patient_id": id, "name": "John Doe", "email": "john@example.com"}
    return format_response("Patient details retrieved", data=mock_patient)

@patient_bp.route('/patients', methods=['POST'])
def add_patient():
    return format_response("Patient registration endpoint placeholder")

@patient_bp.route('/patients/<id>', methods=['PUT'])
def update_patient(id):
    return format_response(f"Update patient {id} endpoint placeholder")
