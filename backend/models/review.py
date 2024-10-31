# backend/models/review.py
from utils.db import db
from bson import ObjectId
from datetime import datetime

# Import User model
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
    def create_review(review_data):
        """
        Inserts a new review into the reviews collection.
        Returns True if successful, else False.
        """
        review_data['created_at'] = datetime.utcnow()
        try:
            result = reviews_collection.insert_one(review_data)
            return result.inserted_id is not None
        except Exception as e:
            print(f"Error creating review: {e}")
            return False

    @staticmethod
    def get_reviews_for_agent(agent_id):
        """
        Retrieves all reviews associated with a specific agent.
        Returns a list of review dictionaries.
        """
        reviews = reviews_collection.find({"agent_id": agent_id})
        return serialize_reviews(reviews)

    @staticmethod
    def get_average_rating(agent_id):
        """
        Calculates the average rating for a specific agent.
        Returns the average rating as a float rounded to 2 decimal places, or None if no reviews exist.
        """
        pipeline = [
            {"$match": {"agent_id": agent_id}},
            {"$group": {"_id": "$agent_id", "average_rating": {"$avg": "$rating"}}}
        ]
        result = list(reviews_collection.aggregate(pipeline))
        if result:
            return round(result[0]['average_rating'], 2)
        return None

    @staticmethod
    def create_review_entry(data):
        """
        Creates a review from either a buyer or a seller.
        Returns a tuple (success: bool, status_code: int).
        """ 
        required_fields = ['agent_id', 'rating', 'reviewer_id', 'reviewer_role']
        if not all(field in data for field in required_fields):
            return False, 400  # Bad Request

        rating = data.get('rating') 
        if not isinstance(rating, (int, float)) or not (1 <= rating <= 5):
            return False, 400  # Bad Request
        print(data['agent_id'])
        agent = User.get_user_by_id(data['agent_id']) 
        if not agent or agent.get('role') != 'used_car_agent':
            return False, 404  # Not Found

        reviewer = User.get_user_by_id(data['reviewer_id'])
        print(reviewer)
        print("-"*100)
        if not reviewer or reviewer.get('role') != data['reviewer_role']:
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
