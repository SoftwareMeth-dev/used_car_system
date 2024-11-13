# backend/controllers/user_admin/create_profile_controller.py

from flask import Blueprint, request, jsonify
from models.profile import Profile

create_profile_bp = Blueprint('create_profile', __name__, url_prefix='/api')

class CreateProfileController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        create_profile_bp.add_url_rule('/create_profile', view_func=self.create_profile, methods=['POST'])

    def create_profile(self):
        """
        Endpoint to create a new user profile.
        Delegates processing to Profile.
        """
        data = request.get_json() 
        response, status_code = Profile.create_profile(data) 
        return jsonify(response), status_code

# Instantiate the controller to register routes
create_profile_controller = CreateProfileController()
