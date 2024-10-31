# backend/controllers/used_car_agent/update_listing_controller.py
from flask import Blueprint, request, jsonify
from models.used_car_listing import UsedCarListing

update_listing_bp = Blueprint('update_listing', __name__, url_prefix='/api/used_car_agent')

class UpdateListingController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        update_listing_bp.add_url_rule('/update_listing/<listing_id>', view_func=self.update_listing, methods=['PUT'])

    def update_listing(self, listing_id):
        data = request.get_json()
        if not data:
            return jsonify(False), 400  # Bad Request
        success = UsedCarListing.update_listing(listing_id, data)
        return jsonify(success), 200 if success else 404

# Instantiate the controller
update_listing_controller = UpdateListingController()
