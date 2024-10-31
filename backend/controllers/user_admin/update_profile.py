# backend/controllers/user_admin/update_profile_controller.py
from flask import Blueprint, request, jsonify
from models.profile import Profile

update_profile_bp = Blueprint('update_profile', __name__, url_prefix='/api/user_admin')

class UpdateProfileController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        update_profile_bp.add_url_rule('/update_profile/<role>', view_func=self.update_profile, methods=['PUT'])

    def update_profile(self, role):
        data = request.json
        if not data:
            return jsonify(False), 400

        # Update profile
        success = Profile.update_profile(role, data)
        if not success:
            return jsonify(False), 404

        return jsonify(success), 200

# Instantiate the controller
update_profile_controller = UpdateProfileController()
