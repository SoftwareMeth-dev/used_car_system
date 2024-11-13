# backend/controllers/review/edit_review_agent_controller.py

from flask import Blueprint, request, jsonify
from bson import ObjectId
from models.reivew import Review

edit_review_agent_bp = Blueprint('edit_review_agent', __name__, url_prefix='/api')

class EditReviewAgentController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        # Route for editing an existing review
        edit_review_agent_bp.add_url_rule(
            '/edit_review_agent/<review_id>',
            view_func=self.edit_review_agent,
            methods=['PUT']
        )

    def edit_review_agent(self, role, review_id):
        """
        Endpoint to edit an existing review.
        Validates input, ensures the requester is the original reviewer, and updates the review.
        """
        data = request.get_json()
        response, status_code = Review.edit_review_agent(role, review_id, data)
        return jsonify(response), status_code

# Instantiate the controller to register routes
edit_review_agent_controller = EditReviewAgentController()
