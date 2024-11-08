# backend/controllers/buyer/search_shortlist_controller.py

from flask import Blueprint, request, jsonify
from models.buyer_listing import BuyerListing

search_shortlist_bp = Blueprint('search_shortlist', __name__, url_prefix='/api/buyer')

class SearchShortlistController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        search_shortlist_bp.add_url_rule('/search_shortlist', view_func=self.search_shortlist, methods=['GET'])

    def search_shortlist(self):
        user_id = request.args.get('user_id')
        query = request.args.get('query')
        listing_id = request.args.get('listing_id')

        data = {
            "user_id": user_id,
            "query": query,
            "listing_id": listing_id
        }

        response, status_code = BuyerListing.search_shortlist(data)
        return jsonify(response), status_code

# Instantiate the controller
search_shortlist_controller = SearchShortlistController()
