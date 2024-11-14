# backend/controllers/user_controller.py

from flask import Blueprint, request, jsonify
from models.user import User
import logging

# Configure Logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

get_user_from_id_bp = Blueprint('user_bp', __name__, url_prefix='/api')

@get_user_from_id_bp.route('/get_user_id', methods=['GET'])
def get_user_id():
    """
    Endpoint to retrieve a user's ObjectId based on their username.
    Query Parameters:
        - userid (string): The username of the user.
    Returns:
        - JSON containing the user_id or an error message.
    """
    userid = request.args.get('userid') 
    response, status_code = User.get_user_by_id(userid)
    return jsonify(response), status_code
