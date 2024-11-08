# backend/controllers/user_admin/update_user_controller.py

from flask import Blueprint, request, jsonify
from models.user import User

update_user_bp = Blueprint('update_user', __name__, url_prefix='/api/user_admin')

class UpdateUserController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        update_user_bp.add_url_rule('/update_user/<username>', view_func=self.update_user, methods=['PUT'])

    def update_user(self, username):
        """
        Endpoint to update a user account based on username.
        Delegates processing to UserModel.
        """
        data = request.get_json()
        response, status_code = UserModel.update_user(username, data)
        return jsonify(response), status_code

# Instantiate the controller
update_user_controller = UpdateUserController()
