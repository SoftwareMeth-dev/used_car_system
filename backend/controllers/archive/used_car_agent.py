# backend/controllers/used_car_agent.py
from flask import request, jsonify
from models.user import User
from models.used_car_listing import UsedCarListing
from models.review import Review
from models.profile import Profile
from models.seller_metrics import SellerMetrics
from controllers.base_controller import UserController
from datetime import datetime

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
        self.bp.route('/view_reviews/<agent_id>', methods=['GET'])(self.view_reviews) 

    # Agent-specific methods
    def create_listing(self):
        data = request.get_json()
        success = UsedCarListing.create_listing(data)
        return jsonify(success), 201 if success else 500

    def view_listings(self):
        listings = UsedCarListing.get_all_listings()
        return jsonify(listings), 200

    def update_listing(self, listing_id):
        data = request.get_json()
        if not data:
            return jsonify(False), 400  # Bad Request
        success = UsedCarListing.update_listing(listing_id, data)
        return jsonify(success), 200 if success else 404

    def delete_listing(self, listing_id):
        success = UsedCarListing.delete_listing(listing_id)
        return jsonify(success), 200 if success else 404

    def search_listings(self):
        query = request.args.get('query')
        if not query:
            return jsonify([]), 400  # Bad Request
        listings = UsedCarListing.search_listings(query)
        return jsonify(listings), 200
 
    def view_reviews(self, agent_id):
        agent = User.get_user_by_id(agent_id)
        if not agent or agent.get('role') != 'used_car_agent':
            return jsonify({"error": "Agent not found."}), 404  # Not Found

        reviews = Review.get_reviews_for_agent(agent_id)
        average_rating = Review.get_average_rating(agent_id)
        return jsonify({"reviews": reviews, "average_rating": average_rating}), 200

    # def get_metrics(self, listing_id):
    #     metrics = SellerMetrics.get_metrics(listing_id)
    #     return jsonify(metrics), 200 if metrics else 404

    # def track_view(self):
    #     data = request.get_json()
    #     listing_id = data.get('listing_id')
    #     if not listing_id:
    #         return jsonify(False), 400  # Bad Request
    #     success = SellerMetrics.track_view(listing_id)
    #     return jsonify(success), 200 if success else 500

    # def track_shortlist(self):
    #     data = request.get_json()
    #     listing_id = data.get('listing_id')
    #     if not listing_id:
    #         return jsonify(False), 400  # Bad Request
    #     success = SellerMetrics.track_shortlist(listing_id)
    #     return jsonify(success), 200 if success else 500

 # Instantiate the controller to create the blueprint
used_car_agent_controller = UsedCarAgentController()
bp = used_car_agent_controller.bp