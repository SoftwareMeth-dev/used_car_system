# backend/controllers/get_reviews.py

from flask import Blueprint, request, jsonify
from models.used_car_listing import UsedCarListing
 
user_reviews_bp = Blueprint('user', __name__, url_prefix='/api')

@user_reviews_bp.route('/get_listings_with_reviews/<user_id>', methods=['GET'])
def get_listings_with_reviews(user_id):
    """
    API endpoint to retrieve all listings associated with a user (either as a seller or buyer)
    with appended review_id.
    
    URL Parameters:
        user_id (str): The ObjectId string of the user.
        
    Returns:
        JSON response containing the listings with appended review_id.
    """ 
    response, status_code = UsedCarListing.get_listings_with_reviews(user_id)
    return jsonify(response), status_code
