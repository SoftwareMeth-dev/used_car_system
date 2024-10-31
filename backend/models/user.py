# backend/models/user.py
from utils.db import db
from bson import ObjectId

users_collection = db['users']

def serialize_user(user):
    if not user:
        return None
    user['_id'] = str(user['_id'])
    return user

def serialize_users(users):
    return [serialize_user(user) for user in users]

class User:
    @staticmethod
    def create_user(user_data):
        """
        Inserts a new user into the users collection.
        Returns True if the operation is successful, otherwise False.
        """
        result = users_collection.insert_one(user_data)
        return result.inserted_id is not None

    @staticmethod
    def get_user_by_username(username=None):
        """
        Retrieves a user by username or all users if no username is provided.
        
        :param username: (str) Username to filter by.
        :return: (dict or list) Single user document or list of users.
        """
        if username:
            # If a specific username is provided, return that user
            user = users_collection.find_one({"username": username})
            return serialize_user(user)
        else:
            # If no username is provided, return all users
            users = list(users_collection.find())
            return serialize_users(users)

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

        users = users_collection.find(query)
        return serialize_users(users)

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
        user = users_collection.find_one({"_id": oid})
        return serialize_user(user)

    @staticmethod
    def update_user(username, update_data):
        """
        Updates a user's information based on their username.

        :param username: (str) The username of the user to update.
        :param update_data: (dict) The data to update.
        :return: (bool) True if update was successful, else False.
        """
        result = users_collection.update_one({"username": username}, {"$set": update_data})
        return result.modified_count > 0

    @staticmethod
    def suspend_user(username):
        """
        Suspends a user by setting their 'suspended' field to True.

        :param username: (str) The username of the user to suspend.
        :return: (bool) True if suspend was successful, else False.
        """
        result = users_collection.update_one({"username": username}, {"$set": {"suspended": True}})
        return result.modified_count > 0

    @staticmethod
    def reenable_user(username):
        """
        Re-enables a user by setting their 'suspended' field to False.

        :param username: (str) The username of the user to re-enable.
        :return: (bool) True if re-enable was successful, else False.
        """
        result = users_collection.update_one({"username": username}, {"$set": {"suspended": False}})
        return result.modified_count > 0

    @staticmethod
    def suspend_users_by_role(role):
        """
        Suspends all users with the specified role.

        :param role: (str) The role of users to suspend.
        :return: (bool) True if any users were suspended, else False.
        """
        result = users_collection.update_many({"role": role}, {"$set": {"suspended": True}})
        return result.modified_count > 0

    @staticmethod
    def reenable_users_by_role(role):
        """
        Re-enables all users with the specified role.

        :param role: (str) The role of users to re-enable.
        :return: (bool) True if any users were re-enabled, else False.
        """
        result = users_collection.update_many({"role": role}, {"$set": {"suspended": False}})
        return result.modified_count > 0

    @staticmethod
    def search_users(query):
        """
        Searches users by username or email using a regex.

        :param query: (str) The search query.
        :return: (list) List of user dictionaries matching the search.
        """
        cursor = users_collection.find({"$or": [
            {"username": {"$regex": query, "$options": "i"}},
            {"email": {"$regex": query, "$options": "i"}}
        ]})
        return serialize_users(cursor)
