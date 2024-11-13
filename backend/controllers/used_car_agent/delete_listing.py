# backend/controllers/used_car_agent/delete_listing_controller.py

from flask import Blueprint, jsonify
from models.used_car_listing import UsedCarListing

delete_listing_bp = Blueprint('delete_listing', __name__, url_prefix='/api')

class DeleteListingController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        delete_listing_bp.add_url_rule('/delete_listing/<listing_id>', view_func=self.delete_listing, methods=['DELETE'])

    def delete_listing(self, listing_id):
        """
        Endpoint to delete a used car listing by its listing_id.
        Delegates processing to UsedCarListingModel.
        """
        response, status_code = UsedCarListing.delete_listing(listing_id)
        return jsonify(response), status_code

# Instantiate the controller to register routes
delete_listing_controller = DeleteListingController()
