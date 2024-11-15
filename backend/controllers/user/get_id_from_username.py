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

get_id_from_username_bp = Blueprint('get_id_from_username', __name__, url_prefix='/api')

@get_id_from_username_bp.route('/get_id_from_username', methods=['GET'])
def get_user_id():  
    username = request.args.get('username')   
    response, status_code = User.get_user_id_from_username(username)

    return jsonify(response), status_code