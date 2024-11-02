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
            print(f"Received login data: {data}")  # Debugging

            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                print("Username or password missing.")  # Debugging
                return jsonify(False), 400  # Bad Request

            user = User.get_user_by_username(username)
            print(f"Fetched User: {user}")  # Debugging

            if user:
                print(f"User found: {user.get('username')}, Suspended: {user.get('suspended')}")  # Debugging
                if user.get('password') == password:
                    print("Password matches.")  # Debugging
                else:
                    print("Password does not match.")  # Debugging
            else:
                print("User not found.")  # Debugging

            if user and user.get('password') == password and not user.get('suspended'):
                profile = Profile.get_profile_by_role(user.get('role'))
                print(f"Fetched Profile: {profile}")  # Debugging

                if profile:
                    login_data = {
                        "user": user,
                        "profile": profile
                    }
                    print("Login successful.")  # Debugging
                    return jsonify(login_data), 200
                else:
                    print("Profile data missing.")  # Debugging
                    return jsonify(False), 500  # Internal Server Error

            print("Invalid credentials or account suspended.")  # Debugging
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
