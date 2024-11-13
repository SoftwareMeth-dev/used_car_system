# backend/controllers/seller/get_metrics_controller.py

from flask import Blueprint, jsonify, request
from models.used_car_listing import UsedCarListing  # Updated import

get_metrics_bp = Blueprint('get_metrics', __name__, url_prefix='/api')

class GetMetricsController:
    def __init__(self):
        self.register_routes()

    def register_routes(self): 
        # New route for seller-wide metrics
        get_metrics_bp.add_url_rule('/get_metrics/<seller_id>', view_func=self.get_metrics_by_seller, methods=['GET'])
 
    def get_metrics_by_seller(self, seller_id):
        """
        Endpoint to retrieve metrics for all listings of a specific seller.
        Delegates processing to UsedCarListing model.
        """
        response, status_code = UsedCarListing.get_metrics_by_seller(seller_id) 
        return jsonify(response), status_code

# Instantiate the controller to register routes
get_metrics_controller = GetMetricsController()
