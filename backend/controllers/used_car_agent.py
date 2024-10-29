# # backend/controllers/used_car_agent.py
# from flask import Blueprint, request, jsonify
# from models.user import User
# from models.used_car_listing import UsedCarListing
# from models.review import Review
# from models.profile import Profile

# bp = Blueprint('used_car_agent', __name__)

# # Create Used Car Listing
# @bp.route('/create_listing', methods=['POST'])
# def create_listing():
#     data = request.json
#     UsedCarListing.create_listing(data)
#     return jsonify({"message": "Listing created successfully"}), 201

# # View Used Car Listings
# @bp.route('/view_listings', methods=['GET'])
# def view_listings():
#     listings = UsedCarListing.get_all_listings()
#     listings_list = list(listings)
#     for listing in listings_list:
#         listing['_id'] = str(listing['_id'])
#     return jsonify(listings_list), 200

# # Update Used Car Listing
# @bp.route('/update_listing/<listing_id>', methods=['PUT'])
# def update_listing(listing_id):
#     data = request.json
#     UsedCarListing.update_listing(listing_id, data)
#     return jsonify({"message": "Listing updated successfully"}), 200

# # Delete Used Car Listing
# @bp.route('/delete_listing/<listing_id>', methods=['DELETE'])
# def delete_listing(listing_id):
#     UsedCarListing.delete_listing(listing_id)
#     return jsonify({"message": "Listing deleted successfully"}), 200

# # Search Used Car Listings
# @bp.route('/search_listings', methods=['GET'])
# def search_listings():
#     query = request.args.get('query')
#     listings = UsedCarListing.search_listings(query)
#     listings_list = list(listings)
#     for listing in listings_list:
#         listing['_id'] = str(listing['_id'])
#     return jsonify(listings_list), 200

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



# # View Reviews for Agent
# @bp.route('/view_reviews/<agent_id>', methods=['GET'])
# def view_reviews(agent_id):
#     # Check if agent exists and is a used car agent
#     agent = User.get_user_by_id(agent_id)
#     if not agent or agent.get('role') != 'used_car_agent':
#         return jsonify({"message": "Invalid agent ID"}), 400

#     reviews = Review.get_reviews_for_agent(agent_id)
#     reviews_list = []
#     for review in reviews:
#         review['_id'] = str(review['_id'])
#         reviews_list.append(review)

#     # Get average rating
#     average_rating = Review.get_average_rating(agent_id)

#     return jsonify({"reviews": reviews_list, "average_rating": average_rating}), 200



from flask import request, jsonify
from models.user import User
from models.used_car_listing import UsedCarListing
from models.review import Review
from models.profile import Profile
from models.seller_metrics import SellerMetrics
from controllers.base_controller import UserController

class UsedCarAgentController(UserController):
    def __init__(self):
        super().__init__('used_car_agent', __name__, '/api/used_car_agent')
        self.register_agent_routes()

    def register_agent_routes(self):
        self.bp.route('/create_listing', methods=['POST'])(self.create_listing)
        self.bp.route('/view_listings', methods=['GET'])(self.view_listings)
        self.bp.route('/update_listing/<listing_id>', methods=['PUT'])(self.update_listing)
        self.bp.route('/delete_listing/<listing_id>', methods=['DELETE'])(self.delete_listing)
        self.bp.route('/search_listings', methods=['GET'])(self.search_listings)
        self.bp.route('/rate_review_agent', methods=['POST'])(self.rate_review_agent)
        self.bp.route('/view_reviews/<agent_id>', methods=['GET'])(self.view_reviews)
        self.bp.route('/get_metrics/<listing_id>', methods=['GET'])(self.get_metrics)
        self.bp.route('/track_view', methods=['POST'])(self.track_view)
        self.bp.route('/track_shortlist', methods=['POST'])(self.track_shortlist)

    # Agent-specific methods
    def create_listing(self):
        data = request.json
        UsedCarListing.create_listing(data)
        return jsonify({"message": "Listing created successfully"}), 201

    def view_listings(self):
        listings = UsedCarListing.get_all_listings()
        listings_list = list(listings)
        for listing in listings_list:
            listing['_id'] = str(listing['_id'])
        return jsonify(listings_list), 200

    def update_listing(self, listing_id):
        data = request.json
        result = UsedCarListing.update_listing(listing_id, data)
        if result.matched_count:
            return jsonify({"message": "Listing updated successfully"}), 200
        else:
            return jsonify({"message": "Listing not found"}), 404

    def delete_listing(self, listing_id):
        result = UsedCarListing.delete_listing(listing_id)
        if result.deleted_count:
            return jsonify({"message": "Listing deleted successfully"}), 200
        else:
            return jsonify({"message": "Listing not found"}), 404

    def search_listings(self):
        query = request.args.get('query')
        listings = UsedCarListing.search_listings(query)
        listings_list = list(listings)
        for listing in listings_list:
            listing['_id'] = str(listing['_id'])
        return jsonify(listings_list), 200

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

    def view_reviews(self, agent_id):
        agent = User.get_user_by_id(agent_id)
        if not agent or agent.get('role') != 'used_car_agent':
            return jsonify({"message": "Invalid agent ID"}), 400

        reviews = Review.get_reviews_for_agent(agent_id)
        reviews_list = []
        for review in reviews:
            review['_id'] = str(review['_id'])
            reviews_list.append(review)

        average_rating = Review.get_average_rating(agent_id)

        return jsonify({"reviews": reviews_list, "average_rating": average_rating}), 200

    def get_metrics(self, listing_id):
        metrics = SellerMetrics.get_metrics(listing_id)
        if metrics:
            metrics['_id'] = str(metrics['_id'])
        return jsonify(metrics), 200

    def track_view(self):
        data = request.json
        SellerMetrics.track_view(data.get('listing_id'))
        return jsonify({"message": "View tracked"}), 200

    def track_shortlist(self):
        data = request.json
        SellerMetrics.track_shortlist(data.get('listing_id'))
        return jsonify({"message": "Shortlist tracked"}), 200

# Instantiate the controller to create the blueprint
bp = UsedCarAgentController().bp
