# backend/controllers/review/view_reviews_controller.py
from flask import Blueprint, jsonify
from models.review import Review
from models.user import User

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
        Allows used car agents to view their reviews and average ratings.
        """
        # Verify agent existence
        agent = User.get_user_by_id(agent_id)
        if not agent or agent.get('role') != 'used_car_agent':
            return jsonify({"error": "Agent not found."}), 404  # Not Found

        reviews = Review.get_reviews_for_agent(agent_id)
        average_rating = Review.get_average_rating(agent_id)
        return jsonify({"reviews": reviews, "average_rating": average_rating}), 200

# Instantiate the controller to register routes
view_reviews_controller = ViewReviewsController()
