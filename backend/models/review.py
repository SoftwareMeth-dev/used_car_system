# backend/models/review_model.py

from utils.db import db
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from models.user import User

reviews_collection = db['reviews']
used_car_collection = db['used_car_listings']  # Importing the used_car_listings collection



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
    def rate_and_review_agent(role, user_id, listing_id, data):
        """
        Handles the logic for rating and reviewing an agent based on user_id and listing_id.
        Validates input, fetches agent_id from listing, and creates a review entry.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            # Validate the role
            if role not in ['buyer', 'seller']:
                return {"error": "Invalid role specified. Must be 'buyer' or 'seller'."}, 400

            if not data:
                return {"error": "No input data provided."}, 400

            # Define required fields
            required_fields = ["rating"]
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return {"error": f"Missing required fields: {', '.join(missing_fields)}."}, 400

            # Extract fields
            rating = data.get('rating')
            review_text = data.get('review', '')

            # Validate rating
            if not isinstance(rating, (int, float)) or not (1 <= rating <= 5):
                return {"error": "Rating must be a number between 1 and 5."}, 400

            # Validate user_id and listing_id
            try:
                user_oid = user_id
                listing_id_str = listing_id
                listing_oid = ObjectId(listing_id)
            except (InvalidId, TypeError) as e:
                return {"error": "Invalid user_id or listing_id format."}, 400

            # Fetch the user
            user = User.get_user_by_id(user_oid)
            if not user:
                return {"error": "User not found."}, 404

            # Fetch the listing
            listing = used_car_collection.find_one({"_id": listing_oid})
            if not listing:
                return {"error": "Listing not found."}, 404

            agent_id = listing.get('seller_id')  # Assuming 'seller_id' is the agent
            if not agent_id:
                return {"error": "Agent associated with the listing not found."}, 404

            # # Prevent users from reviewing themselves if agent_id and user_id are the same
            # if agent_id == user_oid:
            #     return {"error": "You cannot review yourself."}, 403
                
            # Check if the combination of agent_id, listing_id, and reviewer_id already exists
            existing_review = reviews_collection.find_one({
                "agent_id": agent_id,
                "listing_id": listing_oid,
                "reviewer_id": user_oid
            })
            if existing_review:
                logger.warning(f"User {user_id} has already reviewed agent {agent_id} for listing {listing_id}.")
                return {"error": "You have already reviewed this agent for this listing."}, 400

            # Create the review entry
            review = {
                "agent_id": agent_id,
                "reviewer_id": user_oid,
                "reviewer_role": role,  # 'buyer' or 'seller'
                "rating": rating,
                "review": review_text,
                "listing_id": listing_id_str,
                "created_at": datetime.utcnow()
            }

            success = Review.create_review(review)
            if success:
                return {"success": True, "message": "Review created successfully."}, 201
            else:
                return {"success": False, "error": "Failed to create review."}, 500

        except Exception as e:
            logger.exception(f"Error in Review.rate_and_review_agent: {e}")
            return {"error": "An error occurred while processing the review."}, 500

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
            logger.exception(f"Error creating review: {e}")
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
            logger.exception(f"Error in Review.get_reviews_and_average: {e}")
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
            logger.exception(f"Error fetching reviews for agent {agent_id}: {e}")
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
            logger.exception(f"Error calculating average rating for agent {agent_id}: {e}")
            return None
    @staticmethod
    def edit_review_agent(review_id, data):
        """
        Edits an existing review.
        Validates input, ensures the requester is the original reviewer, and updates the review.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            # Validate and convert review_id to ObjectId
            try:
                review_obj_id = ObjectId(review_id)
            except InvalidId:
                return {"error": "Invalid review_id format."}, 400

            # Fetch the existing review
            existing_review = reviews_collection.find_one({"_id": review_obj_id})
            if not existing_review:
                return {"error": "Review not found."}, 404

            # Extract data from request
            reviewer_id = data.get("reviewer_id")
            reviewer_role = data.get("reviewer_role")
            rating = data.get("rating")
            review_text = data.get("review", "")  # Optional field

            # Basic validation (more can be added as needed)
            if not reviewer_id:
                return {"error": "Missing 'reviewer_id'."}, 400
            if not reviewer_role:
                return {"error": "Missing 'reviewer_role'."}, 400
            if rating is None:
                return {"error": "Missing 'rating'."}, 400

            # Convert reviewer_id to ObjectId
            try:
                reviewer_obj_id = ObjectId(reviewer_id)
            except InvalidId:
                return {"error": "Invalid reviewer_id format."}, 400

            # Ensure the requester is the original reviewer
            if existing_review.get('reviewer_id') != reviewer_id:
                return {"error": "Unauthorized. You can only edit your own reviews."}, 403

            # Validate rating
            if not isinstance(rating, (int, float)) or not (1 <= rating <= 5):
                return {"error": "Rating must be a number between 1 and 5."}, 400

            # Prepare the update fields
            update_fields = {
                "rating": rating,
                "review": review_text, 
            }

            # Update the review in the database
            result = reviews_collection.update_one(
                {"_id": review_obj_id},
                {"$set": update_fields}
            )

            if result.modified_count > 0:
                return {"success": True, "message": "Review updated successfully."}, 200
            else:
                return {"success": False, "message": "No changes made to the review."}, 200

        except Exception as e:
            logging.exception(f"Error in Review.edit_review_agent: {e}")
            return {"error": "An error occurred while editing the review."}, 500

