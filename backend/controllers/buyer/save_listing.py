# backend/controllers/buyer/save_listing_controller.py

from flask import Blueprint, request, jsonify
from models.buyer_listing import BuyerListing

save_listing_bp = Blueprint('save_listing', __name__, url_prefix='/api/buyer')

class SaveListingController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        save_listing_bp.add_url_rule('/save_listing', view_func=self.save_listing, methods=['POST'])

    def save_listing(self):
        data = request.get_json()
        response, status_code = BuyerListing.save_listing(data)
        return jsonify(response), status_code

# Instantiate the controller
save_listing_controller = SaveListingController()
