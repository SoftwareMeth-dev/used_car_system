# backend/controllers/user_admin/view_profiles_controller.py

from flask import Blueprint, request, jsonify
from models.profile import Profile

view_profiles_bp = Blueprint('view_profiles', __name__, url_prefix='/api')

class ViewProfilesController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        view_profiles_bp.add_url_rule('/view_profiles', view_func=self.view_profiles, methods=['GET'])

    def view_profiles(self):
        """
        Endpoint to view user profiles with optional filtering by role.
        Delegates processing to Profile.
        """
        role = request.args.get('role')
        response, status_code = Profile.get_profiles(role)
        return jsonify(response), status_code

# Instantiate the controller
view_profiles_controller = ViewProfilesController()
