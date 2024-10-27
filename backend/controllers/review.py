# backend/controllers/seller.py
from flask import Blueprint, request, jsonify
from models.user import User
from models.profile import Profile
from models.seller_metrics import SellerMetrics

bp = Blueprint('seller', __name__)

# Track Views
@bp.route('/track_view', methods=['POST'])
def track_view():
    data = request.json
    SellerMetrics.track_view(data.get('listing_id'))
    return jsonify({"message": "View tracked"}), 200

# Track Shortlists
@bp.route('/track_shortlist', methods=['POST'])
def track_shortlist():
    data = request.json
    SellerMetrics.track_shortlist(data.get('listing_id'))
    return jsonify({"message": "Shortlist tracked"}), 200

# Get Metrics
@bp.route('/get_metrics/<listing_id>', methods=['GET'])
def get_metrics(listing_id):
    metrics = SellerMetrics.get_metrics(listing_id)
    if metrics:
        metrics['_id'] = str(metrics['_id'])
    return jsonify(metrics), 200

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
