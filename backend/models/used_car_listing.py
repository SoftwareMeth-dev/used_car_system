# backend/models/used_car_listing.py
from utils.db import db
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId

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

class UsedCarListing:
    @staticmethod
    def create_listing(listing_data):
        """
        Inserts a new listing into the used_car_listings collection.
        Returns True if successful, else False.
        """
        listing_data['created_at'] = datetime.utcnow()
        try:
            result = used_car_collection.insert_one(listing_data)
            return result.inserted_id is not None
        except Exception as e:
            print(f"Error creating listing: {e}")
            return False

    @staticmethod
    def get_all_listings():
        """
        Retrieves all used car listings.
        Returns a list of listing dictionaries.
        """
        listings = used_car_collection.find()
        return serialize_listings(listings)

    @staticmethod
    def get_listing_by_id(listing_id):
        """
        Retrieves a listing by its ObjectId.
        Returns a listing dictionary or None if not found.
        """
        try:
            oid = ObjectId(listing_id)
        except InvalidId:
            print(f"Invalid listing_id: {listing_id}")
            return None
        listing = used_car_collection.find_one({"_id": oid})
        return serialize_listing(listing)

    @staticmethod
    def update_listing(listing_id, update_data):
        """
        Updates a listing's information based on its listing_id.
        Returns True if the update was successful, else False.
        """
        try:
            oid = ObjectId(listing_id)
        except InvalidId:
            print(f"Invalid listing_id: {listing_id}")
            return False
        
        try:
            result = used_car_collection.update_one(
                {"_id": oid},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating listing_id {listing_id}: {e}")
            return False

    @staticmethod
    def delete_listing(listing_id):
        """
        Deletes a listing based on its listing_id.
        Returns True if the deletion was successful, else False.
        """
        try:
            oid = ObjectId(listing_id)
        except InvalidId:
            print(f"Invalid listing_id: {listing_id}")
            return False
        
        try:
            result = used_car_collection.delete_one({"_id": oid})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting listing_id {listing_id}: {e}")
            return False

    @staticmethod
    def search_listings(query):
        """
        Searches listings based on a query string matching make, model, or year.
        Returns a list of matching listing dictionaries.
        """
        try:
            return serialize_listings(
                used_car_collection.find({"$or": [
                    {"make": {"$regex": query, "$options": "i"}},
                    {"model": {"$regex": query, "$options": "i"}},
                    {"year": {"$regex": query, "$options": "i"}}
                ]})
            )
        except Exception as e:
            print(f"Error searching listings with query '{query}': {e}")
            return []
