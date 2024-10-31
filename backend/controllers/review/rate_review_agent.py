# backend/controllers/review/rate_review_agent_controller.py
from flask import Blueprint, request, jsonify
from models.review import Review
from models.user import User

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
        Allows buyers and sellers to rate and review agents.
        The role is dynamically read from the URL.
        """
        # Validate the role
        if role not in ['buyer', 'seller']:
            return jsonify({"error": "Invalid role specified."}), 400

        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided."}), 400

        # Define required fields based on role
        required_fields = ["agent_id", f"{role}_id", "rating"]
        if not all(field in data for field in required_fields):
            missing = [field for field in required_fields if field not in data]
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}."}), 400

        # Extract reviewer_id based on role
        reviewer_id = data.get(f"{role}_id")
        reviewer_role = role

        # Validate agent existence
        agent = User.get_user_by_id(data.get('agent_id'))
        if not agent or agent.get('role') != 'used_car_agent':
            return jsonify({"error": "Agent not found."}), 404

        # Create the review entry
        success, status = Review.create_review_entry({
            "agent_id": data.get('agent_id'),
            "reviewer_id": reviewer_id,
            "reviewer_role": reviewer_role,
            "rating": data.get('rating'),
            "review": data.get('review', '')
        })

        if success:
            return jsonify({"success": True}), status
        else:
            return jsonify({"success": False}), status

# Instantiate the controller to register routes
rate_review_agent_controller = RateReviewAgentController()
