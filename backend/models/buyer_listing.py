# backend/models/buyer_listing.py

from utils.db import db
from bson import ObjectId
from bson.errors import InvalidId
from models.user import User 


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
    def save_listing(data):
        """
        Saves a listing to the buyer's shortlist.
        Expects data to contain 'user_id' and 'listing_id'.
        Returns a tuple of (response_dict, status_code).
        """
        user_id = data.get('user_id')
        listing_id = data.get('listing_id')

        if not user_id or not listing_id:
            return {"error": "user_id and listing_id are required."}, 400

        try:
            listing_oid = ObjectId(listing_id)
        except InvalidId:
            return {"error": "Invalid listing_id."}, 400

        try:
            result = buyer_listing_collection.update_one(
                {"user_id": user_id},
                {"$addToSet": {"shortlist": listing_oid}},
                upsert=True
            )
            if result.modified_count > 0 or result.upserted_id is not None:
                return {"message": "Listing saved successfully."}, 200
            else:
                return {"message": "Listing already in shortlist."}, 200
        except Exception as e:
            print(f"Error in BuyerListing.save_listing: {e}")
            return {"error": "Failed to save listing."}, 500

    @staticmethod
    def get_shortlist(user_id):
        """
        Retrieves the user's shortlist with detailed listing information.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            user = buyer_listing_collection.find_one({"user_id": user_id}) 
            if user:
                shortlist_ids = [str(oid) for oid in user.get('shortlist', [])] 
                if not shortlist_ids:
                    return {"shortlist": []}, 200 
                # Fetch all listings in bulk 
                listings_cursor = used_car_collection.find({"_id": {"$in": [ObjectId(lid) for lid in shortlist_ids]}})
 
                listings = list(listings_cursor) 
 
                enriched_shortlist = []
                for listing in listings:
                    listing_id_str = str(listing.get('_id'))
                    make = listing.get('make', 'N/A')
                    model = listing.get('model', 'N/A')
                    year = listing.get('year', 'N/A')
                    price = listing.get('price', 'N/A')
 
                    # Fetch agent_name
                    agent_id = listing.get('agent_id')  
                    if agent_id: 
                        agent_response, agent_status = User.get_user_by_id(agent_id) 
                        if agent_status == 200:
                            agent_name = agent_response.get('user', {}).get('username', 'N/A')
                        else:
                            agent_name = 'N/A' 
                    else:
                        agent_name = 'N/A'
 
                    # Fetch seller_name
                    seller_id = listing.get('seller_id')
                    if seller_id:
                        seller_response, seller_status = User.get_user_by_id(str(seller_id))
                        if seller_status == 200:
                            seller_name = seller_response.get('user', {}).get('username', 'N/A')
                        else:
                            seller_name = 'N/A'
                    else:
                        seller_name = 'N/A'
 
                    enriched_listing = {
                        "listingID": listing_id_str,
                        "make": make,
                        "model": model,
                        "year": year,
                        "price": price,
                        "agent_name": agent_name,
                        "seller_name": seller_name
                    } 
                    enriched_shortlist.append(enriched_listing)

                return {"shortlist": enriched_shortlist}, 200
            return {"shortlist": []}, 200
        except Exception as e: 
            return {"error": "Failed to retrieve shortlist."}, 500

    @staticmethod
    def search_shortlist(data):
        """
        Searches the buyer's shortlist based on query or listing_id.
        Expects data to contain 'user_id' and either 'query' or 'listing_id'.
        Returns a tuple of (response_dict, status_code).
        """
        user_id = data.get('user_id')
        query = data.get('query')
        listing_id = data.get('listing_id')

        if not user_id:
            return {"error": "user_id is required."}, 400

        if not query and not listing_id:
            return {"error": "Either query or listing_id must be provided."}, 400

        try:
            return BuyerListing._search_shortlist_logic(user_id, query, listing_id)
        except Exception as e:
            print(f"Error in BuyerListing.search_shortlist: {e}")
            return {"error": "Failed to search shortlist."}, 500

    @staticmethod
    def _search_shortlist_logic(user_id, query=None, listing_id=None):
        """
        Internal method to handle the search logic.
        """
        shortlist_doc = buyer_listing_collection.find_one({"user_id": user_id})
        if not shortlist_doc:
            return {"listings": []}, 200

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
            return {"listings": []}, 200

        # Construct the query
        mongo_query = {
            "_id": {"$in": valid_ids}
        }

        if listing_id:
            try:
                listing_oid = ObjectId(listing_id)
                mongo_query["_id"] = listing_oid
            except InvalidId:
                return {"error": "Invalid listing_id parameter."}, 400
        elif query:
            mongo_query["$or"] = [
                {"make": {"$regex": query, "$options": "i"}},
                {"model": {"$regex": query, "$options": "i"}},
                {"year": {"$regex": query, "$options": "i"}}
            ]

        # Perform the search using UsedCarListing model
        from models.used_car_listing import UsedCarListing
        listings = UsedCarListing.search_listings_with_query(mongo_query)
        return {"listings": listings}, 200

    @staticmethod
    def remove_from_shortlist(user_id, listing_id):
        """
        Removes a listing from the buyer's shortlist.
        Expects user_id and listing_id as parameters.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            from bson import ObjectId
            from bson.errors import InvalidId
            
            # Validate listing_id
            try:
                listing_oid = ObjectId(listing_id)
            except InvalidId:
                return {"error": "Invalid listing_id."}, 400

            # Update the document to remove the listing from the shortlist
            result = buyer_listing_collection.update_one(
                {"user_id": user_id},
                {"$pull": {"shortlist": listing_oid}}
            )

            if result.modified_count > 0:
                return {"message": "Listing removed successfully."}, 200
            else:
                return {"message": "Listing not found in shortlist or already removed."}, 404
        except Exception as e:
            print(f"Error in BuyerListing.remove_from_shortlist: {e}")
            return {"error": "Failed to remove listing."}, 500
