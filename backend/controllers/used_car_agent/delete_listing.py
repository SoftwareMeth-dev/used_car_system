# backend/controllers/used_car_agent/delete_listing_controller.py
from flask import Blueprint, jsonify
from models.used_car_listing import UsedCarListing

delete_listing_bp = Blueprint('delete_listing', __name__, url_prefix='/api/used_car_agent')

class DeleteListingController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        delete_listing_bp.add_url_rule('/delete_listing/<listing_id>', view_func=self.delete_listing, methods=['DELETE'])

    def delete_listing(self, listing_id):
        success = UsedCarListing.delete_listing(listing_id)
        return jsonify(success), 200 if success else 404

# Instantiate the controller
delete_listing_controller = DeleteListingController()
