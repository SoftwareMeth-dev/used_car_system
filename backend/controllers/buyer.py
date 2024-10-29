# # backend/controllers/buyer.py
# from flask import Blueprint, request, jsonify
# from models.used_car_listing import UsedCarListing
# from models.user import User
# from models.profile import Profile
# from models.review import Review
# from models.buyer_listing import BuyerListing
# from datetime import datetime

# bp = Blueprint('buyer', __name__)

# # Search for Cars
# @bp.route('/search_cars', methods=['GET'])
# def search_cars():
#     query = request.args.get('query')
#     listings = UsedCarListing.search_listings(query)
#     listings_list = list(listings)
#     for listing in listings_list:
#         listing['_id'] = str(listing['_id'])
#     return jsonify(listings_list), 200

# # View Listings
# @bp.route('/view_listings', methods=['GET'])
# def view_listings():
#     listings = UsedCarListing.get_all_listings()
#     listings_list = list(listings)
#     for listing in listings_list:
#         listing['_id'] = str(listing['_id'])
#     return jsonify(listings_list), 200

# # Save Listing to Shortlist
# @bp.route('/save_listing', methods=['POST'])
# def save_listing():
#     data = request.json
#     user_id = data.get('user_id')
#     listing_id = data.get('listing_id')
    
#     if not user_id or not listing_id:
#         return jsonify({"message": "Missing user_id or listing_id"}), 400
    
#     result = BuyerListing.save_listing(user_id, listing_id)
#     if result is None:
#         return jsonify({"message": "Invalid listing_id"}), 400
    
#     return jsonify({"message": "Listing saved to shortlist"}), 200
# # Search Shortlisted Cars
# @bp.route('/search_shortlist', methods=['GET'])
# def search_shortlist():
#     user_id = request.args.get('user_id')
#     query = request.args.get('query')
#     listing_id = request.args.get('listing_id')
    
#     if not user_id:
#         return jsonify({"message": "Missing user_id parameter"}), 400
    
#     if not query and not listing_id:
#         return jsonify({"message": "Provide either query or listing_id parameter"}), 400
    
#     listings = BuyerListing.search_shortlist(user_id, query=query, listing_id=listing_id)
#     listings_list = []
#     for listing in listings:
#         listing['_id'] = str(listing['_id'])
#         listing['seller_id'] = str(listing['seller_id'])  # Convert seller_id ObjectId to string if needed
#         listing['created_at'] = listing['created_at'].isoformat()  # Convert datetime to string
#         listings_list.append(listing)
    
#     return jsonify(listings_list), 200


# # View Shortlist
# @bp.route('/view_shortlist', methods=['GET'])
# def view_shortlist():
#     user_id = request.args.get('user_id')
#     shortlist = BuyerListing.get_shortlist(user_id)
#     return jsonify({"shortlist": shortlist}), 200

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


# # Rate and Review Agent
# @bp.route('/rate_review_agent', methods=['POST'])
# def rate_review_agent():
#     data = request.json
#     # Validate data
#     required_fields = ['agent_id', 'rating', 'buyer_id']
#     if not all(field in data for field in required_fields):
#         return jsonify({"message": "Missing required fields"}), 400

#     # Validate rating
#     rating = data.get('rating')
#     if not isinstance(rating, (int, float)) or not (1 <= rating <= 5):
#         return jsonify({"message": "Rating must be a number between 1 and 5"}), 400

#     # Check if agent exists and is a used car agent
#     agent = User.get_user_by_id(data['agent_id'])
#     print(agent)
#     if not agent or agent.get('role') != 'used_car_agent':
#         return jsonify({"message": "Invalid agent ID"}), 400

#     # Check if buyer exists and is a buyer
#     buyer = User.get_user_by_id(data['buyer_id'])
#     print(buyer)
#     if not buyer or buyer.get('role') != 'buyer':
#         return jsonify({"message": "Invalid buyer ID"}), 400

#     # Create review
#     review = {
#         "agent_id": data['agent_id'],
#         "buyer_id": data['buyer_id'],
#         "rating": rating,
#         "review": data.get('review', ''),
#         "created_at": datetime.utcnow()
#     }
#     Review.create_review(review)
#     return jsonify({"message": "Review submitted successfully"}), 201


