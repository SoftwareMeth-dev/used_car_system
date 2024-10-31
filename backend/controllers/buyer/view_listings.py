# backend/controllers/buyer/view_listings_controller.py
from flask import Blueprint, jsonify
from models.used_car_listing import UsedCarListing

view_listings_bp = Blueprint('buyer_view_listings', __name__, url_prefix='/api/buyer')

class BuyerViewListingsController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        view_listings_bp.add_url_rule('/view_listings', view_func=self.view_listings, methods=['GET'])

    def view_listings(self):
        listings = UsedCarListing.get_all_listings()
        return jsonify(listings), 200

# Instantiate the controller
buyer_view_listings_controller = BuyerViewListingsController()
