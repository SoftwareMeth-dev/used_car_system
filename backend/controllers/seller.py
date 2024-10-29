# # backend/controllers/seller.py
# from flask import Blueprint, request, jsonify
# from models.user import User
# from models.profile import Profile
# from models.review import Review
# from models.seller_metrics import SellerMetrics

# from datetime import datetime
# bp = Blueprint('seller', __name__)

# # Track Views
# @bp.route('/track_view', methods=['POST'])
# def track_view():
#     data = request.json
#     SellerMetrics.track_view(data.get('listing_id'))
#     return jsonify({"message": "View tracked"}), 200

# # Track Shortlists
# @bp.route('/track_shortlist', methods=['POST'])
# def track_shortlist():
#     data = request.json
#     SellerMetrics.track_shortlist(data.get('listing_id'))
#     return jsonify({"message": "Shortlist tracked"}), 200

# # Get Metrics
# @bp.route('/get_metrics/<listing_id>', methods=['GET'])
# def get_metrics(listing_id):
#     metrics = SellerMetrics.get_metrics(listing_id)
#     if metrics:
#         metrics['_id'] = str(metrics['_id'])
#     return jsonify(metrics), 200

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
#     required_fields = ['agent_id', 'rating', 'seller_id']
#     if not all(field in data for field in required_fields):
#         return jsonify({"message": "Missing required fields"}), 400

#     # Validate rating
#     rating = data.get('rating')
#     if not isinstance(rating, (int, float)) or not (1 <= rating <= 5):
#         return jsonify({"message": "Rating must be a number between 1 and 5"}), 400

#     # Check if agent exists and is a used car agent
#     agent = User.get_user_by_id(data['agent_id'])
#     if not agent or agent.get('role') != 'used_car_agent':
#         return jsonify({"message": "Invalid agent ID"}), 400

#     # Check if seller exists and is a seller
#     seller = User.get_user_by_id(data['seller_id'])
#     if not seller or seller.get('role') != 'seller':
#         return jsonify({"message": "Invalid seller ID"}), 400

#     # Create review
#     review = {
#         "agent_id": data['agent_id'],
#         "seller_id": data['seller_id'],
#         "rating": rating,
#         "review": data.get('review', ''),
#         "created_at": datetime.utcnow()
#     }
#     Review.create_review(review)
#     return jsonify({"message": "Review submitted successfully"}), 201


from flask import request, jsonify
from models.user import User
from models.profile import Profile
from models.review import Review
from models.seller_metrics import SellerMetrics
from controllers.base_controller import UserController
from datetime import datetime

class SellerController(UserController):
    def __init__(self):
        super().__init__('seller', __name__, '/api/seller')
        self.register_seller_routes()

    def register_seller_routes(self):
        self.bp.route('/track_view', methods=['POST'])(self.track_view)
        self.bp.route('/track_shortlist', methods=['POST'])(self.track_shortlist)
        self.bp.route('/get_metrics/<listing_id>', methods=['GET'])(self.get_metrics)
        self.bp.route('/rate_review_agent', methods=['POST'])(self.rate_review_agent)

    # Seller-specific methods
    def track_view(self):
        data = request.json
        SellerMetrics.track_view(data.get('listing_id'))
        return jsonify({"message": "View tracked"}), 200

    def track_shortlist(self):
        data = request.json
        SellerMetrics.track_shortlist(data.get('listing_id'))
        return jsonify({"message": "Shortlist tracked"}), 200

    def get_metrics(self, listing_id):
        metrics = SellerMetrics.get_metrics(listing_id)
        if metrics:
            metrics['_id'] = str(metrics['_id'])
        return jsonify(metrics), 200

    def rate_review_agent(self):
        data = request.json
        required_fields = ['agent_id', 'rating', 'seller_id']
        if not all(field in data for field in required_fields):
            return jsonify({"message": "Missing required fields"}), 400

        rating = data.get('rating')
        if not isinstance(rating, (int, float)) or not (1 <= rating <= 5):
            return jsonify({"message": "Rating must be a number between 1 and 5"}), 400

        agent = User.get_user_by_id(data['agent_id'])
        if not agent or agent.get('role') != 'used_car_agent':
            return jsonify({"message": "Invalid agent ID"}), 400

        seller = User.get_user_by_id(data['seller_id'])
        if not seller or seller.get('role') != 'seller':
            return jsonify({"message": "Invalid seller ID"}), 400

        review = {
            "agent_id": data['agent_id'],
            "seller_id": data['seller_id'],
            "rating": rating,
            "review": data.get('review', ''),
            "created_at": datetime.utcnow()
        }
        Review.create_review(review)
        return jsonify({"message": "Review submitted successfully"}), 201

# Instantiate the controller to create the blueprint
bp = SellerController().bp
