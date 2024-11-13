# backend/models/used_car_listing_model.py

import logging
from utils.db import db
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from marshmallow import Schema, fields, ValidationError

# Configure Logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

used_car_collection = db['used_car_listings']
reviews_collection = db['reviews']  # Added Reviews Collection

def serialize_listing(listing):
    if not listing:
        return None
    listing['_id'] = str(listing['_id'])
    listing['seller_id'] = str(listing['seller_id']) if listing.get('seller_id') else None
    listing['created_at'] = listing['created_at'].isoformat() if listing.get('created_at') else None
    listing['views'] = listing.get('views', 0)  # Ensure views are included
    listing['shortlists'] = listing.get('shortlists', 0)  # Ensure shortlists are included
    logger.debug(f"Serialized listing: {listing}")
    return listing

def serialize_listings(listings):
    return [serialize_listing(listing) for listing in listings]

class CreateListingSchema(Schema):
    seller_id = fields.Str(required=True)
    make = fields.Str(required=True)
    model = fields.Str(required=True)
    year = fields.Int(required=True)
    price = fields.Float(required=True)
    
    # Add other necessary fields here

class UpdateListingSchema(Schema):
    make = fields.Str()
    model = fields.Str()
    year = fields.Int()
    price = fields.Float()
    # Optionally include views and shortlists if you want to allow their updates
    # views = fields.Int()
    # shortlists = fields.Int()
    # Add other fields that can be updated

