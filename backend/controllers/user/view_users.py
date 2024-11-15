# backend/controllers/user_admin/view_users_controller.py

from flask import Blueprint, request, jsonify
from models.user import User

view_users_bp = Blueprint('view_users', __name__, url_prefix='/api')

class ViewUsersController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        view_users_bp.add_url_rule('/view_users', view_func=self.view_users, methods=['GET'])

    def view_users(self):
        """
        Endpoint to view user accounts with optional filtering by username, email, role, and status.
        Delegates processing to User.
        """
        username = request.args.get('username')
        email = request.args.get('email')
        role = request.args.get('role')
        status = request.args.get('status')   
        response, status_code = User.filter_users(username=username, email=email, role=role, status=status)
        return jsonify(response), status_code
 
view_users_controller = ViewUsersController()
