# backend/controllers/buyer.py
from flask import Blueprint, request, jsonify
from models.used_car_listing import UsedCarListing
from models.user import User
from models.profile import Profile
from models.buyer_listing import BuyerListing

bp = Blueprint('buyer', __name__)

# Search for Cars
@bp.route('/search_cars', methods=['GET'])
def search_cars():
    query = request.args.get('query')
    listings = UsedCarListing.search_listings(query)
    listings_list = list(listings)
    for listing in listings_list:
        listing['_id'] = str(listing['_id'])
    return jsonify(listings_list), 200

# View Listings
@bp.route('/view_listings', methods=['GET'])
def view_listings():
    listings = UsedCarListing.get_all_listings()
    listings_list = list(listings)
    for listing in listings_list:
        listing['_id'] = str(listing['_id'])
    return jsonify(listings_list), 200

# Save Listing to Shortlist
@bp.route('/save_listing', methods=['POST'])
def save_listing():
    data = request.json
    BuyerListing.save_listing(data.get('user_id'), data.get('listing_id'))
    return jsonify({"message": "Listing saved to shortlist"}), 200

# Search Shortlisted Cars
@bp.route('/search_shortlist', methods=['GET'])
def search_shortlist():
    user_id = request.args.get('user_id')
    query = request.args.get('query')
    listings = BuyerListing.search_shortlist(user_id, query)
    listings_list = list(listings)
    for listing in listings_list:
        listing['_id'] = str(listing['_id'])
    return jsonify(listings_list), 200

# View Shortlist
@bp.route('/view_shortlist', methods=['GET'])
def view_shortlist():
    user_id = request.args.get('user_id')
    shortlist = BuyerListing.get_shortlist(user_id)
    return jsonify({"shortlist": shortlist}), 200

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


@bp.route('/rate_review_agent', methods=['POST'])
def rate_review_agent():
    data = request.json
    # Validate data
    required_fields = ['agent_id', 'rating', 'buyer_id']
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400

    # Create review
    review = {
        "agent_id": data['agent_id'],
        "buyer_id": data['buyer_id'],
        "rating": data['rating'],
        "review": data.get('review', ''),
        "created_at": datetime.utcnow()
    }
    Review.create_review(review)  # Implement this method in your Review model
    return jsonify({"message": "Review submitted successfully"}), 201