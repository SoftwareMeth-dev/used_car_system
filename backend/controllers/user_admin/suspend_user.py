# backend/controllers/user_admin/suspend_user_controller.py
from flask import Blueprint, jsonify
from models.user import User

suspend_user_bp = Blueprint('suspend_user', __name__, url_prefix='/api/user_admin')

class SuspendUserController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        suspend_user_bp.add_url_rule('/suspend_user/<username>', view_func=self.suspend_user, methods=['PATCH'])

    def suspend_user(self, username):
        success = User.suspend_user(username)
        if not success:
            return jsonify(False), 404
        return jsonify(success), 200

# Instantiate the controller
suspend_user_controller = SuspendUserController()
