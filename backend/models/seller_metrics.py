# backend/models/seller_metrics.py
from utils.db import db
from bson import ObjectId

seller_metrics_collection = db['seller_metrics']

def serialize_metrics(metrics):
    if not metrics:
        return None
    metrics['_id'] = str(metrics['_id'])
    return metrics

def serialize_metrics_list(metrics_list):
    return [serialize_metrics(metrics) for metrics in metrics_list]

class SellerMetrics:
    @staticmethod
    def track_view(listing_id):
        """
        Increments the view count for a listing.
        Returns True if successful, else False.
        """
        try:
            result = seller_metrics_collection.update_one(
                {"listing_id": listing_id},
                {"$inc": {"views": 1}},
                upsert=True
            )
            return result.modified_count > 0 or result.upserted_id is not None
        except Exception as e:
            print(f"Error tracking view for listing_id {listing_id}: {e}")
            return False

    @staticmethod
    def track_shortlist(listing_id):
        """
        Increments the shortlist count for a listing.
        Returns True if successful, else False.
        """
        try:
            result = seller_metrics_collection.update_one(
                {"listing_id": listing_id},
                {"$inc": {"shortlists": 1}},
                upsert=True
            )
            return result.modified_count > 0 or result.upserted_id is not None
        except Exception as e:
            print(f"Error tracking shortlist for listing_id {listing_id}: {e}")
            return False

    @staticmethod
    def get_metrics(listing_id):
        """
        Retrieves metrics for a specific listing.
        Returns a metrics dictionary or None if not found.
        """
        metrics = seller_metrics_collection.find_one({"listing_id": listing_id})
        return serialize_metrics(metrics)
