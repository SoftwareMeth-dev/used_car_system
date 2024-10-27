# backend/controllers/user_admin.py
from flask import Blueprint, request, jsonify
from models.user import User
from models.profile import Profile

bp = Blueprint('user_admin', __name__)

# Create User Account
@bp.route('/create_user', methods=['POST'])
def create_user():
    data = request.json
    User.create_user(data)
    return jsonify({"message": "User created successfully"}), 201

# View User Accounts
@bp.route('/view_users', methods=['GET'])
def view_users():
    # Retrieve user based on the username
    users = User.get_user_by_username(request.args.get('username'))

    # Convert ObjectId to string if present
    if users:
        users['_id'] = str(users['_id'])  # Convert the '_id' ObjectId to a string

    return jsonify(users), 200

# Update User Account
@bp.route('/update_user/<username>', methods=['PUT'])
def update_user(username):
    data = request.json
    User.update_user(username, data)
    return jsonify({"message": "User updated successfully"}), 200

# Suspend User Account
@bp.route('/suspend_user/<username>', methods=['PATCH'])
def suspend_user(username):
    User.suspend_user(username)
    return jsonify({"message": "User suspended successfully"}), 200

# Search User Accounts
@bp.route('/search_users', methods=['GET'])
def search_users():
    query = request.args.get('query')
    users = User.search_users(query)
    users_list = list(users)
    for user in users_list:
        user['_id'] = str(user['_id'])
    return jsonify(users_list), 200

# Create User Profile
@bp.route('/create_profile', methods=['POST'])
def create_profile():
    data = request.json
    Profile.create_profile(data)
    return jsonify({"message": "Profile created successfully"}), 201

# View User Profiles
@bp.route('/view_profiles', methods=['GET'])
def view_profiles():
    role = request.args.get('role')
    profile = Profile.get_profile_by_role(role)
    profile['_id'] = str(profile['_id'])
    return jsonify(profile), 200

# Update User Profile
@bp.route('/update_profile/<role>', methods=['PUT'])
def update_profile(role):
    data = request.json
    Profile.update_profile(role, data)
    return jsonify({"message": "Profile updated successfully"}), 200

# Suspend User Profile
@bp.route('/suspend_profile/<role>', methods=['PATCH'])
def suspend_profile(role):
    Profile.suspend_profile(role)
    return jsonify({"message": "Profile suspended successfully"}), 200

# Search User Profiles
@bp.route('/search_profiles', methods=['GET'])
def search_profiles():
    query = request.args.get('query')
    profiles = Profile.search_profiles(query)
    profiles_list = list(profiles)
    for profile in profiles_list:
        profile['_id'] = str(profile['_id'])
    return jsonify(profiles_list), 200

@bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        # Assuming `User` and `Profile` are the models being queried
        user = User.get_user_by_username(username)
        if user and user.get('password') == password and not user.get('suspended'):
            profile = Profile.get_profile_by_role(user.get('role'))
            
            # Convert ObjectId to string if present in the response
            response_data = {
                "message": "Login successful",
                "profile": {
                    "role": profile.get('role'),
                    "rights": profile.get('rights'),
                    "user_id": str(user.get('_id'))  # Convert ObjectId to string
                }
            }
            
            return jsonify(response_data), 200
        return jsonify({"message": "Invalid credentials or account suspended"}), 401

    except Exception as e:
        print("Error occurred during login:", e)
        return jsonify({"message": "Internal server error"}), 500

# Logout (No Authentication Mechanism)
@bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({"message": "Logout successful"}), 200
