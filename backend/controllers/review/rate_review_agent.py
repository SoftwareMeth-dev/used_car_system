# backend/controllers/review/rate_review_agent_controller.py

from flask import Blueprint, request, jsonify
from models.review import Review

rate_review_agent_bp = Blueprint('rate_review_agent', __name__, url_prefix='/api')

class RateReviewAgentController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        # Updated route to include user_id and listing_id
        rate_review_agent_bp.add_url_rule(
            '/rate_review_agent/<user_id>/<listing_id>',
            view_func=self.rate_review_agent,
            methods=['POST']
        )

    def rate_review_agent(self, role, user_id, listing_id):
        """
        Endpoint to rate and review agents based on the role, user_id, and listing_id specified in the URL.
        Delegates all processing to the ReviewModel.
        """
        data = request.get_json()
        response, status_code = Review.rate_and_review_agent(role, user_id, listing_id, data)
        return jsonify(response), status_code

# Instantiate the controller to register routes
rate_review_agent_controller = RateReviewAgentController()
