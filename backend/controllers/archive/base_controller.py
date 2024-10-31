# backend/controllers/user_controller.py
from flask import Blueprint, request, jsonify
from models.user import User
from models.profile import Profile
import traceback

class UserController:
    def __init__(self, name, import_name, url_prefix):
        self.bp = Blueprint(name, import_name, url_prefix=url_prefix)
        self.register_common_routes()

    def register_common_routes(self):
        self.bp.route('/login', methods=['POST'])(self.login)
        self.bp.route('/logout', methods=['POST'])(self.logout)

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
                    return jsonify(False), 200  # Alternatively, use a different status code like 500

            # Invalid credentials or account suspended
            return jsonify(False), 401  # Unauthorized

        except Exception as e:
            print("Error occurred during login:", e)
            traceback.print_exc()
            return jsonify(False), 500  # Internal Server Error

    def logout(self):
        # Since there's no authentication mechanism, this is a placeholder
        return jsonify(True), 200  # Always succeeds
