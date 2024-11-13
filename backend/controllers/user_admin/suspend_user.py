# backend/controllers/user_admin/suspend_user_controller.py

from flask import Blueprint, jsonify
from models.user import User

suspend_user_bp = Blueprint('suspend_user', __name__, url_prefix='/api')

class SuspendUserController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        suspend_user_bp.add_url_rule('/suspend_user/<username>', view_func=self.suspend_user, methods=['PATCH'])

    def suspend_user(self, username):
        """
        Endpoint to suspend a user account.
        Delegates processing to User.
        """
        response, status_code = User.suspend_user(username)
        return jsonify(response), status_code

# Instantiate the controller
suspend_user_controller = SuspendUserController()
