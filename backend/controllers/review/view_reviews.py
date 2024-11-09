# backend/controllers/review/view_reviews_controller.py

from flask import Blueprint, jsonify, request
from models.review import Review

view_reviews_bp = Blueprint('view_reviews', __name__, url_prefix='/api')

class ViewReviewsController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        # Route for agents to view their reviews
        view_reviews_bp.add_url_rule(
            '/used_car_agent/view_reviews/<agent_id>',
            view_func=self.view_reviews,
            methods=['GET']
        )

    def view_reviews(self, agent_id):
        """
        Endpoint for used car agents to view their reviews and average ratings.
        Delegates all processing to the ReviewModel.
        """
        response, status_code = Review.get_reviews_and_average(agent_id)
        return jsonify(response), status_code

# Instantiate the controller to register routes
view_reviews_controller = ViewReviewsController()
