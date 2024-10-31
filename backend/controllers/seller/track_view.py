# backend/controllers/seller/track_view_controller.py
from flask import Blueprint, request, jsonify
from models.seller_metrics import SellerMetrics

track_view_bp = Blueprint('track_view', __name__, url_prefix='/api/seller')

class TrackViewController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        track_view_bp.add_url_rule('/track_view', view_func=self.track_view, methods=['POST'])

    def track_view(self):
        data = request.get_json()
        listing_id = data.get('listing_id')
        if not listing_id:
            return jsonify(False), 400  # Bad Request
        success = SellerMetrics.track_view(listing_id)
        return jsonify(success), 200 if success else 500

# Instantiate the controller
track_view_controller = TrackViewController()
