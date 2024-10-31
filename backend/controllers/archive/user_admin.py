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
        self.bp.route('/reenable_profile/<role>', methods=['PATCH'])(self.reenable_profile)  # New route
        self.bp.route('/search_profiles', methods=['GET'])(self.search_profiles)

    # Admin-specific methods
    def create_user(self):
        data = request.json
        # Basic validation
        required_fields = ["username", "password", "email", "role"]
        if not all(field in data for field in required_fields):
            return jsonify(False), 400

        # Check if user already exists
        if User.get_user_by_username(data.get('username')):
            return jsonify(False), 400

        # Create user and return result as a boolean
        success = User.create_user(data)
        return jsonify(success), 200

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

        return jsonify(users), 200

    def update_user(self, username):
        data = request.json
        if not data:
            return jsonify(False), 400

        # Update user
        success = User.update_user(username, data)
        if not success:
            return jsonify(False), 404

        return jsonify(success), 200

    def suspend_user(self, username):
        success = User.suspend_user(username)
        if not success:
            return jsonify(False), 404
        return jsonify(success), 200

    def reenable_user(self, username):
        """
        Re-enable a suspended user account.
        """
        success = User.reenable_user(username)
        if not success:
            return jsonify(False), 404
        return jsonify(success), 200

    def search_users(self):
        """
        Search User Accounts by a general query that matches username or email.
        """
        query = request.args.get('query')
        if not query:
            return jsonify([]), 400

        users = User.search_users(query)
        return jsonify(users), 200

    def create_profile(self):
        data = request.json
        # Basic validation
        required_fields = ["role", "rights"]
        if not all(field in data for field in required_fields):
            return jsonify(False), 400

        # Check if profile already exists
        existing_profile = Profile.get_profile_by_role(data.get('role'))
        if existing_profile:
            return jsonify(False), 400

        # Create profile
        success = Profile.create_profile(data)
        return jsonify(success), 200

    def view_profiles(self):
        """
        View User Profiles with optional filtering by role.
        """
        role = request.args.get('role')

        # Fetch profiles based on the provided role
        profiles = Profile.get_profile_by_role(role)

        return jsonify(profiles), 200

    def update_profile(self, role):
        data = request.json
        if not data:
            return jsonify(False), 400

        # Update profile
        success = Profile.update_profile(role, data)
        if not success:
            return jsonify(False), 404

        return jsonify(success), 200

    def suspend_profile(self, role):
        """
        Suspends a profile and all associated user accounts.
        """
        success = Profile.suspend_profile(role)
        if not success:
            return jsonify(False), 404
        return jsonify(success), 200

    def reenable_profile(self, role):
        """
        Re-enables a profile and all associated user accounts.
        """
        success = Profile.reenable_profile(role)
        if not success:
            return jsonify(False), 404
        return jsonify(success), 200

    def search_profiles(self):
        """
        Search User Profiles by a general query that matches role or rights.
        """
        query = request.args.get('query')
        if not query:
            return jsonify([]), 400

        profiles = Profile.search_profiles(query)
        return jsonify(profiles), 200

# Instantiate the controller to create the blueprint
admin_controller = AdminController()
bp = admin_controller.bp
