# backend/controllers/auth_controller.py

from flask import Blueprint, request, jsonify
from models.user import User
from models.profile import Profile

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

class AuthController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        auth_bp.add_url_rule('/login', view_func=self.login, methods=['POST'])
        auth_bp.add_url_rule('/logout', view_func=self.logout, methods=['POST'])
        
    def login(self):
        data = request.get_json() 
        return User.authenticate_user(data)
    
    def logout(self): 
        return jsonify({"message": "Logout successful."}), 200
 
auth_controller = AuthController()
