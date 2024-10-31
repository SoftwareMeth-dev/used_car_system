# backend/controllers/user_admin/suspend_profile_controller.py
from flask import Blueprint, jsonify
from models.profile import Profile

suspend_profile_bp = Blueprint('suspend_profile', __name__, url_prefix='/api/user_admin')

class SuspendProfileController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        suspend_profile_bp.add_url_rule('/suspend_profile/<role>', view_func=self.suspend_profile, methods=['PATCH'])

    def suspend_profile(self, role):
        """
        Suspends a profile and all associated user accounts.
        """
        success = Profile.suspend_profile(role)
        if not success:
            return jsonify(False), 404
        return jsonify(success), 200

# Instantiate the controller
suspend_profile_controller = SuspendProfileController()
