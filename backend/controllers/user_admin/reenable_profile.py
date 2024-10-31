# backend/controllers/user_admin/reenable_profile_controller.py
from flask import Blueprint, jsonify
from models.profile import Profile

reenable_profile_bp = Blueprint('reenable_profile', __name__, url_prefix='/api/user_admin')

class ReenableProfileController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        reenable_profile_bp.add_url_rule('/reenable_profile/<role>', view_func=self.reenable_profile, methods=['PATCH'])

    def reenable_profile(self, role):
        """
        Re-enables a profile and all associated user accounts.
        """
        success = Profile.reenable_profile(role)
        if not success:
            return jsonify(False), 404
        return jsonify(success), 200

# Instantiate the controller
reenable_profile_controller = ReenableProfileController()
