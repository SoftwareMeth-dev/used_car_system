# backend/controllers/used_car_agent.py
from flask import Blueprint, request, jsonify
from models.user import User
from models.used_car_listing import UsedCarListing
from models.profile import Profile

bp = Blueprint('used_car_agent', __name__)

# Create Used Car Listing
@bp.route('/create_listing', methods=['POST'])
def create_listing():
    data = request.json
    UsedCarListing.create_listing(data)
    return jsonify({"message": "Listing created successfully"}), 201

# View Used Car Listings
@bp.route('/view_listings', methods=['GET'])
def view_listings():
    listings = UsedCarListing.get_all_listings()
    listings_list = list(listings)
    for listing in listings_list:
        listing['_id'] = str(listing['_id'])
    return jsonify(listings_list), 200

# Update Used Car Listing
@bp.route('/update_listing/<listing_id>', methods=['PUT'])
def update_listing(listing_id):
    data = request.json
    UsedCarListing.update_listing(listing_id, data)
    return jsonify({"message": "Listing updated successfully"}), 200

# Delete Used Car Listing
@bp.route('/delete_listing/<listing_id>', methods=['DELETE'])
def delete_listing(listing_id):
    UsedCarListing.delete_listing(listing_id)
    return jsonify({"message": "Listing deleted successfully"}), 200

# Search Used Car Listings
@bp.route('/search_listings', methods=['GET'])
def search_listings():
    query = request.args.get('query')
    listings = UsedCarListing.search_listings(query)
    listings_list = list(listings)
    for listing in listings_list:
        listing['_id'] = str(listing['_id'])
    return jsonify(listings_list), 200

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
