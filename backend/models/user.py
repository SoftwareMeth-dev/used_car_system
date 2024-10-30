# backend/models/user.py
from utils.db import db
from bson import ObjectId  # Import ObjectId for handling MongoDB IDs

users_collection = db['users']

class User:
    @staticmethod
    def create_user(user_data):
        """
        Inserts a new user into the users collection.
        """
        return users_collection.insert_one(user_data)

    @staticmethod
    def get_user_by_username(username=None):
        """
        Retrieves a user by username or all users if no username is provided.
        
        :param username: (str) Username to filter by.
        :return: (dict or list) Single user document or list of users.
        """
        if username:
            # If a specific username is provided, return that user
            return users_collection.find_one({"username": username})
        else:
            # If no username is provided, return all users
            return list(users_collection.find())

    @staticmethod
    def filter_users(username=None, email=None, role=None, status=None):
        """
        Filters users based on the provided criteria.
        
        :param username: (str) Partial or full username to filter by.
        :param email: (str) Partial or full email to filter by.
        :param role: (str) Role to filter by (exact match).
        :param status: (str) Status to filter by ('active' or 'suspended').
        :return: (list) List of user dictionaries matching the filters.
        """
        query = {}
        if username:
            query["username"] = {"$regex": username, "$options": "i"}  # Case-insensitive partial match
        if email:
            query["email"] = {"$regex": email, "$options": "i"}
        if role:
            query["role"] = role
        if status:
            # Assuming status can be 'active' or 'suspended'
            if status.lower() == 'active':
                query["suspended"] = False
            elif status.lower() == 'suspended':
                query["suspended"] = True

        return list(users_collection.find(query))

    @staticmethod
    def get_user_by_id(user_id):
        """
        Retrieves a user by their ObjectId.

        :param user_id: (str) The ObjectId string of the user.
        :return: (dict or None) The user document or None if not found.
        """
        try:
            oid = ObjectId(user_id)
        except Exception as e:
            print(f"Error converting user_id to ObjectId: {e}")
            return None
        return users_collection.find_one({"_id": oid})

    @staticmethod
    def update_user(username, update_data):
        """
        Updates a user's information based on their username.

        :param username: (str) The username of the user to update.
        :param update_data: (dict) The data to update.
        :return: (UpdateResult) The result of the update operation.
        """
        return users_collection.update_one({"username": username}, {"$set": update_data})

    @staticmethod
    def suspend_user(username):
        """
        Suspends a user by setting their 'suspended' field to True.

        :param username: (str) The username of the user to suspend.
        :return: (UpdateResult) The result of the update operation.
        """
        return users_collection.update_one({"username": username}, {"$set": {"suspended": True}})

    @staticmethod
    def reenable_user(username):
        """
        Re-enables a user by setting their 'suspended' field to False.

        :param username: (str) The username of the user to re-enable.
        :return: (UpdateResult) The result of the update operation.
        """
        return users_collection.update_one({"username": username}, {"$set": {"suspended": False}})

    @staticmethod
    def search_users(query):
        """
        Searches users by username or email using a regex.

        :param query: (str) The search query.
        :return: (Cursor) MongoDB cursor with matching users.
        """
        return users_collection.find({"$or": [
            {"username": {"$regex": query, "$options": "i"}},
            {"email": {"$regex": query, "$options": "i"}}
        ]})
