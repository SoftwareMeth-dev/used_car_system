# backend/controllers/user_admin/search_profiles_controller.py

from flask import Blueprint, request, jsonify
from models.profile import Profile

search_profiles_bp = Blueprint('search_profiles', __name__, url_prefix='/api')

class SearchProfilesController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        search_profiles_bp.add_url_rule('/search_profiles', view_func=self.search_profiles, methods=['GET'])

    def search_profiles(self):
        """
        Endpoint to search user profiles based on a query matching role or rights.
        Delegates processing to Profile.
        """
        query = request.args.get('query')
        response, status_code = Profile.search_profiles(query)
        return jsonify(response), status_code
 
search_profiles_controller = SearchProfilesController()
