# backend/models/buyer_listing.py
from utils.db import db
from bson import ObjectId
from bson.errors import InvalidId

buyer_listing_collection = db['buyer_shortlists']
used_car_collection = db['used_car_listings']

def serialize_listing(listing):
    if not listing:
        return None
    listing['_id'] = str(listing['_id'])
    listing['seller_id'] = str(listing['seller_id']) if listing.get('seller_id') else None
    listing['created_at'] = listing['created_at'].isoformat() if listing.get('created_at') else None
    return listing

def serialize_listings(listings):
    return [serialize_listing(listing) for listing in listings]

class BuyerListing:
    @staticmethod
    def save_listing(user_id, listing_id):
        """
        Saves a listing to the buyer's shortlist by converting listing_id to ObjectId.
        Returns True if the operation is successful, otherwise False.
        """
        try:
            listing_oid = ObjectId(listing_id)
        except InvalidId:
            print(f"Invalid listing_id: {listing_id}")
            return False  # Indicate failure due to invalid listing_id
        
        result = buyer_listing_collection.update_one(
            {"user_id": user_id},
            {"$addToSet": {"shortlist": listing_oid}},
            upsert=True
        )
        return result.modified_count > 0 or result.upserted_id is not None

    @staticmethod
    def get_shortlist(user_id):
        user = buyer_listing_collection.find_one({"user_id": user_id})
        if user:
            # Convert ObjectIds to strings for consistency in responses
            return [str(oid) for oid in user.get('shortlist', [])]
        return []

    @staticmethod
    def search_shortlist(user_id, query=None, listing_id=None):
        """
        Searches the buyer's shortlist based on the query or listing_id.
        Converts listing_ids to ObjectId before querying.
        Returns a list of listing dictionaries.
        """
        shortlist_doc = buyer_listing_collection.find_one({"user_id": user_id})
        if not shortlist_doc:
            print(f"No shortlist found for user_id: {user_id}")
            return []
        
        shortlist_ids = shortlist_doc.get('shortlist', [])
        # Convert all listing_ids to ObjectIds, skip invalid ones
        valid_ids = []
        for lid in shortlist_ids:
            if isinstance(lid, ObjectId):
                valid_ids.append(lid)
            elif isinstance(lid, str):
                try:
                    valid_ids.append(ObjectId(lid))
                except InvalidId:
                    print(f"Invalid listing_id in shortlist: {lid}")
                    continue  # Skip invalid IDs
        
        if not valid_ids:
            print("No valid listing_ids found in shortlist.")
            return []
        
        # Construct the query
        mongo_query = {
            "_id": {"$in": valid_ids}
        }
        
        if listing_id:
            try:
                listing_oid = ObjectId(listing_id)
                mongo_query["_id"] = listing_oid
            except InvalidId:
                print(f"Invalid listing_id parameter: {listing_id}")
                return []
        elif query:
            # Adjust the query to search within the shortlist
            mongo_query["$or"] = [
                {"make": {"$regex": query, "$options": "i"}},
                {"model": {"$regex": query, "$options": "i"}},
                {"year": {"$regex": query, "$options": "i"}}
            ]
        
        # Perform the search
        return serialize_listings(used_car_collection.find(mongo_query))
