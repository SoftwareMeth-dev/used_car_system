# backend/controllers/seller/get_metrics_controller.py
from flask import Blueprint, jsonify
from models.seller_metrics import SellerMetrics

get_metrics_bp = Blueprint('get_metrics', __name__, url_prefix='/api/seller')

class GetMetricsController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        get_metrics_bp.add_url_rule('/get_metrics/<listing_id>', view_func=self.get_metrics, methods=['GET'])

    def get_metrics(self, listing_id):
        metrics = SellerMetrics.get_metrics(listing_id)
        return jsonify(metrics), 200 if metrics else 404

# Instantiate the controller
get_metrics_controller = GetMetricsController()
