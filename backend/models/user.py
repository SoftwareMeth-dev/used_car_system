# backend/models/user.py
from utils.db import db
from datetime import datetime
from bson import ObjectId  # Import ObjectId for handling MongoDB IDs


users_collection = db['users']

class User:
    @staticmethod
    def create_user(user_data):
        return users_collection.insert_one(user_data)

    @staticmethod
    def get_user_by_username(username):
        return users_collection.find_one({"username": username})

 
    @staticmethod
    def get_user_by_id(user_id):
        """
        Retrieves a user by their ObjectId.
        """
        try: 
            print(f"Searching for user_id: {user_id}")
            oid = ObjectId(user_id)
            print(f"Converted to ObjectId: {oid}")
        except Exception as e:
            print(f"Error converting user_id to ObjectId: {e}")
            return None
        user = users_collection.find_one({"_id": oid})
        if user:
            print(f"User found: {user}")
        else:
            print("No user found with the provided ObjectId.")
        return user

    @staticmethod
    def update_user(username, update_data):
        return users_collection.update_one({"username": username}, {"$set": update_data})

    @staticmethod
    def suspend_user(username):
        return users_collection.update_one({"username": username}, {"$set": {"suspended": True}})

    @staticmethod
    def search_users(query):
        return users_collection.find({"$or": [
            {"username": {"$regex": query, "$options": "i"}},
            {"email": {"$regex": query, "$options": "i"}}
        ]})
