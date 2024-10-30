# backend/controllers/user_admin.py
from flask import Blueprint, request, jsonify
from models.user import User
from models.profile import Profile
from controllers.base_controller import UserController

bp = Blueprint('user_admin', __name__, url_prefix='/api/user_admin')

class AdminController(UserController):
    def __init__(self):
        super().__init__('user_admin', __name__, '/api/user_admin')
        self.register_admin_routes()

    def register_admin_routes(self):
        self.bp.route('/create_user', methods=['POST'])(self.create_user)
        self.bp.route('/view_users', methods=['GET'])(self.view_users)
        self.bp.route('/update_user/<username>', methods=['PUT'])(self.update_user)
        self.bp.route('/suspend_user/<username>', methods=['PATCH'])(self.suspend_user)
        self.bp.route('/reenable_user/<username>', methods=['PATCH'])(self.reenable_user)  # New route
        self.bp.route('/search_users', methods=['GET'])(self.search_users)
        self.bp.route('/create_profile', methods=['POST'])(self.create_profile)
        self.bp.route('/view_profiles', methods=['GET'])(self.view_profiles)
        self.bp.route('/update_profile/<role>', methods=['PUT'])(self.update_profile)
        self.bp.route('/suspend_profile/<role>', methods=['PATCH'])(self.suspend_profile)
        self.bp.route('/search_profiles', methods=['GET'])(self.search_profiles)

    # Admin-specific methods
    def create_user(self):
        data = request.json
        # Basic validation
        if not all(k in data for k in ("username", "password", "email", "role")):
            return jsonify({"message": "Missing required fields"}), 400

        # Check if user already exists
        if User.get_user_by_username(data.get('username')):
            return jsonify({"message": "Username already exists"}), 400

        User.create_user(data)
        return jsonify({"message": "User created successfully"}), 201

    def view_users(self):
        """
        View User Accounts with optional filtering by username, email, role, and status.
        """
        username = request.args.get('username')
        email = request.args.get('email')
        role = request.args.get('role')
        status = request.args.get('status')  # Expected values: 'active' or 'suspended'

        # Fetch users based on the provided filters
        users = User.filter_users(username=username, email=email, role=role, status=status)

        # Convert ObjectId to string for each user
        for user in users:
            user['_id'] = str(user['_id'])

        return jsonify(users), 200

    def update_user(self, username):
        data = request.json
        if not data:
            return jsonify({"message": "No data provided for update"}), 400

        # Update user
        result = User.update_user(username, data)
        if result.matched_count == 0:
            return jsonify({"message": "User not found"}), 404

        return jsonify({"message": "User updated successfully"}), 200

    def suspend_user(self, username):
        result = User.suspend_user(username)
        if result.matched_count == 0:
            return jsonify({"message": "User not found"}), 404
        return jsonify({"message": "User suspended successfully"}), 200

    def reenable_user(self, username):
        """
        Re-enable a suspended user account.
        """
        result = User.reenable_user(username)
        if result.matched_count == 0:
            return jsonify({"message": "User not found"}), 404
        return jsonify({"message": "User re-enabled successfully"}), 200

    def search_users(self):
        """
        Search User Accounts by a general query that matches username or email.
        """
        query = request.args.get('query')
        if not query:
            return jsonify({"message": "Query parameter is required"}), 400

        users_cursor = User.search_users(query)
        users_list = list(users_cursor)
        for user in users_list:
            user['_id'] = str(user['_id'])
        return jsonify(users_list), 200

    def create_profile(self):
        data = request.json
        # Basic validation
        if not all(k in data for k in ("role", "rights")):
            return jsonify({"message": "Missing required fields"}), 400

        # Check if profile already exists
        existing_profile = Profile.get_profile_by_role(data.get('role'))
        if existing_profile:
            return jsonify({"message": "Profile with this role already exists"}), 400

        Profile.create_profile(data)
        return jsonify({"message": "Profile created successfully"}), 201

    def view_profiles(self):
        """
        View User Profiles with optional filtering by role.
        """
        role = request.args.get('role')

        # Fetch profiles based on the provided role
        profiles = Profile.get_profile_by_role(role)

        # Check if profiles is a list (all profiles) or a single profile document
        if isinstance(profiles, list):  # If all profiles are returned
            for profile in profiles:
                profile['_id'] = str(profile['_id'])
        elif profiles:  # If a single profile document is returned
            profiles['_id'] = str(profiles['_id'])

        return jsonify(profiles), 200

    def update_profile(self, role):
        data = request.json
        if not data:
            return jsonify({"message": "No data provided for update"}), 400

        # Update profile
        result = Profile.update_profile(role, data)
        if result.matched_count == 0:
            return jsonify({"message": "Profile not found"}), 404

        return jsonify({"message": "Profile updated successfully"}), 200

    def suspend_profile(self, role):
        result = Profile.suspend_profile(role)
        if result.matched_count == 0:
            return jsonify({"message": "Profile not found"}), 404
        return jsonify({"message": "Profile suspended successfully"}), 200

    def search_profiles(self):
        """
        Search User Profiles by a general query that matches role or rights.
        """
        query = request.args.get('query')
        if not query:
            return jsonify({"message": "Query parameter is required"}), 400

        profiles_cursor = Profile.search_profiles(query)
        profiles_list = list(profiles_cursor)
        for profile in profiles_list:
            profile['_id'] = str(profile['_id'])
        return jsonify(profiles_list), 200

# Instantiate the controller to create the blueprint
admin_controller = AdminController()
bp = admin_controller.bp
