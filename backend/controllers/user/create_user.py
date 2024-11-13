# backend/controllers/user_admin/create_user_controller.py

from flask import Blueprint, request, jsonify
from models.user import User

create_user_bp = Blueprint('create_user', __name__, url_prefix='/api')

class CreateUserController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        create_user_bp.add_url_rule('/create_user', view_func=self.create_user, methods=['POST'])

    def create_user(self):
        """
        Endpoint to create a new user account.
        Delegates processing to User.
        """
        data = request.get_json()
        response, status_code = User.create_user(data)
        return jsonify(response), status_code

# Instantiate the controller
create_user_controller = CreateUserController()
