# backend/models/review.py
from utils.db import db
from datetime import datetime
from bson import ObjectId
from datetime import datetime

reviews_collection = db['reviews']

class Review:
    @staticmethod
    def create_review(review_data):
        """
        Inserts a new review into the reviews collection.
        """
        review_data['created_at'] = datetime.utcnow()
        return reviews_collection.insert_one(review_data)

    @staticmethod
    def get_reviews_for_agent(agent_id):
        """
        Retrieves all reviews associated with a specific agent.
        """
        return reviews_collection.find({"agent_id": agent_id})

    @staticmethod
    def get_average_rating(agent_id):
        """
        Calculates the average rating for a specific agent.
        """
        pipeline = [
            {"$match": {"agent_id": agent_id}},
            {"$group": {"_id": "$agent_id", "average_rating": {"$avg": "$rating"}}}
        ]
        result = list(reviews_collection.aggregate(pipeline))
        if result:
            return round(result[0]['average_rating'], 2)
        return None
