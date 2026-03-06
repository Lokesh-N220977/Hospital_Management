from flask import Blueprint, request
from backend.utils.helpers import format_response

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    return format_response("Login endpoint placeholder")

@auth_bp.route('/register', methods=['POST'])
def register():
    return format_response("Register endpoint placeholder")

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return format_response("Logout endpoint placeholder")
