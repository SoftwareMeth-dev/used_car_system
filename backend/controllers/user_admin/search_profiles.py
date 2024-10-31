# backend/controllers/user_admin/search_profiles_controller.py
from flask import Blueprint, request, jsonify
from models.profile import Profile

search_profiles_bp = Blueprint('search_profiles', __name__, url_prefix='/api/user_admin')

class SearchProfilesController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        search_profiles_bp.add_url_rule('/search_profiles', view_func=self.search_profiles, methods=['GET'])

    def search_profiles(self):
        """
        Search User Profiles by a general query that matches role or rights.
        """
        query = request.args.get('query')
        if not query:
            return jsonify([]), 400

        profiles = Profile.search_profiles(query)
        return jsonify(profiles), 200

# Instantiate the controller
search_profiles_controller = SearchProfilesController()
