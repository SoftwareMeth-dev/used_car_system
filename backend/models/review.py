# backend/models/review_model.py

from utils.db import db
from bson import ObjectId
from datetime import datetime
from models.user import User

reviews_collection = db['reviews']

def serialize_review(review):
    if not review:
        return None
    review['_id'] = str(review['_id'])
    review['created_at'] = review['created_at'].isoformat() if review.get('created_at') else None
    return review

def serialize_reviews(reviews):
    return [serialize_review(review) for review in reviews]

class Review:
    @staticmethod
    def rate_and_review_agent(role, data):
        """
        Handles the logic for rating and reviewing an agent.
        Validates input, checks user roles, and creates a review entry.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            # Validate the role
            if role not in ['buyer', 'seller']:
                return {"error": "Invalid role specified."}, 400

            if not data:
                return {"error": "No input data provided."}, 400

            # Define required fields based on role
            required_fields = ["agent_id", f"{role}_id", "rating"]
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return {"error": f"Missing required fields: {', '.join(missing_fields)}."}, 400

            # Extract reviewer_id based on role
            reviewer_id = data.get(f"{role}_id")
            reviewer_role = role

            # Delegate to create_review_entry method
            success, status = Review.create_review_entry({
                "agent_id": data.get('agent_id'),
                "reviewer_id": reviewer_id,
                "reviewer_role": reviewer_role,
                "rating": data.get('rating'),
                "review": data.get('review', '')
            })

            if success:
                return {"success": True}, status
            else:
                return {"success": False}, status

        except Exception as e:
            print(f"Error in Review.rate_and_review_agent: {e}")
            return {"error": "An error occurred while processing the review."}, 500

    @staticmethod
    def create_review_entry(data):
        """
        Creates a review from either a buyer or a seller.
        Returns a tuple (success: bool, status_code: int).
        """
        required_fields = ['agent_id', 'rating', 'reviewer_id', 'reviewer_role']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return False, 400  # Bad Request

        rating = data.get('rating') 
        if not isinstance(rating, (int, float)) or not (1 <= rating <= 5):
            return False, 400  # Bad Request

        # Validate agent existence
        agent = User.get_user_by_id(data['agent_id'])
        if not agent:
            return False, 404  # Not Found

        # Validate reviewer existence and role
        reviewer = User.get_user_by_id(data['reviewer_id'])
        if not reviewer:
            return False, 400  # Bad Request

        review = {
            "agent_id": data['agent_id'],
            "reviewer_id": data['reviewer_id'],
            "reviewer_role": data['reviewer_role'],  # 'buyer' or 'seller'
            "rating": rating,
            "review": data.get('review', ''),
            "created_at": datetime.utcnow()
        }

        success = Review.create_review(review)
        return (success, 201) if success else (False, 500)  # Created or Internal Server Error

    @staticmethod
    def create_review(review_data):
        """
        Inserts a new review into the reviews collection.
        Returns True if successful, else False.
        """
        try:
            result = reviews_collection.insert_one(review_data)
            return result.inserted_id is not None
        except Exception as e:
            print(f"Error creating review: {e}")
            return False

    @staticmethod
    def get_reviews_and_average(agent_id):
        """
        Retrieves all reviews and calculates the average rating for a specific agent.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            # Verify agent existence
            agent = User.get_user_by_id(agent_id)
            if not agent:
                return {"error": "Agent not found."}, 404  # Not Found

            reviews = Review.get_reviews_for_agent(agent_id)
            average_rating = Review.get_average_rating(agent_id)
            return {"reviews": reviews, "average_rating": average_rating}, 200

        except Exception as e:
            print(f"Error in Review.get_reviews_and_average: {e}")
            return {"error": "An error occurred while retrieving reviews."}, 500

    @staticmethod
    def get_reviews_for_agent(agent_id):
        """
        Retrieves all reviews associated with a specific agent.
        Returns a list of review dictionaries.
        """
        try:
            reviews = reviews_collection.find({"agent_id": agent_id})
            return serialize_reviews(reviews)
        except Exception as e:
            print(f"Error fetching reviews for agent {agent_id}: {e}")
            return []

    @staticmethod
    def get_average_rating(agent_id):
        """
        Calculates the average rating for a specific agent.
        Returns the average rating as a float rounded to 2 decimal places, or None if no reviews exist.
        """
        try:
            pipeline = [
                {"$match": {"agent_id": agent_id}},
                {"$group": {"_id": "$agent_id", "average_rating": {"$avg": "$rating"}}}
            ]
            result = list(reviews_collection.aggregate(pipeline))
            if result:
                return round(result[0]['average_rating'], 2)
            return None
        except Exception as e:
            print(f"Error calculating average rating for agent {agent_id}: {e}")
            return None

    @staticmethod
    def edit_review_agent(role, review_id, data):
        """
        Handles the logic for editing an existing review.
        Validates input, ensures the requester is the original reviewer, and updates the review.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            if role not in ['buyer', 'seller']:
                return {"error": "Invalid role specified."}, 400

            if not data:
                return {"error": "No input data provided."}, 400

            # Define required fields
            required_fields = ["rating"]
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return {"error": f"Missing required fields: {', '.join(missing_fields)}."}, 400

            # Validate rating
            rating = data.get('rating')
            if not isinstance(rating, (int, float)) or not (1 <= rating <= 5):
                return {"error": "Rating must be a number between 1 and 5."}, 400

            # Optional field: review
            review_text = data.get('review', '')

            # Fetch the existing review
            existing_review = reviews_collection.find_one({"_id": ObjectId(review_id)})
            if not existing_review:
                return {"error": "Review not found."}, 404

            # Ensure the reviewer_role matches
            if existing_review.get('reviewer_role') != role:
                return {"error": "Role mismatch. Cannot edit this review."}, 403

            # Assuming that the requester is sending their reviewer_id for authorization
            reviewer_id = data.get('reviewer_id')
            if not reviewer_id:
                return {"error": "Missing 'reviewer_id' in request data for authorization."}, 400

            if existing_review.get('reviewer_id') != reviewer_id:
                return {"error": "Unauthorized. You can only edit your own reviews."}, 403

            # Proceed to update the review
            update_fields = {
                "rating": rating,
                "review": review_text,
                "updated_at": datetime.utcnow()
            }

            result = reviews_collection.update_one(
                {"_id": ObjectId(review_id)},
                {"$set": update_fields}
            )

            if result.modified_count > 0:
                return {"success": True, "message": "Review updated successfully."}, 200
            else:
                return {"success": False, "message": "No changes made to the review."}, 200

        except Exception as e:
            print(f"Error in Review.edit_review_agent: {e}")
            return {"error": "An error occurred while editing the review."}, 500