from flask import request, jsonify
from models.used_car_listing import UsedCarListing
from models.buyer_listing import BuyerListing
from models.user import User
from models.profile import Profile
from models.review import Review
from controllers.base_controller import UserController
from datetime import datetime

class BuyerController(UserController):
    def __init__(self):
        super().__init__('buyer', __name__, '/api/buyer')
        self.register_buyer_routes()

    def register_buyer_routes(self):
        self.bp.route('/search_cars', methods=['GET'])(self.search_cars)
        self.bp.route('/view_listings', methods=['GET'])(self.view_listings)
        self.bp.route('/save_listing', methods=['POST'])(self.save_listing)
        self.bp.route('/search_shortlist', methods=['GET'])(self.search_shortlist)
        self.bp.route('/view_shortlist', methods=['GET'])(self.view_shortlist)
        self.bp.route('/rate_review_agent', methods=['POST'])(self.rate_review_agent)

    # Buyer-specific methods
    def search_cars(self):
        query = request.args.get('query')
        listings = UsedCarListing.search_listings(query)
        listings_list = list(listings)
        for listing in listings_list:
            listing['_id'] = str(listing['_id'])
        return jsonify(listings_list), 200

    def view_listings(self):
        listings = UsedCarListing.get_all_listings()
        listings_list = list(listings)
        for listing in listings_list:
            listing['_id'] = str(listing['_id'])
        return jsonify(listings_list), 200

    def save_listing(self):
        data = request.json
        user_id = data.get('user_id')
        listing_id = data.get('listing_id')

        if not user_id or not listing_id:
            return jsonify({"message": "Missing user_id or listing_id"}), 400

        result = BuyerListing.save_listing(user_id, listing_id)
        if result is None:
            return jsonify({"message": "Invalid listing_id"}), 400

        return jsonify({"message": "Listing saved to shortlist"}), 200

    def search_shortlist(self):
        user_id = request.args.get('user_id')
        query = request.args.get('query')
        listing_id = request.args.get('listing_id')

        if not user_id:
            return jsonify({"message": "Missing user_id parameter"}), 400

        if not query and not listing_id:
            return jsonify({"message": "Provide either query or listing_id parameter"}), 400

        listings = BuyerListing.search_shortlist(user_id, query=query, listing_id=listing_id)
        listings_list = []
        for listing in listings:
            listing['_id'] = str(listing['_id'])
            listing['seller_id'] = str(listing['seller_id']) if listing.get('seller_id') else None
            listing['created_at'] = listing['created_at'].isoformat() if listing.get('created_at') else None
            listings_list.append(listing)

        return jsonify(listings_list), 200

    def view_shortlist(self):
        user_id = request.args.get('user_id')
        shortlist = BuyerListing.get_shortlist(user_id)
        return jsonify({"shortlist": shortlist}), 200

    def rate_review_agent(self):
        data = request.json
        required_fields = ['agent_id', 'rating', 'buyer_id']
        if not all(field in data for field in required_fields):
            return jsonify({"message": "Missing required fields"}), 400

        rating = data.get('rating')
        if not isinstance(rating, (int, float)) or not (1 <= rating <= 5):
            return jsonify({"message": "Rating must be a number between 1 and 5"}), 400

        agent = User.get_user_by_id(data['agent_id'])
        if not agent or agent.get('role') != 'used_car_agent':
            return jsonify({"message": "Invalid agent ID"}), 400

        buyer = User.get_user_by_id(data['buyer_id'])
        if not buyer or buyer.get('role') != 'buyer':
            return jsonify({"message": "Invalid buyer ID"}), 400

        review = {
            "agent_id": data['agent_id'],
            "buyer_id": data['buyer_id'],
            "rating": rating,
            "review": data.get('review', ''),
            "created_at": datetime.utcnow()
        }
        Review.create_review(review)
        return jsonify({"message": "Review submitted successfully"}), 201

# Instantiate the controller to create the blueprint
bp = BuyerController().bp
