# backend/controllers/auth_controller.py
from flask import Blueprint, request, jsonify
from models.user import User
from models.profile import Profile
import traceback

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

class AuthController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        auth_bp.add_url_rule('/login', view_func=self.login, methods=['POST'])
        auth_bp.add_url_rule('/logout', view_func=self.logout, methods=['POST'])

    def login(self):
        try:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return jsonify(False), 400  # Bad Request if missing credentials

            user = User.get_user_by_username(username)
            if user and user.get('password') == password and not user.get('suspended'):
                profile = Profile.get_profile_by_role(user.get('role'))

                if profile:
                    # Combine user data and profile data
                    login_data = {
                        "user": user,
                        "profile": profile
                    }
                    return jsonify(login_data), 200
                else:
                    # Profile data is missing
                    return jsonify(False), 500  # Internal Server Error

            # Invalid credentials or account suspended
            return jsonify(False), 401  # Unauthorized

        except Exception as e:
            print("Error occurred during login:", e)
            traceback.print_exc()
            return jsonify(False), 500  # Internal Server Error

    def logout(self):
        # Placeholder for logout functionality
        return jsonify(True), 200  # Always succeeds

# Instantiate the controller to register routes
auth_controller = AuthController()
