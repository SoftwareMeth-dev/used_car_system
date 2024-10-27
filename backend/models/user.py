# backend/models/user.py
from utils.db import db

users_collection = db['users']

class User:
    @staticmethod
    def create_user(user_data):
        return users_collection.insert_one(user_data)

    @staticmethod
    def get_user_by_username(username):
        return users_collection.find_one({"username": username})

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
