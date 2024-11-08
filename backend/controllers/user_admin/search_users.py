# backend/controllers/user_admin/search_users_controller.py

from flask import Blueprint, request, jsonify
from models.user import User

search_users_bp = Blueprint('search_users', __name__, url_prefix='/api/user_admin')

class SearchUsersController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        search_users_bp.add_url_rule('/search_users', view_func=self.search_users, methods=['GET'])

    def search_users(self):
        """
        Endpoint to search user accounts based on a query matching username or email.
        Delegates processing to UserModel.
        """
        query = request.args.get('query')
        response, status_code = UserModel.search_users(query)
        return jsonify(response), status_code

# Instantiate the controller
search_users_controller = SearchUsersController()
