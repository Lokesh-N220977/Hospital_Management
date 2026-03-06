from flask import jsonify

def format_response(message, data=None, status=200):
    """
    Standardize JSON responses for the application.
    """
    response = {
        "message": message,
        "success": status < 400
    }
    if data is not None:
        response["data"] = data
        
    return jsonify(response), status
