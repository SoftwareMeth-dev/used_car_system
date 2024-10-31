# backend/controllers/seller/track_shortlist_controller.py
from flask import Blueprint, request, jsonify
from models.seller_metrics import SellerMetrics

track_shortlist_bp = Blueprint('track_shortlist', __name__, url_prefix='/api/seller')

class TrackShortlistController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        track_shortlist_bp.add_url_rule('/track_shortlist', view_func=self.track_shortlist, methods=['POST'])

    def track_shortlist(self):
        data = request.get_json()
        listing_id = data.get('listing_id')
        if not listing_id:
            return jsonify(False), 400  # Bad Request
        success = SellerMetrics.track_shortlist(listing_id)
        return jsonify(success), 200 if success else 500

# Instantiate the controller
track_shortlist_controller = TrackShortlistController()
