# backend/controllers/buyer/view_shortlist_controller.py

from flask import Blueprint, request, jsonify
from models.buyer_listing import BuyerListing

view_shortlist_bp = Blueprint('view_shortlist', __name__, url_prefix='/api')

class ViewShortlistController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        view_shortlist_bp.add_url_rule('/view_shortlist', view_func=self.view_shortlist, methods=['GET'])

    def view_shortlist(self):
        user_id = request.args.get('user_id')
        response, status_code = BuyerListing.get_shortlist(user_id)
        return jsonify(response), status_code

# Instantiate the controller
view_shortlist_controller = ViewShortlistController()
