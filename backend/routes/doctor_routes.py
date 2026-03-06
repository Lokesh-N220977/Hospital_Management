from flask import Blueprint, request
from backend.utils.helpers import format_response

doctor_bp = Blueprint('doctor', __name__)

@doctor_bp.route('/doctors', methods=['GET'])
def get_doctors():
    mock_doctors = [
        {"doctor_id": "DOC001", "name": "Dr. Rao", "specialization": "Cardiology"},
        {"doctor_id": "DOC002", "name": "Dr. Smith", "specialization": "General Medicine"}
    ]
    return format_response("Doctors retrieved successfully", data=mock_doctors)

@doctor_bp.route('/doctors', methods=['POST'])
def add_doctor():
    return format_response("Doctor addition endpoint placeholder")

@doctor_bp.route('/doctors/<id>', methods=['PUT'])
def update_doctor(id):
    return format_response(f"Update doctor {id} endpoint placeholder")

@doctor_bp.route('/doctors/<id>', methods=['DELETE'])
def delete_doctor(id):
    return format_response(f"Delete doctor {id} endpoint placeholder")
