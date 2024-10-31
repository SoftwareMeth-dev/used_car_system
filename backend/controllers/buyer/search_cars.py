# backend/controllers/buyer/search_cars_controller.py
from flask import Blueprint, request, jsonify
from models.used_car_listing import UsedCarListing

search_cars_bp = Blueprint('search_cars', __name__, url_prefix='/api/buyer')

class SearchCarsController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        search_cars_bp.add_url_rule('/search_cars', view_func=self.search_cars, methods=['GET'])

    def search_cars(self):
        query = request.args.get('query')
        if not query:
            return jsonify([]), 400  # Bad Request if query is missing
        listings = UsedCarListing.search_listings(query)
        return jsonify(listings), 200

# Instantiate the controller
search_cars_controller = SearchCarsController()
