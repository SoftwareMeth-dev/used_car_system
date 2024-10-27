# backend/models/profile.py
from utils.db import db

profiles_collection = db['profiles']

class Profile:
    @staticmethod
    def create_profile(profile_data):
        return profiles_collection.insert_one(profile_data)

    @staticmethod
    def get_profile_by_role(role):
        return profiles_collection.find_one({"role": role})

    @staticmethod
    def update_profile(role, update_data):
        return profiles_collection.update_one({"role": role}, {"$set": update_data})

    @staticmethod
    def suspend_profile(role):
        return profiles_collection.update_one({"role": role}, {"$set": {"suspended": True}})

    @staticmethod
    def search_profiles(query):
        return profiles_collection.find({"role": {"$regex": query, "$options": "i"}})
