from flask import Blueprint, request, jsonify
from models.buyer_listing import BuyerListing

remove_shortlist_bp = Blueprint('remove_shortlist', __name__, url_prefix='/api')

class RemoveShortlistController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        remove_shortlist_bp.add_url_rule('/remove_shortlist', view_func=self.remove_shortlist, methods=['DELETE'])

    def remove_shortlist(self):
        user_id = request.args.get('user_id')
        listing_id = request.args.get('listing_id') 

        response, status_code = BuyerListing.remove_from_shortlist(user_id, listing_id)
        return jsonify(response), status_code

# Instantiate the controller
remove_shortlist_controller = RemoveShortlistController()
