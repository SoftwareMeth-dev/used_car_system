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
        user_id = data.get('user_id')
        listing_id = data.get('listing_id')

        if not user_id or not listing_id:
            return jsonify(False), 400  # Bad Request

        success = BuyerListing.save_listing(user_id, listing_id)
        return jsonify(success), 200 if success else 400

# Instantiate the controller
save_listing_controller = SaveListingController()
