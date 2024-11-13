import logging
from utils.db import db
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from marshmallow import Schema, fields, ValidationError, validates_schema

# Configure Logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

used_car_collection = db['used_car_listings']
reviews_collection = db['reviews']  # Added Reviews Collection
users_collection = db['users']      # Added Users Collection

def serialize_listing(listing):
    if not listing:
        return None
    listing['_id'] = str(listing['_id'])
    listing['agent_id'] = str(listing['agent_id']) if listing.get('agent_id') else None
    listing['seller_id'] = str(listing['seller_id']) if listing.get('seller_id') else None
    listing['created_at'] = listing['created_at'].isoformat() if listing.get('created_at') else None
    listing['views'] = listing.get('views', 0)  # Ensure views are included
    listing['shortlists'] = listing.get('shortlists', 0)  # Ensure shortlists are included
    logger.debug(f"Serialized listing: {listing}")
    return listing

def serialize_listings(listings):
    return [serialize_listing(listing) for listing in listings]

class CreateListingSchema(Schema):
    agent_id = fields.Str(required=True, validate=lambda x: ObjectId.is_valid(x))
    seller_id = fields.Str(required=True, validate=lambda x: ObjectId.is_valid(x))
    make = fields.Str(required=True)
    model = fields.Str(required=True)
    year = fields.Int(required=True)
    price = fields.Float(required=True)
    
    # Add other necessary fields here

    @validates_schema
    def validate_ids(self, data, **kwargs):
        """
        Ensures that agent_id and seller_id are valid and, optionally, match.
        """
        agent_id = data.get('agent_id')
        seller_id = data.get('seller_id')

        if not agent_id or not seller_id:
            raise ValidationError("Both 'agent_id' and 'seller_id' are required.")
 

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
        if not listing_data:
            logger.warning("No input data provided for listing creation.")
            return {"error": "No input data provided."}, 400  # Bad Request

        schema = CreateListingSchema()
        try:
            validated_data = schema.load(listing_data)
            logger.debug(f"Validated data: {validated_data}")
        except ValidationError as err:
            logger.warning(f"Validation errors during listing creation: {err.messages}")
            return {"error": err.messages}, 400  # Bad Request

        # Initialize views and shortlists to 0 if not provided
        validated_data.setdefault('views', 0)
        validated_data.setdefault('shortlists', 0)
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
        if not listing_id:
            logger.warning("Missing 'listing_id' parameter.")
            return {"error": "Missing 'listing_id' parameter."}, 400  # Bad Request

        try:
            oid = ObjectId(listing_id)
        except (InvalidId, TypeError) as e:
            logger.error(f"Invalid listing_id format: {listing_id}. Error: {e}")
            return {"error": "Invalid 'listing_id'."}, 400  # Bad Request

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
            logger.debug(f"Validated update data: {validated_data}")
        except ValidationError as err:
            logger.warning(f"Validation errors during listing update: {err.messages}")
            return {"error": err.messages}, 400  # Bad Request

        try:
            oid = ObjectId(listing_id)
        except (InvalidId, TypeError) as e:
            logger.warning(f"Invalid listing_id format: {listing_id}. Error: {e}")
            return {"error": "Invalid 'listing_id'."}, 400  # Bad Request

        try:
            # Authorization: Ensure the agent owns the listing
            listing = used_car_collection.find_one({"_id": oid})
            if not listing:
                logger.warning(f"Listing not found with ID: {listing_id}")
                return {"error": "Listing not found."}, 404  # Not Found

            # Assuming agent_id is part of the update_data or already part of the listing
            # Modify this logic based on how you manage agent authentication
            agent_id = update_data.get('agent_id', str(listing.get('agent_id')))
            if agent_id and str(listing.get('agent_id')) != agent_id:
                logger.warning(f"Agent {agent_id} does not own listing {listing_id}")
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
        if not listing_id:
            logger.warning("Missing 'listing_id' parameter.")
            return {"error": "Missing 'listing_id' parameter."}, 400  # Bad Request

        try:
            oid = ObjectId(listing_id)
        except (InvalidId, TypeError) as e:
            logger.warning(f"Invalid listing_id format: {listing_id}. Error: {e}")
            return {"error": "Invalid 'listing_id'."}, 400  # Bad Request

        try:
            # Authorization: Ensure the agent owns the listing
            listing = used_car_collection.find_one({"_id": oid})
            if not listing:
                logger.warning(f"Listing not found for deletion with ID: {listing_id}")
                return {"error": "Listing not found."}, 404  # Not Found 

            # Assuming agent_id is provided as part of the deletion request
            # Modify this logic based on how you manage agent authentication
            agent_id = listing.get('agent_id')
            if not agent_id:
                logger.warning(f"No agent_id associated with listing {listing_id}")
                return {"error": "Listing has no associated agent."}, 403  # Forbidden

            # If you have agent authentication, compare the authenticated agent_id with listing.agent_id
            # For simplicity, this example assumes ownership is already verified

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
            listings_cursor = used_car_collection.find({"seller_id": (seller_id)})
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
    def get_listings_with_reviews(user_id):
        """
        Retrieves all listings associated with a user (seller or buyer)
        and appends the corresponding review details if available.

        Parameters:
            user_id (str): The ObjectId string of the user.

        Returns:
            JSON response containing the listings with appended review details.
        """
        if not user_id:
            logger.warning("Missing 'user_id' parameter.")
            return {"error": "Missing 'user_id' parameter."}, 400  # Bad Request

        try:
            # Step 1: Validate and convert user_id to ObjectId
            user_oid = ObjectId(user_id)
            logger.debug(f"Converted user_id to ObjectId: {user_oid}")
        except (InvalidId, TypeError) as e:
            logger.error(f"Invalid user_id format: {user_id}. Error: {e}")
            return {"error": "Invalid user_id format."}, 400  # Bad Request

        try:
            # Step 2: Fetch the user from the users collection to determine the role
            user = users_collection.find_one({"_id": user_oid})
            if not user:
                logger.warning(f"User not found with user_id: {user_id}")
                return {"error": "User not found."}, 404  # Not Found

            role = user.get('role') 
            if not role:
                logger.warning(f"Role not defined for user_id: {user_id}")
                return {"error": "User role not defined."}, 400  # Bad Request

            logger.debug(f"User role for user_id {user_id}: {role}")

            # Step 3: Determine the field to query based on role
            if role.lower() == 'seller':
                query_field = 'seller_id'
            elif role.lower() == 'buyer':
                query_field = 'buyer_id'
            else:
                logger.warning(f"Invalid role '{role}' for user_id: {user_id}")
                return {"error": f"Invalid user role: {role}."}, 400  # Bad Request

            # Step 4: Query listings based on the determined field
            listings_cursor = used_car_collection.find({query_field: user_id}) 
            listings = list(listings_cursor) 
            logger.debug(f"Number of listings found for user_id {user_id}: {len(listings)}")

            if not listings:
                logger.info(f"No listings found for user_id: {user_id}")
                return {"message": "No listings found for this user.", "listings": []}, 200  # OK

            # Extract listing_ids for querying reviews
            listing_ids = [str(listing['_id']) for listing in listings]
            logger.debug(f"Listing IDs: {listing_ids}")
            print(listing_ids)

            # Step 5: Query all reviews where listing_id matches
            seller_reviews_cursor = reviews_collection.find({
                'listing_id': {"$in": listing_ids}
            })
            seller_reviews = list(seller_reviews_cursor) 
            print(f"Number of reviews found: {len(seller_reviews)}")

            # Create a mapping from listing_id to review details
            review_map = {
                str(review['listing_id']): {
                    "review_id": str(review['_id']),
                    "rating": review.get('rating', 0),
                    "review": review.get('review', '')
                }
                for review in seller_reviews
            } 
            logger.debug(f"Review map: {review_map}")

            # Step 6: Append review details to each listing
            augmented_listings = []
            for listing in listings:
                print(listing)
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
                    'review_id': review_map.get(listing_id_str, {}).get('review_id'),
                    'rating': review_map.get(listing_id_str, {}).get('rating'),
                    'review': review_map.get(listing_id_str, {}).get('review'),
                    "agent_id": listing.get('agent_id', '')  
                }
                logger.debug(f"Augmented Listing: {augmented_listing}")
                augmented_listings.append(augmented_listing)

            logger.info(f"Retrieved {len(augmented_listings)} listings for user_id: {user_id}")
            return {"listings": augmented_listings}, 200  # OK

        except Exception as e:
            logger.exception(f"Error retrieving listings with reviews for user_id {user_id}: {e}")
            return {"error": "Failed to retrieve listings with reviews."}, 500  # Internal Server Error
