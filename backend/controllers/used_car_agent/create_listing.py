# backend/controllers/used_car_agent/create_listing_controller.py

from flask import Blueprint, request, jsonify
from models.used_car_listing import UsedCarListing

create_listing_bp = Blueprint('create_listing', __name__, url_prefix='/api/used_car_agent')

class CreateListingController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        create_listing_bp.add_url_rule('/create_listing', view_func=self.create_listing, methods=['POST'])

    def create_listing(self):
        """
        Endpoint to create a new used car listing.
        Delegates processing to UsedCarListingModel.
        """
        data = request.get_json()
        response, status_code = UsedCarListing.create_listing(data)
        return jsonify(response), status_code

# Instantiate the controller to register routes
create_listing_controller = CreateListingController()
