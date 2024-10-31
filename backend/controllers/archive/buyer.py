# backend/controllers/buyer.py
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
        if not query:
            return jsonify([]), 400  # Bad Request if query is missing
        listings = UsedCarListing.search_listings(query)
        return jsonify(listings), 200

    def view_listings(self):
        listings = UsedCarListing.get_all_listings()
        return jsonify(listings), 200

    def save_listing(self):
        data = request.get_json()
        user_id = data.get('user_id')
        listing_id = data.get('listing_id')

        if not user_id or not listing_id:
            return jsonify(False), 400  # Bad Request

        success = BuyerListing.save_listing(user_id, listing_id)
        return jsonify(success), 200 if success else 400

    def search_shortlist(self):
        user_id = request.args.get('user_id')
        query = request.args.get('query')
        listing_id = request.args.get('listing_id')

        if not user_id:
            return jsonify(False), 400  # Bad Request

        if not query and not listing_id:
            return jsonify(False), 400  # Bad Request

        listings = BuyerListing.search_shortlist(user_id, query=query, listing_id=listing_id)
        return jsonify(listings), 200

    def view_shortlist(self):
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify(False), 400  # Bad Request
        shortlist = BuyerListing.get_shortlist(user_id)
        return jsonify(shortlist), 200

    def rate_review_agent(self):
        data = request.get_json()
        success, status = Review.create_review_entry({
            "agent_id": data.get('agent_id'),
            "reviewer_id": data.get('buyer_id'),
            "reviewer_role": "buyer",
            "rating": data.get('rating'),
            "review": data.get('review', '')
        })
        return jsonify(success), status


# Instantiate the controller to create the blueprint
buyer_controller = BuyerController()
bp = buyer_controller.bp
