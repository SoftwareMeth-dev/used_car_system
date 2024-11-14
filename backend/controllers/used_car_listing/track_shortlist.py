# backend/controllers/seller/track_shortlist_controller.py

from flask import Blueprint, request, jsonify
from models.used_car_listing import UsedCarListing  # Updated import

track_shortlist_bp = Blueprint('track_shortlist', __name__, url_prefix='/api')

class TrackShortlistController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        track_shortlist_bp.add_url_rule('/track_shortlist', view_func=self.track_shortlist, methods=['POST'])

    def track_shortlist(self):
        """
        Endpoint to track when a listing is added to a shortlist.
        Delegates processing to UsedCarListing model.
        """
        data = request.get_json()
        response, status_code = UsedCarListing.track_shortlist(data)
        return jsonify(response), status_code
 
track_shortlist_controller = TrackShortlistController()
