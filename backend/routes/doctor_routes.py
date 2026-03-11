from flask import Blueprint, request
from backend.utils.helpers import format_response
from backend.models.doctor_model import get_all_doctors, add_doctor as add_doctor_db, update_doctor as update_doctor_db


doctor_bp = Blueprint('doctor', __name__)

@doctor_bp.route('/doctors', methods=['GET'])

def get_doctors():
    doctors = get_all_doctors()
    return format_response("Doctors retrieved successfully", data=doctors)


@doctor_bp.route('/doctors', methods=['POST'])
def add_doctor():
    data = request.json
    doctor = add_doctor_db(data)
    return format_response("Doctor added successfully", data=doctor)

@doctor_bp.route('/doctors/<id>', methods=['PUT'])
def update_doctor(id):
    data = request.json
    update_doctor_db(id, data)
    return format_response(f"Doctor {id} updated successfully")


@doctor_bp.route('/doctors/<id>', methods=['DELETE'])
def delete_doctor(id):
    return format_response(f"Delete doctor {id} endpoint placeholder")
