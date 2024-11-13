# backend/controllers/used_car_agent/view_listings_controller.py

from flask import Blueprint, jsonify
from models.used_car_listing import UsedCarListing

view_listings_bp = Blueprint('view_listings', __name__, url_prefix='/api')

class ViewListingsController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        # Endpoint to get all used car listings
        view_listings_bp.add_url_rule('/view_listings', view_func=self.view_listings, methods=['GET'])
        
        # Optional: Endpoint to get a specific listing by ID
        view_listings_bp.add_url_rule('/view_listing/<listing_id>', view_func=self.view_listing_by_id, methods=['GET'])

    def view_listings(self):
        """
        Endpoint to retrieve all used car listings.
        Delegates processing to UsedCarListingModel.
        """
        response, status_code = UsedCarListing.get_all_listings()
        return jsonify(response), status_code

    def view_listing_by_id(self, listing_id):
        """
        Endpoint to retrieve a specific used car listing by its listing_id.
        Delegates processing to UsedCarListingModel.
        """
        response, status_code = UsedCarListing.get_listing_by_id(listing_id)
        return jsonify(response), status_code

# Instantiate the controller to register routes
view_listings_controller = ViewListingsController()
