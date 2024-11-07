# utils/view/listings.py
from flask import Blueprint, jsonify
from models.used_car_listing import UsedCarListing

listings_bp = Blueprint('listings', __name__, url_prefix='/api/view')

class ListingsController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        listings_bp.add_url_rule('/listings', view_func=self.view_listings, methods=['GET'])

    def view_listings(self):
        listings = UsedCarListing.get_all_listings()
        return jsonify(listings), 200

# Instantiate the controller
listings_controller = ListingsController()
