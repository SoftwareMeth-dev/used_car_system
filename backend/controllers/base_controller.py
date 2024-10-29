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

            user = User.get_user_by_username(username)
            if user and user.get('password') == password and not user.get('suspended'):
                profile = Profile.get_profile_by_role(user.get('role'))

                response_data = {
                    "message": "Login successful",
                    "profile": {
                        "role": profile.get('role'),
                        "rights": profile.get('rights'),
                        "user_id": str(user.get('_id'))
                    }
                }

                return jsonify(response_data), 200
            return jsonify({"message": "Invalid credentials or account suspended"}), 401

        except Exception as e:
            print("Error occurred during login:", e)
            traceback.print_exc()
            return jsonify({"message": "Internal server error"}), 500

    def logout(self):
        # Since there's no authentication mechanism, this is a placeholder
        return jsonify({"message": "Logout successful"}), 200
