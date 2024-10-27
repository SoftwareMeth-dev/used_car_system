# backend/models/used_car_listing.py
from utils.db import db
from datetime import datetime
from bson import ObjectId  # Import ObjectId for handling MongoDB IDs

used_car_collection = db['used_car_listings']

class UsedCarListing:
    @staticmethod
    def create_listing(listing_data):
        listing_data['created_at'] = datetime.utcnow()
        return used_car_collection.insert_one(listing_data)

    @staticmethod
    def get_all_listings():
        return used_car_collection.find()

    @staticmethod
    def get_listing_by_id(listing_id):
        return used_car_collection.find_one({"_id": listing_id})
    def update_listing(listing_id, update_data):
        # Ensure listing_id is an ObjectId
        if not isinstance(listing_id, ObjectId):
            listing_id = ObjectId(listing_id)

        # Debug message for the listing update operation
        print(f"Attempting to update listing with ID: {listing_id}")
        print(f"Update data: {update_data}")
        
        # Perform the update
        result = used_car_collection.update_one({"_id": listing_id}, {"$set": update_data})
        
        # Print the result of the update operation
        if result.matched_count:
            print(f"Listing with ID {listing_id} updated successfully.")
        else:
            print(f"No listing found with ID {listing_id}. Update failed.")
        
        return result

    @staticmethod
    def delete_listing(listing_id):
        # Ensure listing_id is an ObjectId
        if not isinstance(listing_id, ObjectId):
            listing_id = ObjectId(listing_id)

        # Debug message for the listing delete operation
        print(f"Attempting to delete listing with ID: {listing_id}")
        
        # Perform the delete
        result = used_car_collection.delete_one({"_id": listing_id})
        
        # Print the result of the delete operation
        if result.deleted_count:
            print(f"Listing with ID {listing_id} deleted successfully.")
        else:
            print(f"No listing found with ID {listing_id}. Deletion failed.")
        
        return result

    @staticmethod
    def search_listings(query):
        return used_car_collection.find({"$or": [
            {"make": {"$regex": query, "$options": "i"}},
            {"model": {"$regex": query, "$options": "i"}},
            {"year": {"$regex": query, "$options": "i"}}
        ]})
