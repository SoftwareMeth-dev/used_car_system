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
        data = request.json
        if not data:
            return jsonify(False), 400

        # Update user
        success = User.update_user(username, data)
        if not success:
            return jsonify(False), 404

        return jsonify(success), 200

# Instantiate the controller
update_user_controller = UpdateUserController()
