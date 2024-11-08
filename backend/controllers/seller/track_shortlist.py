# backend/controllers/seller/track_shortlist_controller.py

from flask import Blueprint, request, jsonify
from models.seller_metrics import SellerMetricsModel

track_shortlist_bp = Blueprint('track_shortlist', __name__, url_prefix='/api/seller')

class TrackShortlistController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        track_shortlist_bp.add_url_rule('/track_shortlist', view_func=self.track_shortlist, methods=['POST'])

    def track_shortlist(self):
        """
        Endpoint to track when a listing is added to a shortlist.
        Delegates processing to SellerMetricsModel.
        """
        data = request.get_json()
        response, status_code = SellerMetricsModel.track_shortlist(data)
        return jsonify(response), status_code

# Instantiate the controller to register routes
track_shortlist_controller = TrackShortlistController()