class UsedCarListing:
    @staticmethod
    def create_listing(listing_data):
        """
        Creates a new used car listing.
        Validates input data and inserts into the database.
        Returns a tuple of (response_dict, status_code).
        """
        schema = CreateListingSchema()
        try:
            validated_data = schema.load(listing_data)
        except ValidationError as err:
            logger.warning(f"Validation errors during listing creation: {err.messages}")
            return {"error": err.messages}, 400  # Bad Request

        # Initialize views and shortlists to 0
        validated_data['views'] = 0
        validated_data['shortlists'] = 0
        validated_data['created_at'] = datetime.utcnow()
        try:
            result = used_car_collection.insert_one(validated_data)
            if result.inserted_id:
                logger.info(f"Listing created successfully with ID: {result.inserted_id}")
                return {
                    "message": "Listing created successfully.",
                    "listing_id": str(result.inserted_id)
                }, 201  # Created
            logger.error("Failed to create listing without exception.")
            return {"error": "Failed to create listing."}, 500  # Internal Server Error
        except Exception as e:
            logger.exception(f"Exception during listing creation: {e}")
            return {"error": "An error occurred while creating the listing."}, 500  # Internal Server Error

    @staticmethod
    def get_all_listings():
        """
        Retrieves all used car listings.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            listings = used_car_collection.find()
            serialized = serialize_listings(listings)
            logger.info("Retrieved all listings successfully.")
            return {"listings": serialized}, 200
        except Exception as e:
            logger.exception(f"Exception during retrieving all listings: {e}")
            return {"error": "Failed to retrieve listings."}, 500  # Internal Server Error

    @staticmethod
    def get_listing_by_id(listing_id):
        """
        Retrieves a listing by its listing_id.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            oid = ObjectId(listing_id)
        except Exception as e:
            logger.error(f"Invalid listing_id format: {listing_id}. Error: {e}")
            return {"error": "Invalid listing_id."}, 400  # Bad Request

        try:
            listing = used_car_collection.find_one({"_id": oid})
            if listing:
                serialized = serialize_listing(listing)
                logger.info(f"Retrieved listing with ID: {listing_id}")
                return {"listing": serialized}, 200
            logger.warning(f"Listing not found with ID: {listing_id}")
            return {"error": "Listing not found."}, 404  # Not Found
        except Exception as e:
            logger.exception(f"Exception during retrieving listing by ID: {e}")
            return {"error": "Failed to retrieve listing."}, 500  # Internal Server Error

    @staticmethod
    def update_listing(listing_id, update_data):
        """
        Updates a listing's information based on its listing_id.
        Validates input data and updates the database.
        Returns a tuple of (response_dict, status_code).
        """
        if not update_data:
            logger.warning("No update data provided.")
            return {"error": "No update data provided."}, 400  # Bad Request

        schema = UpdateListingSchema()
        try:
            validated_data = schema.load(update_data)
        except ValidationError as err:
            logger.warning(f"Validation errors during listing update: {err.messages}")
            return {"error": err.messages}, 400  # Bad Request

        try:
            oid = ObjectId(listing_id)
        except InvalidId:
            logger.warning(f"Invalid listing_id format: {listing_id}")
            return {"error": "Invalid listing_id."}, 400  # Bad Request

        try:
            # Authorization: Ensure the agent owns the listing
            listing = used_car_collection.find_one({"_id": oid})
            if not listing:
                logger.warning(f"Listing not found with ID: {listing_id}")
                return {"error": "Listing not found."}, 404  # Not Found
            if listing.get('seller_id') != ObjectId(validated_data.get('seller_id', listing.get('seller_id'))):
                logger.warning(f"Agent {validated_data.get('seller_id')} does not own listing {listing_id}")
                return {"error": "You do not have permission to update this listing."}, 403  # Forbidden

            result = used_car_collection.update_one(
                {"_id": oid},
                {"$set": validated_data}
            )
            if result.modified_count > 0:
                logger.info(f"Listing with ID {listing_id} updated successfully.")
                return {"message": "Listing updated successfully."}, 200
            logger.warning(f"No changes made to listing with ID: {listing_id}")
            return {"message": "No changes made to the listing."}, 200
        except Exception as e:
            logger.exception(f"Exception during listing update: {e}")
            return {"error": "Failed to update listing."}, 500  # Internal Server Error

    @staticmethod
    def delete_listing(listing_id):
        """
        Deletes a listing based on its listing_id.
        Ensures that only the owner can delete the listing.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            oid = ObjectId(listing_id)
        except InvalidId:
            logger.warning(f"Invalid listing_id format: {listing_id}")
            return {"error": "Invalid listing_id."}, 400  # Bad Request

        try:
            # Authorization: Ensure the agent owns the listing
            listing = used_car_collection.find_one({"_id": oid})
            if not listing:
                logger.warning(f"Listing not found for deletion with ID: {listing_id}")
                return {"error": "Listing not found."}, 404  # Not Found 

            result = used_car_collection.delete_one({"_id": oid})
            if result.deleted_count > 0:
                logger.info(f"Listing with ID {listing_id} deleted successfully.")
                return {"message": "Listing deleted successfully."}, 200
            logger.warning(f"Listing not found for deletion with ID: {listing_id}")
            return {"error": "Listing not found."}, 404  # Not Found
        except Exception as e:
            logger.exception(f"Exception during listing deletion: {e}")
            return {"error": "Failed to delete listing."}, 500  # Internal Server Error

    @staticmethod
    def search_listings(query):
        """
        Searches listings based on a query string matching make, model, or year.
        Validates input and performs the search.
        Returns a tuple of (response_dict, status_code).
        """
        if not query:
            logger.warning("Search query parameter is missing.")
            return {"error": "Query parameter is required."}, 400  # Bad Request

        try:
            listings = used_car_collection.find({
                "$or": [
                    {"make": {"$regex": query, "$options": "i"}},
                    {"model": {"$regex": query, "$options": "i"}},
                    {"year": {"$regex": query, "$options": "i"}}
                ]
            }) 
            serialized = serialize_listings(listings) 
            logger.info(f"Search completed for query: {query}")
            return {"listings": serialized}, 200
        except Exception as e:
            logger.exception(f"Exception during searching listings: {e}")
            return {"error": "Failed to search listings."}, 500  # Internal Server Error

    @staticmethod
    def search_cars(query):
        """
        Wrapper method for controller to search cars.
        """
        return UsedCarListing.search_listings(query)

    @staticmethod
    def search_listings_with_query(mongo_query):
        """
        Searches listings based on a pre-constructed MongoDB query.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            listings = used_car_collection.find(mongo_query)
            serialized = serialize_listings(listings)
            logger.info(f"Search completed for MongoDB query: {mongo_query}")
            return {"listings": serialized}, 200
        except Exception as e:
            logger.exception(f"Exception during advanced searching listings: {e}")
            return {"error": "Failed to search listings."}, 500  # Internal Server Error

    @staticmethod
    def track_view(data):
        """
        Increments the view count for a listing.
        Expects data to contain 'listing_id'.
        Returns a tuple of (response_dict, status_code).
        """
        listing_id = data.get('listing_id')
        if not listing_id:
            logger.warning("Missing 'listing_id' in request data.")
            return {"error": "Missing 'listing_id'."}, 400  # Bad Request

        try:
            # Update the used_car_collection by incrementing 'views'
            result = used_car_collection.update_one(
                {"_id": ObjectId(listing_id)},
                {"$inc": {"views": 1}}
            )

            if result.matched_count == 0:
                logger.warning(f"Listing with listing_id {listing_id} not found.")
                return {"error": "Listing not found."}, 404  # Not Found

            logger.info(f"View tracked for listing_id: {listing_id}")
            return {"success": True}, 200

        except Exception as e:
            logger.exception(f"Error tracking view for listing_id {listing_id}: {e}")
            return {"success": False, "error": "Failed to track view."}, 500

    @staticmethod
    def track_shortlist(data):
        """
        Increments the shortlist count for a listing.
        Expects data to contain 'listing_id'.
        Returns a tuple of (response_dict, status_code).
        """
        listing_id = data.get('listing_id')
        if not listing_id:
            logger.warning("Missing 'listing_id' in request data.")
            return {"error": "Missing 'listing_id'."}, 400  # Bad Request

        try:
            # Update the used_car_collection by incrementing 'shortlists'
            result = used_car_collection.update_one(
                {"_id": ObjectId(listing_id)},
                {"$inc": {"shortlists": 1}}
            )

            if result.matched_count == 0:
                logger.warning(f"Listing with listing_id {listing_id} not found.")
                return {"error": "Listing not found."}, 404  # Not Found

            logger.info(f"Shortlist tracked for listing_id: {listing_id}")
            return {"success": True}, 200

        except Exception as e:
            logger.exception(f"Error tracking shortlist for listing_id {listing_id}: {e}")
            return {"success": False, "error": "Failed to track shortlist."}, 500

    @staticmethod
    def get_metrics(listing_id):
        """
        Retrieves metrics for a specific listing.
        Returns a tuple of (response_dict, status_code).
        """
        if not listing_id:
            logger.warning("Missing 'listing_id' parameter.")
            return {"error": "Missing 'listing_id' parameter."}, 400  # Bad Request

        try:
            listing = used_car_collection.find_one({"_id": ObjectId(listing_id)})
            if listing:
                metrics = {
                    "views": listing.get("views", 0),
                    "shortlists": listing.get("shortlists", 0)
                }
                logger.info(f"Metrics retrieved for listing_id: {listing_id}")
                return {"metrics": metrics}, 200
            else:
                logger.warning(f"No listing found for listing_id: {listing_id}")
                return {"error": "Listing not found."}, 404  # Not Found
        except Exception as e:
            logger.exception(f"Error retrieving metrics for listing_id {listing_id}: {e}")
            return {"error": "Failed to retrieve metrics."}, 500

    @staticmethod
    def get_metrics_by_seller(seller_id):
        """
        Retrieves metrics for all listings of a specific seller.
        Returns a tuple of (response_dict, status_code).
        """
        if not seller_id:
            logger.warning("Missing 'seller_id' parameter.")
            return {"error": "Missing 'seller_id' parameter."}, 400  # Bad Request

        try:
            # Step 1: Retrieve all listings for the seller
            listings_cursor = used_car_collection.find({"seller_id": ObjectId(seller_id)})
            listings = list(listings_cursor)

            if not listings:
                logger.warning(f"No listings found for seller_id: {seller_id}")
                return {"error": "No listings found for the provided seller_id."}, 404  # Not Found

            # Step 2: Combine listings with their metrics
            combined_listings = []
            for listing in listings:
                combined_listing = {
                    "listing_id": str(listing.get("_id", "")),
                    "make": listing.get("make", ""),
                    "model": listing.get("model", ""),
                    "year": listing.get("year", ""),
                    "price": listing.get("price", 0),
                    "views": listing.get("views", 0),
                    "shortlists": listing.get("shortlists", 0),
                    "created_at": listing.get("created_at").isoformat() if listing.get("created_at") else "",
                    # Add other fields as necessary
                }
                combined_listings.append(combined_listing)

            logger.info(f"Metrics retrieved for seller_id: {seller_id}")
            return {"listings": combined_listings}, 200

        except Exception as e:
            logger.exception(f"Error retrieving metrics for seller_id {seller_id}: {e}")
            return {"error": "Failed to retrieve metrics for the seller."}, 500

    @staticmethod
    def get_listings_with_reviews(seller_id):
        """
        Retrieves all listings by the seller and appends the corresponding review_id if available.
        
        Parameters:
            seller_id (str): The ObjectId string of the seller.
            
        Returns:
            JSON response containing the listings with appended review_id.
        """
         
        try:
            # Validate and convert seller_id to ObjectId
            seller_oid = seller_id
        except Exception as e:
            logger.error(f"Invalid seller_id format: {seller_id}. Error: {e}")
            return {"error": "Invalid seller_id format."}, 400  # Bad Request
        try:
            # Step 1: Query all listings by the seller  
            seller_listings_cursor = used_car_collection.find({'seller_id': seller_oid}) 
            seller_listings = list(seller_listings_cursor)  
            
            if not seller_listings:
                logger.info(f"No listings found for seller_id: {seller_id}")
                return {"message": "No listings found for this seller.", "listings": []}, 200  # OK

            # Extract listing_ids for querying reviews
            listing_ids = [listing['_id'] for listing in seller_listings]

            # Step 2: Query all reviews where reviewer_id matches seller_id and listing_id is in listing_ids
            seller_reviews_cursor = reviews_collection.find({
                'reviewer_id': seller_oid,
                'listing_id': {'$in': listing_ids}
            })
            seller_reviews = list(seller_reviews_cursor)

            # Create a mapping from listing_id to review_id
            review_map = {}
            for review in seller_reviews:
                listing_id_str = str(review['listing_id'])
                review_map[listing_id_str] = str(review['_id'])

            # Step 3: Append review_id to each listing
            augmented_listings = []
            for listing in seller_listings:
                listing_id_str = str(listing['_id'])
                augmented_listing = {
                    'listing_id': listing_id_str,
                    'make': listing.get('make', ''),
                    'model': listing.get('model', ''),
                    'year': listing.get('year', ''),
                    'price': listing.get('price', 0),
                    'views': listing.get('views', 0),
                    'shortlists': listing.get('shortlists', 0),
                    'created_at': listing.get('created_at').isoformat() if listing.get('created_at') else '',
                    'review_id': review_map.get(listing_id_str, None)
                }
                augmented_listings.append(augmented_listing)

            logger.info(f"Retrieved {len(augmented_listings)} listings for seller_id: {seller_id}")
            return {"listings": augmented_listings}, 200  # OK

        except Exception as e:
            logger.exception(f"Error retrieving listings with reviews for seller_id {seller_id}: {e}")
            return {"error": "Failed to retrieve listings with reviews."}, 500  # Internal Server Error

    @staticmethod
    def track_view(data):
        """
        Increments the view count for a listing.
        Expects data to contain 'listing_id'.
        Returns a tuple of (response_dict, status_code).
        """
        listing_id = data.get('listing_id')
        if not listing_id:
            logger.warning("Missing 'listing_id' in request data.")
            return {"error": "Missing 'listing_id'."}, 400  # Bad Request

        try:
            # Update the used_car_collection by incrementing 'views'
            result = used_car_collection.update_one(
                {"_id": ObjectId(listing_id)},
                {"$inc": {"views": 1}}
            )

            if result.matched_count == 0:
                logger.warning(f"Listing with listing_id {listing_id} not found.")
                return {"error": "Listing not found."}, 404  # Not Found

            logger.info(f"View tracked for listing_id: {listing_id}")
            return {"success": True}, 200

        except Exception as e:
            logger.exception(f"Error tracking view for listing_id {listing_id}: {e}")
            return {"success": False, "error": "Failed to track view."}, 500

    @staticmethod
    def track_shortlist(data):
        """
        Increments the shortlist count for a listing.
        Expects data to contain 'listing_id'.
        Returns a tuple of (response_dict, status_code).
        """
        listing_id = data.get('listing_id')
        if not listing_id:
            logger.warning("Missing 'listing_id' in request data.")
            return {"error": "Missing 'listing_id'."}, 400  # Bad Request

        try:
            # Update the used_car_collection by incrementing 'shortlists'
            result = used_car_collection.update_one(
                {"_id": ObjectId(listing_id)},
                {"$inc": {"shortlists": 1}}
            )

            if result.matched_count == 0:
                logger.warning(f"Listing with listing_id {listing_id} not found.")
                return {"error": "Listing not found."}, 404  # Not Found

            logger.info(f"Shortlist tracked for listing_id: {listing_id}")
            return {"success": True}, 200

        except Exception as e:
            logger.exception(f"Error tracking shortlist for listing_id {listing_id}: {e}")
            return {"success": False, "error": "Failed to track shortlist."}, 500

    @staticmethod
    def get_metrics(listing_id):
        """
        Retrieves metrics for a specific listing.
        Returns a tuple of (response_dict, status_code).
        """
        if not listing_id:
            logger.warning("Missing 'listing_id' parameter.")
            return {"error": "Missing 'listing_id' parameter."}, 400  # Bad Request

        try:
            listing = used_car_collection.find_one({"_id": ObjectId(listing_id)})
            if listing:
                metrics = {
                    "views": listing.get("views", 0),
                    "shortlists": listing.get("shortlists", 0)
                }
                logger.info(f"Metrics retrieved for listing_id: {listing_id}")
                return {"metrics": metrics}, 200
            else:
                logger.warning(f"No listing found for listing_id: {listing_id}")
                return {"error": "Listing not found."}, 404  # Not Found
        except Exception as e:
            logger.exception(f"Error retrieving metrics for listing_id {listing_id}: {e}")
            return {"error": "Failed to retrieve metrics."}, 500

    @staticmethod
    def get_metrics_by_seller(seller_id):
        """
        Retrieves metrics for all listings of a specific seller.
        Returns a tuple of (response_dict, status_code).
        """
        if not seller_id:
            logger.warning("Missing 'seller_id' parameter.")
            return {"error": "Missing 'seller_id' parameter."}, 400  # Bad Request

        try:
            # Step 1: Retrieve all listings for the seller
            listings_cursor = used_car_collection.find({"seller_id": ObjectId(seller_id)})
            listings = list(listings_cursor)

            if not listings:
                logger.warning(f"No listings found for seller_id: {seller_id}")
                return {"error": "No listings found for the provided seller_id."}, 404  # Not Found

            # Step 2: Combine listings with their metrics
            combined_listings = []
            for listing in listings:
                combined_listing = {
                    "listing_id": str(listing.get("_id", "")),
                    "make": listing.get("make", ""),
                    "model": listing.get("model", ""),
                    "year": listing.get("year", ""),
                    "price": listing.get("price", 0),
                    "views": listing.get("views", 0),
                    "shortlists": listing.get("shortlists", 0),
                    "created_at": listing.get("created_at").isoformat() if listing.get("created_at") else "",
                    # Add other fields as necessary
                }
                combined_listings.append(combined_listing)

            logger.info(f"Metrics retrieved for seller_id: {seller_id}")
            return {"listings": combined_listings}, 200

        except Exception as e:
            logger.exception(f"Error retrieving metrics for seller_id {seller_id}: {e}")
            return {"error": "Failed to retrieve metrics for the seller."}, 500

 