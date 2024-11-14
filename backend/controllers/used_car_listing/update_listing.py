# backend/controllers/used_car_agent/update_listing_controller.py

from flask import Blueprint, request, jsonify
from models.used_car_listing import UsedCarListing

update_listing_bp = Blueprint('update_listing', __name__, url_prefix='/api')

class UpdateListingController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        update_listing_bp.add_url_rule('/update_listing/<listing_id>', view_func=self.update_listing, methods=['PUT'])

    def update_listing(self, listing_id):
        """
        Endpoint to update a used car listing by its listing_id.
        Delegates processing to UsedCarListingModel.
        """
        data = request.get_json()
        response, status_code = UsedCarListing.update_listing(listing_id, data)
        return jsonify(response), status_code
 
update_listing_controller = UpdateListingController()
