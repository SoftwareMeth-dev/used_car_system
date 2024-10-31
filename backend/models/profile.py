# backend/models/profile.py
from utils.db import db
from bson import ObjectId

profiles_collection = db['profiles']

def serialize_profile(profile):
    if not profile:
        return None
    profile['_id'] = str(profile['_id'])
    return profile

def serialize_profiles(profiles):
    return [serialize_profile(profile) for profile in profiles]

class Profile:
    @staticmethod
    def create_profile(profile_data):
        """
        Inserts a new profile into the profiles collection.
        Returns True if successful, else False.
        """
        result = profiles_collection.insert_one(profile_data)
        return result.inserted_id is not None

    @staticmethod
    def get_profile_by_role(role=None):
        """
        Retrieves a profile by role or all profiles if no role is provided.
        
        :param role: (str) Role to filter by.
        :return: (dict or list) Single profile document or list of profiles.
        """
        if role:
            # If a specific role is provided, return that profile
            profile = profiles_collection.find_one({"role": role})
            return serialize_profile(profile)
        else:
            # If no role is provided, return all profiles
            profiles = list(profiles_collection.find())
            return serialize_profiles(profiles)

    @staticmethod
    def update_profile(role, update_data):
        """
        Updates a profile's information based on the role.

        :param role: (str) The role of the profile to update.
        :param update_data: (dict) The data to update.
        :return: (bool) True if update was successful, else False.
        """
        result = profiles_collection.update_one({"role": role}, {"$set": update_data})
        return result.modified_count > 0

    @staticmethod
    def suspend_profile(role):
        """
        Suspends a profile by setting its 'suspended' field to True.
        Also suspends all users with this role.

        :param role: (str) The role of the profile to suspend.
        :return: (bool) True if suspend was successful, else False.
        """
        # First, suspend the profile
        result = profiles_collection.update_one({"role": role}, {"$set": {"suspended": True}})
        if result.modified_count > 0:
            # Suspend all users with this role
            from models.user import User  # Import here to avoid circular import
            User.suspend_users_by_role(role)
            return True
        return False

    @staticmethod
    def reenable_profile(role):
        """
        Re-enables a profile by setting its 'suspended' field to False.
        Also re-enables all users with this role.

        :param role: (str) The role of the profile to re-enable.
        :return: (bool) True if re-enable was successful, else False.
        """
        # First, re-enable the profile
        result = profiles_collection.update_one({"role": role}, {"$set": {"suspended": False}})
        if result.modified_count > 0:
            # Re-enable all users with this role
            from models.user import User  # Import here to avoid circular import
            User.reenable_users_by_role(role)
            return True
        return False

    @staticmethod
    def search_profiles(query):
        """
        Searches profiles by role or rights using a regex.

        :param query: (str) The search query.
        :return: (list) List of profile dictionaries matching the search.
        """
        cursor = profiles_collection.find({"$or": [
            {"role": {"$regex": query, "$options": "i"}},
            {"rights": {"$regex": query, "$options": "i"}}
        ]})
        return serialize_profiles(cursor)
