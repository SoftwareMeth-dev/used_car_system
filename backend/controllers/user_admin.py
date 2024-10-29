# # backend/controllers/user_admin.py
# from flask import Blueprint, request, jsonify
# from models.user import User
# from models.profile import Profile

# bp = Blueprint('user_admin', __name__)

# # Create User Account
# @bp.route('/create_user', methods=['POST'])
# def create_user():
#     data = request.json
#     User.create_user(data)
#     return jsonify({"message": "User created successfully"}), 201

# # View User Accounts
# @bp.route('/view_users', methods=['GET'])
# def view_users():
#     # Retrieve user based on the username
#     users = User.get_user_by_username(request.args.get('username'))

#     # Convert ObjectId to string if present
#     if users:
#         users['_id'] = str(users['_id'])  # Convert the '_id' ObjectId to a string

#     return jsonify(users), 200

# # Update User Account
# @bp.route('/update_user/<username>', methods=['PUT'])
# def update_user(username):
#     data = request.json
#     User.update_user(username, data)
#     return jsonify({"message": "User updated successfully"}), 200

# # Suspend User Account
# @bp.route('/suspend_user/<username>', methods=['PATCH'])
# def suspend_user(username):
#     User.suspend_user(username)
#     return jsonify({"message": "User suspended successfully"}), 200

# # Search User Accounts
# @bp.route('/search_users', methods=['GET'])
# def search_users():
#     query = request.args.get('query')
#     users = User.search_users(query)
#     users_list = list(users)
#     for user in users_list:
#         user['_id'] = str(user['_id'])
#     return jsonify(users_list), 200

# # Create User Profile
# @bp.route('/create_profile', methods=['POST'])
# def create_profile():
#     data = request.json
#     Profile.create_profile(data)
#     return jsonify({"message": "Profile created successfully"}), 201

# # View User Profiles
# @bp.route('/view_profiles', methods=['GET'])
# def view_profiles():
#     role = request.args.get('role')
#     profile = Profile.get_profile_by_role(role)
#     profile['_id'] = str(profile['_id'])
#     return jsonify(profile), 200

# # Update User Profile
# @bp.route('/update_profile/<role>', methods=['PUT'])
# def update_profile(role):
#     data = request.json
#     Profile.update_profile(role, data)
#     return jsonify({"message": "Profile updated successfully"}), 200

# # Suspend User Profile
# @bp.route('/suspend_profile/<role>', methods=['PATCH'])
# def suspend_profile(role):
#     Profile.suspend_profile(role)
#     return jsonify({"message": "Profile suspended successfully"}), 200

# # Search User Profiles
# @bp.route('/search_profiles', methods=['GET'])
# def search_profiles():
#     query = request.args.get('query')
#     profiles = Profile.search_profiles(query)
#     profiles_list = list(profiles)
#     for profile in profiles_list:
#         profile['_id'] = str(profile['_id'])
#     return jsonify(profiles_list), 200

# @bp.route('/login', methods=['POST'])
# def login():
#     try:
#         data = request.get_json()
#         username = data.get('username')
#         password = data.get('password')
        
#         # Assuming `User` and `Profile` are the models being queried
#         user = User.get_user_by_username(username)
#         if user and user.get('password') == password and not user.get('suspended'):
#             profile = Profile.get_profile_by_role(user.get('role'))
            
#             # Convert ObjectId to string if present in the response
#             response_data = {
#                 "message": "Login successful",
#                 "profile": {
#                     "role": profile.get('role'),
#                     "rights": profile.get('rights'),
#                     "user_id": str(user.get('_id'))  # Convert ObjectId to string
#                 }
#             }
            
#             return jsonify(response_data), 200
#         return jsonify({"message": "Invalid credentials or account suspended"}), 401

#     except Exception as e:
#         print("Error occurred during login:", e)
#         return jsonify({"message": "Internal server error"}), 500

# # Logout (No Authentication Mechanism)
# @bp.route('/logout', methods=['POST'])
# def logout():
#     return jsonify({"message": "Logout successful"}), 200


from flask import request, jsonify
from models.user import User
from models.profile import Profile
from controllers.base_controller import UserController

class AdminController(UserController):
    def __init__(self):
        super().__init__('user_admin', __name__, '/api/user_admin')
        self.register_admin_routes()

    def register_admin_routes(self):
        self.bp.route('/create_user', methods=['POST'])(self.create_user)
        self.bp.route('/view_users', methods=['GET'])(self.view_users)
        self.bp.route('/update_user/<username>', methods=['PUT'])(self.update_user)
        self.bp.route('/suspend_user/<username>', methods=['PATCH'])(self.suspend_user)
        self.bp.route('/search_users', methods=['GET'])(self.search_users)
        self.bp.route('/create_profile', methods=['POST'])(self.create_profile)
        self.bp.route('/view_profiles', methods=['GET'])(self.view_profiles)
        self.bp.route('/update_profile/<role>', methods=['PUT'])(self.update_profile)
        self.bp.route('/suspend_profile/<role>', methods=['PATCH'])(self.suspend_profile)
        self.bp.route('/search_profiles', methods=['GET'])(self.search_profiles)

    # Admin-specific methods
    def create_user(self):
        data = request.json
        User.create_user(data)
        return jsonify({"message": "User created successfully"}), 201

    def view_users(self):
        username = request.args.get('username')
        users = User.get_user_by_username(username)
        if users:
            users['_id'] = str(users['_id'])
        return jsonify(users), 200

    def update_user(self, username):
        data = request.json
        User.update_user(username, data)
        return jsonify({"message": "User updated successfully"}), 200

    def suspend_user(self, username):
        User.suspend_user(username)
        return jsonify({"message": "User suspended successfully"}), 200

    def search_users(self):
        query = request.args.get('query')
        users = User.search_users(query)
        users_list = list(users)
        for user in users_list:
            user['_id'] = str(user['_id'])
        return jsonify(users_list), 200

    def create_profile(self):
        data = request.json
        Profile.create_profile(data)
        return jsonify({"message": "Profile created successfully"}), 201

    def view_profiles(self):
        role = request.args.get('role')
        profile = Profile.get_profile_by_role(role)
        if profile:
            profile['_id'] = str(profile['_id'])
        return jsonify(profile), 200

    def update_profile(self, role):
        data = request.json
        Profile.update_profile(role, data)
        return jsonify({"message": "Profile updated successfully"}), 200

    def suspend_profile(self, role):
        Profile.suspend_profile(role)
        return jsonify({"message": "Profile suspended successfully"}), 200

    def search_profiles(self):
        query = request.args.get('query')
        profiles = Profile.search_profiles(query)
        profiles_list = list(profiles)
        for profile in profiles_list:
            profile['_id'] = str(profile['_id'])
        return jsonify(profiles_list), 200

# Instantiate the controller to create the blueprint
bp = AdminController().bp
