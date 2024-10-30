# backend/models/profile.py
from utils.db import db
from bson import ObjectId  # Import ObjectId for handling MongoDB IDs

profiles_collection = db['profiles']

class Profile:
    @staticmethod
    def create_profile(profile_data):
        """
        Inserts a new profile into the profiles collection.
        """
        return profiles_collection.insert_one(profile_data)

    @staticmethod
    def get_profile_by_role(role=None):
        """
        Retrieves a profile by role or all profiles if no role is provided.
        
        :param role: (str) Role to filter by.
        :return: (dict or list) Single profile document or list of profiles.
        """
        if role:
            # If a specific role is provided, return that profile
            return profiles_collection.find_one({"role": role})
        else:
            # If no role is provided, return all profiles
            return list(profiles_collection.find())

    @staticmethod
    def update_profile(role, update_data):
        """
        Updates a profile's information based on the role.

        :param role: (str) The role of the profile to update.
        :param update_data: (dict) The data to update.
        :return: (UpdateResult) The result of the update operation.
        """
        return profiles_collection.update_one({"role": role}, {"$set": update_data})

    @staticmethod
    def suspend_profile(role):
        """
        Suspends a profile by setting its 'suspended' field to True.

        :param role: (str) The role of the profile to suspend.
        :return: (UpdateResult) The result of the update operation.
        """
        return profiles_collection.update_one({"role": role}, {"$set": {"suspended": True}})

    @staticmethod
    def search_profiles(query):
        """
        Searches profiles by role or rights using a regex.

        :param query: (str) The search query.
        :return: (Cursor) MongoDB cursor with matching profiles.
        """
        return profiles_collection.find({"$or": [
            {"role": {"$regex": query, "$options": "i"}},
            {"rights": {"$regex": query, "$options": "i"}}
        ]})
