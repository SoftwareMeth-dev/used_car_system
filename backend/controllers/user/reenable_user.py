# backend/controllers/user_admin/reenable_user_controller.py

from flask import Blueprint, jsonify
from models.user import User 
reenable_user_bp = Blueprint('reenable_user', __name__, url_prefix='/api')

class ReenableUserController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        reenable_user_bp.add_url_rule('/reenable_user/<username>', view_func=self.reenable_user, methods=['PATCH'])

    def reenable_user(self, username):
        """
        Endpoint to re-enable a suspended user account.
        Delegates processing to User.
        """
        response, status_code = User.reenable_user(username)
        return jsonify(response), status_code
 
reenable_user_controller = ReenableUserController()
