# backend/controllers/user_admin/reenable_profile_controller.py

from flask import Blueprint, jsonify
from models.profile import Profile

reenable_profile_bp = Blueprint('reenable_profile', __name__, url_prefix='/api')

class ReenableProfileController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        reenable_profile_bp.add_url_rule('/reenable_profile/<role>', view_func=self.reenable_profile, methods=['PATCH'])

    def reenable_profile(self, role):
        """
        Endpoint to re-enable a user profile and associated user accounts.
        Delegates processing to Profile.
        """
        response, status_code = Profile.reenable_profile(role)
        return jsonify(response), status_code

# Instantiate the controller
reenable_profile_controller = ReenableProfileController()
