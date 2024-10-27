# backend/models/seller_metrics.py
from utils.db import db

seller_metrics_collection = db['seller_metrics']

class SellerMetrics:
    @staticmethod
    def track_view(listing_id):
        return seller_metrics_collection.update_one(
            {"listing_id": listing_id},
            {"$inc": {"views": 1}},
            upsert=True
        )

    @staticmethod
    def track_shortlist(listing_id):
        return seller_metrics_collection.update_one(
            {"listing_id": listing_id},
            {"$inc": {"shortlists": 1}},
            upsert=True
        )

    @staticmethod
    def get_metrics(listing_id):
        return seller_metrics_collection.find_one({"listing_id": listing_id})
