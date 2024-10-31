# backend/controllers/used_car_agent/search_listings_controller.py
from flask import Blueprint, request, jsonify
from models.used_car_listing import UsedCarListing

search_listings_bp = Blueprint('search_listings', __name__, url_prefix='/api/used_car_agent')

class SearchListingsController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        search_listings_bp.add_url_rule('/search_listings', view_func=self.search_listings, methods=['GET'])

    def search_listings(self):
        query = request.args.get('query')
        if not query:
            return jsonify([]), 400  # Bad Request
        listings = UsedCarListing.search_listings(query)
        return jsonify(listings), 200

# Instantiate the controller
search_listings_controller = SearchListingsController()
