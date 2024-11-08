# backend/controllers/review/rate_review_agent_controller.py

from flask import Blueprint, request, jsonify
from models.review import ReviewModel

rate_review_agent_bp = Blueprint('rate_review_agent', __name__, url_prefix='/api')

class RateReviewAgentController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        # Dynamic route handling role from the URL
        rate_review_agent_bp.add_url_rule(
            '/<role>/rate_review_agent',
            view_func=self.rate_review_agent,
            methods=['POST']
        )

    def rate_review_agent(self, role):
        """
        Endpoint to rate and review agents based on the role specified in the URL.
        Delegates all processing to the ReviewModel.
        """
        data = request.get_json()
        response, status_code = ReviewModel.rate_and_review_agent(role, data)
        return jsonify(response), status_code

# Instantiate the controller to register routes
rate_review_agent_controller = RateReviewAgentController()
