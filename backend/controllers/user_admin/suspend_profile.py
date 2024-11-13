# backend/controllers/user_admin/suspend_profile_controller.py

from flask import Blueprint, jsonify
from models.profile import Profile

suspend_profile_bp = Blueprint('suspend_profile', __name__, url_prefix='/api')

class SuspendProfileController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        suspend_profile_bp.add_url_rule('/suspend_profile/<role>', view_func=self.suspend_profile, methods=['PATCH'])

    def suspend_profile(self, role):
        """
        Endpoint to suspend a user profile and associated user accounts.
        Delegates processing to Profile.
        """
        response, status_code = Profile.suspend_profile(role)
        return jsonify(response), status_code

# Instantiate the controller
suspend_profile_controller = SuspendProfileController()
