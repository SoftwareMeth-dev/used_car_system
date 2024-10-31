# backend/controllers/seller.py
from flask import Blueprint, request, jsonify
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
        data = request.get_json()
        listing_id = data.get('listing_id')
        if not listing_id:
            return jsonify(False), 400  # Bad Request
        success = SellerMetrics.track_view(listing_id)
        return jsonify(success), 200 if success else 500

    def track_shortlist(self):
        data = request.get_json()
        listing_id = data.get('listing_id')
        if not listing_id:
            return jsonify(False), 400  # Bad Request
        success = SellerMetrics.track_shortlist(listing_id)
        return jsonify(success), 200 if success else 500

    def get_metrics(self, listing_id):
        metrics = SellerMetrics.get_metrics(listing_id)
        return jsonify(metrics), 200 if metrics else 404

    def rate_review_agent(self):
        data = request.get_json() 
        success, status = Review.create_review_entry({
            "agent_id": data.get('agent_id'),
            "reviewer_id": data.get('seller_id'),
            "reviewer_role": "seller",
            "rating": data.get('rating'),
            "review": data.get('review', '')
        })
        return jsonify(success), status

 # Instantiate the controller to create the blueprint
seller_controller = SellerController()
bp = seller_controller.bp
