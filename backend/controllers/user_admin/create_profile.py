# backend/controllers/user_admin/create_profile_controller.py
from flask import Blueprint, request, jsonify
from models.profile import Profile

create_profile_bp = Blueprint('create_profile', __name__, url_prefix='/api/user_admin')

class CreateProfileController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        create_profile_bp.add_url_rule('/create_profile', view_func=self.create_profile, methods=['POST'])

    def create_profile(self): 
        data = request.json
        # Basic validation
        required_fields = ["role", "rights"]
        if not all(field in data for field in required_fields):
            return jsonify(False), 400

        # Check if profile already exists
        existing_profile = Profile.get_profile_by_role(data.get('role'))
        if existing_profile:
            print(data.get('role'))
            return jsonify(False), 400

        # Create profile
        success = Profile.create_profile(data)
        return jsonify(success), 200 if success else 500

# Instantiate the controller
create_profile_controller = CreateProfileController()
