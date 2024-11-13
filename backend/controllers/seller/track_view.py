# backend/controllers/seller/track_view_controller.py

from flask import Blueprint, request, jsonify
from models.used_car_listing import UsedCarListing  # Updated import

track_view_bp = Blueprint('track_view', __name__, url_prefix='/api')

class TrackViewController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        track_view_bp.add_url_rule('/track_view', view_func=self.track_view, methods=['POST'])

    def track_view(self):
        """
        Endpoint to track when a listing is viewed.
        Delegates processing to UsedCarListing model.
        """
        data = request.get_json()
        response, status_code = UsedCarListing.track_view(data)
        return jsonify(response), status_code

# Instantiate the controller to register routes
track_view_controller = TrackViewController()
