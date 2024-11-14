# backend/controllers/used_car_agent/search_listings_controller.py

from flask import Blueprint, request, jsonify
from models.used_car_listing import UsedCarListing

search_listings_bp = Blueprint('search_listings', __name__, url_prefix='/api')

class SearchListingsController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        search_listings_bp.add_url_rule('/search_listings', view_func=self.search_listings, methods=['GET'])

    def search_listings(self):
        """
        Endpoint to search used car listings based on a query string.
        Delegates processing to UsedCarListingModel.
        """
        query = request.args.get('query')
        response, status_code = UsedCarListing.search_listings(query) 
        return jsonify(response), status_code
 
search_listings_controller = SearchListingsController()
