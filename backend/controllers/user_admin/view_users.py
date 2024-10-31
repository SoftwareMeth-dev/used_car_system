# backend/controllers/user_admin/view_users_controller.py
from flask import Blueprint, request, jsonify
from models.user import User

view_users_bp = Blueprint('view_users', __name__, url_prefix='/api/user_admin')

class ViewUsersController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        view_users_bp.add_url_rule('/view_users', view_func=self.view_users, methods=['GET'])

    def view_users(self):
        """
        View User Accounts with optional filtering by username, email, role, and status.
        """
        username = request.args.get('username')
        email = request.args.get('email')
        role = request.args.get('role')
        status = request.args.get('status')  # Expected values: 'active' or 'suspended'

        # Fetch users based on the provided filters
        users = User.filter_users(username=username, email=email, role=role, status=status)

        return jsonify(users), 200

# Instantiate the controller
view_users_controller = ViewUsersController()
