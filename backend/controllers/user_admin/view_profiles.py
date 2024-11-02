# backend/controllers/user_admin/view_profiles_controller.py
from flask import Blueprint, request, jsonify
from models.profile import Profile

view_profiles_bp = Blueprint('view_profiles', __name__, url_prefix='/api/user_admin')

class ViewProfilesController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        view_profiles_bp.add_url_rule('/view_profiles', view_func=self.view_profiles, methods=['GET'])

    def view_profiles(self):
        """
        View User Profiles with optional filtering by role.
        """
        role = request.args.get('role')

        # Fetch profiles based on the provided role
        profiles = Profile.get_profile_by_role(role) if role else Profile.get_profile_by_role() 

        return jsonify(profiles), 200

# Instantiate the controller
view_profiles_controller = ViewProfilesController()
