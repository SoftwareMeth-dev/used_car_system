# backend/controllers/get_reviews.py

from flask import Blueprint, request, jsonify
from models.used_car_listing import UsedCarListing

# Create a Blueprint for seller-related routes
get_reviews_bp = Blueprint('seller', __name__, url_prefix='/api')

@get_reviews_bp.route('/get_listings_with_reviews/<seller_id>', methods=['GET'])
def get_listings_with_reviews(seller_id):
    """
    API endpoint to retrieve all listings by a seller with appended review_id.
    
    URL Parameters:
        seller_id (str): The ObjectId string of the seller.
        
    Returns:
        JSON response containing the listings with appended review_id.
    """
    # Call the model method
    response, status_code = UsedCarListing.get_listings_with_reviews(seller_id)
    return jsonify(response), status_code