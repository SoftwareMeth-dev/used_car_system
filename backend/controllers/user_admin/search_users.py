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
        Search User Accounts by a general query that matches username or email.
        """
        query = request.args.get('query')
        if not query:
            return jsonify([]), 400

        users = User.search_users(query)
        return jsonify(users), 200

# Instantiate the controller
search_users_controller = SearchUsersController()
