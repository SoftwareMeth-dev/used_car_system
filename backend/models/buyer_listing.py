# backend/models/buyer_listing.py
from utils.db import db

buyer_listing_collection = db['buyer_shortlists']

class BuyerListing:
    @staticmethod
    def save_listing(user_id, listing_id):
        return buyer_listing_collection.update_one(
            {"user_id": user_id},
            {"$addToSet": {"shortlist": listing_id}},
            upsert=True
        )

    @staticmethod
    def get_shortlist(user_id):
        user = buyer_listing_collection.find_one({"user_id": user_id})
        return user.get('shortlist', []) if user else []

    @staticmethod
    def search_shortlist(user_id, query):
        shortlist = buyer_listing_collection.find_one({"user_id": user_id})
        if shortlist:
            return db['used_car_listings'].find({"_id": {"$in": shortlist.get('shortlist', [])}, "$or": [
                {"make": {"$regex": query, "$options": "i"}},
                {"model": {"$regex": query, "$options": "i"}},
                {"year": {"$regex": query, "$options": "i"}}
            ]})
        return []
