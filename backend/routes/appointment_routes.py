from flask import Blueprint, request
from backend.utils.helpers import format_response

appointment_bp = Blueprint('appointment', __name__)

@appointment_bp.route('/appointments', methods=['GET'])
def get_appointments():
    mock_appointments = [
        {"id": "APP001", "patient": "John Doe", "doctor": "Dr. Rao", "date": "2024-03-12", "time": "10:30 AM"}
    ]
    return format_response("Appointments retrieved successfully", data=mock_appointments)

@appointment_bp.route('/appointments', methods=['POST'])
def book_appointment():
    return format_response("Appointment booking endpoint placeholder")

@appointment_bp.route('/appointments/<id>/cancel', methods=['PUT'])
def cancel_appointment(id):
    return format_response(f"Appointment {id} cancellation endpoint placeholder")

@appointment_bp.route('/appointments/<id>/reschedule', methods=['PUT'])
def reschedule_appointment(id):
    return format_response(f"Appointment {id} rescheduling endpoint placeholder")
