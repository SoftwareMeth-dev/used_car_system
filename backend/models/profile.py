# backend/models/profile.py

import logging
from utils.db import db
from bson import ObjectId
from models.user import User  # Ensure no circular imports
from marshmallow import Schema, fields, ValidationError

# Configure Logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

profiles_collection = db['profiles']

def serialize_profile(profile):
    if not profile:
        return None
    profile['_id'] = str(profile['_id'])
    return profile

def serialize_profiles(profiles):
    return [serialize_profile(profile) for profile in profiles]

class CreateProfileSchema(Schema):
    role = fields.Str(required=True)
    rights = fields.Str(required=True)
    # Add other necessary fields here

class UpdateProfileSchema(Schema):
    rights = fields.Str()
    # Add other fields that can be updated

class Profile:
    @staticmethod
    def create_profile(profile_data):
        """
        Creates a new user profile.
        Validates input data and inserts into the database.
        Returns a tuple of (response_dict, status_code).
        """
        schema = CreateProfileSchema()
        try:
            validated_data = schema.load(profile_data)
        except ValidationError as err:
            logger.warning(f"Validation errors during profile creation: {err.messages}")
            return {"error": err.messages}, 400  # Bad Request

        try:
            existing_profile = profiles_collection.find_one({"role": validated_data['role']})
            if existing_profile:
                logger.warning(f"Profile with role '{validated_data['role']}' already exists.")
                return {"error": "Profile with this role already exists."}, 400  # Bad Request

            result = profiles_collection.insert_one(validated_data)
            if result.inserted_id:
                logger.info(f"Profile created successfully with ID: {result.inserted_id}")
                return {"message": "Profile created successfully."}, 201  # Created
            logger.error("Failed to create profile without exception.")
            return {"error": "Failed to create profile."}, 500  # Internal Server Error
        except Exception as e:
            logger.exception(f"Exception during profile creation: {e}")
            return {"error": "An error occurred while creating the profile."}, 500  # Internal Server Error

    @staticmethod
    def get_profiles(role=None):
        """
        Retrieves profiles by role or all profiles if no role is provided.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            if role:
                profile = profiles_collection.find_one({"role": role})
                if profile:
                    serialized = serialize_profile(profile)
                    return {"profile": serialized}, 200
                logger.warning(f"Profile not found with role: {role}")
                return {"error": "Profile not found."}, 404  # Not Found
            else:
                profiles = list(profiles_collection.find())
                serialized = serialize_profiles(profiles)
                return {"profiles": serialized}, 200
        except Exception as e:
            logger.exception(f"Exception during fetching profile(s): {e}")
            return {"error": "Failed to fetch profile(s)."}, 500  # Internal Server Error

    @staticmethod
    def update_profile(role, update_data):
        """
        Updates a profile's information based on the role.
        Validates input data and updates the database.
        Returns a tuple of (response_dict, status_code).
        """
        if not update_data:
            logger.warning("No update data provided for profile.")
            return {"error": "No update data provided."}, 400  # Bad Request

        schema = UpdateProfileSchema()
        try:
            validated_data = schema.load(update_data)
        except ValidationError as err:
            logger.warning(f"Validation errors during profile update: {err.messages}")
            return {"error": err.messages}, 400  # Bad Request

        try:
            result = profiles_collection.update_one({"role": role}, {"$set": validated_data})
            if result.modified_count > 0:
                logger.info(f"Profile with role '{role}' updated successfully.")
                return {"message": "Profile updated successfully."}, 200
            logger.warning(f"No changes made to profile with role '{role}'.")
            return {"message": "No changes made to the profile."}, 200
        except Exception as e:
            logger.exception(f"Exception during profile update: {e}")
            return {"error": "Failed to update profile."}, 500  # Internal Server Error

    @staticmethod
    def suspend_profile(role):
        """
        Suspends a profile by setting its 'suspended' field to True.
        Also suspends all users with this role.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            result = profiles_collection.update_one({"role": role}, {"$set": {"suspended": True}})
            if result.modified_count > 0:
                logger.info(f"Profile with role '{role}' suspended successfully.")
                # Suspend all users with this role
                response, status_code = UserModel.suspend_users_by_role(role)
                if status_code == 200:
                    return {"message": "Profile and associated users suspended successfully."}, 200
                logger.warning(f"Profile suspended but failed to suspend users with role '{role}'.")
                return {"error": "Profile suspended but failed to suspend associated users."}, 500
            logger.warning(f"Profile with role '{role}' not found for suspension.")
            return {"error": "Profile not found."}, 404  # Not Found
        except Exception as e:
            logger.exception(f"Exception during suspending profile '{role}': {e}")
            return {"error": "Failed to suspend profile."}, 500  # Internal Server Error

    @staticmethod
    def reenable_profile(role):
        """
        Re-enables a profile by setting its 'suspended' field to False.
        Also re-enables all users with this role.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            result = profiles_collection.update_one({"role": role}, {"$set": {"suspended": False}})
            if result.modified_count > 0:
                logger.info(f"Profile with role '{role}' re-enabled successfully.")
                # Re-enable all users with this role
                response, status_code = UserModel.reenable_users_by_role(role)
                if status_code == 200:
                    return {"message": "Profile and associated users re-enabled successfully."}, 200
                logger.warning(f"Profile re-enabled but failed to re-enable users with role '{role}'.")
                return {"error": "Profile re-enabled but failed to re-enable associated users."}, 500
            logger.warning(f"Profile with role '{role}' not found for re-enabling.")
            return {"error": "Profile not found."}, 404  # Not Found
        except Exception as e:
            logger.exception(f"Exception during re-enabling profile '{role}': {e}")
            return {"error": "Failed to re-enable profile."}, 500  # Internal Server Error

    @staticmethod
    def search_profiles(query):
        """
        Searches profiles by role or rights using a regex.
        Returns a tuple of (response_dict, status_code).
        """
        if not query:
            logger.warning("Search query parameter is missing for profiles.")
            return {"error": "Query parameter is required."}, 400  # Bad Request
        try:
            cursor = profiles_collection.find({"$or": [
                {"role": {"$regex": query, "$options": "i"}},
                {"rights": {"$regex": query, "$options": "i"}}
            ]})
            serialized_profiles = serialize_profiles(cursor)
            logger.info(f"Search completed for profiles with query: '{query}'")
            return {"profiles": serialized_profiles}, 200
        except Exception as e:
            logger.exception(f"Exception during searching profiles with query '{query}': {e}")
            return {"error": "Failed to search profiles."}, 500  # Internal Server Error
