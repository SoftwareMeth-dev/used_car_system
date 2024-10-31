# backend/controllers/user_admin/reenable_user_controller.py
from flask import Blueprint, jsonify
from models.user import User

reenable_user_bp = Blueprint('reenable_user', __name__, url_prefix='/api/user_admin')

class ReenableUserController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        reenable_user_bp.add_url_rule('/reenable_user/<username>', view_func=self.reenable_user, methods=['PATCH'])

    def reenable_user(self, username):
        """
        Re-enable a suspended user account.
        """
        success = User.reenable_user(username)
        if not success:
            return jsonify(False), 404
        return jsonify(success), 200

# Instantiate the controller
reenable_user_controller = ReenableUserController()
