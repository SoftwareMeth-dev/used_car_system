# backend/models/seller_metrics_model.py

from utils.db import db
from bson import ObjectId
from datetime import datetime
import logging

# Configure Logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

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
    def track_view(data):
        """
        Increments the view count for a listing.
        Expects data to contain 'listing_id'.
        Returns a tuple of (response_dict, status_code).
        """
        listing_id = data.get('listing_id')
        if not listing_id:
            logger.warning("Missing 'listing_id' in request data.")
            return {"error": "Missing 'listing_id'."}, 400  # Bad Request

        try:
            result = seller_metrics_collection.update_one(
                {"listing_id": listing_id},
                {"$inc": {"views": 1}},
                upsert=True
            )
            if result.modified_count > 0 or result.upserted_id is not None:
                logger.info(f"View tracked for listing_id: {listing_id}")
                return {"success": True}, 200
            else:
                logger.warning(f"Failed to track view for listing_id: {listing_id}")
                return {"success": False}, 500  # Internal Server Error
        except Exception as e:
            logger.exception(f"Error tracking view for listing_id {listing_id}: {e}")
            return {"success": False, "error": "Failed to track view."}, 500

    @staticmethod
    def track_shortlist(data):
        """
        Increments the shortlist count for a listing.
        Expects data to contain 'listing_id'.
        Returns a tuple of (response_dict, status_code).
        """
        listing_id = data.get('listing_id')
        if not listing_id:
            logger.warning("Missing 'listing_id' in request data.")
            return {"error": "Missing 'listing_id'."}, 400  # Bad Request

        try:
            result = seller_metrics_collection.update_one(
                {"listing_id": listing_id},
                {"$inc": {"shortlists": 1}},
                upsert=True
            )
            if result.modified_count > 0 or result.upserted_id is not None:
                logger.info(f"Shortlist tracked for listing_id: {listing_id}")
                return {"success": True}, 200
            else:
                logger.warning(f"Failed to track shortlist for listing_id: {listing_id}")
                return {"success": False}, 500  # Internal Server Error
        except Exception as e:
            logger.exception(f"Error tracking shortlist for listing_id {listing_id}: {e}")
            return {"success": False, "error": "Failed to track shortlist."}, 500

    @staticmethod
    def get_metrics(listing_id):
        """
        Retrieves metrics for a specific listing.
        Returns a tuple of (response_dict, status_code).
        """
        if not listing_id:
            logger.warning("Missing 'listing_id' parameter.")
            return {"error": "Missing 'listing_id' parameter."}, 400  # Bad Request

        try:
            metrics = seller_metrics_collection.find_one({"listing_id": listing_id})
            if metrics:
                serialized = serialize_metrics(metrics)
                logger.info(f"Metrics retrieved for listing_id: {listing_id}")
                return {"metrics": serialized}, 200
            else:
                logger.warning(f"No metrics found for listing_id: {listing_id}")
                return {"error": "Metrics not found."}, 404  # Not Found
        except Exception as e:
            logger.exception(f"Error retrieving metrics for listing_id {listing_id}: {e}")
            return {"error": "Failed to retrieve metrics."}, 500
