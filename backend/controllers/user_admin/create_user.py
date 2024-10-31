# backend/controllers/user_admin/create_user_controller.py
from flask import Blueprint, request, jsonify
from models.user import User

create_user_bp = Blueprint('create_user', __name__, url_prefix='/api/user_admin')

class CreateUserController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        create_user_bp.add_url_rule('/create_user', view_func=self.create_user, methods=['POST'])

    def create_user(self):
        data = request.json
        # Basic validation
        required_fields = ["username", "password", "email", "role"]
        if not all(field in data for field in required_fields):
            return jsonify(False), 400

        # Check if user already exists
        if User.get_user_by_username(data.get('username')):
            return jsonify(False), 400

        # Create user and return result as a boolean
        success = User.create_user(data)
        return jsonify(success), 200 if success else 500

# Instantiate the controller
create_user_controller = CreateUserController()
