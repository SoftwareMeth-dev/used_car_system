# backend/app.py
from flask import Flask, Blueprint, jsonify
from flask_cors import CORS

# Import all Blueprints
from controllers.auth import auth_bp
from controllers.user_admin.create_user import create_user_bp
from controllers.user_admin.view_users import view_users_bp
from controllers.user_admin.update_user import update_user_bp
from controllers.user_admin.suspend_user import suspend_user_bp
from controllers.user_admin.reenable_user import reenable_user_bp
from controllers.user_admin.search_users import search_users_bp
from controllers.user_admin.create_profile import create_profile_bp
from controllers.user_admin.view_profiles import view_profiles_bp
from controllers.user_admin.update_profile import update_profile_bp
from controllers.user_admin.suspend_profile import suspend_profile_bp
from controllers.user_admin.reenable_profile import reenable_profile_bp
from controllers.user_admin.search_profiles import search_profiles_bp
from controllers.used_car_agent.create_listing import create_listing_bp 
from controllers.used_car_agent.update_listing import update_listing_bp
from controllers.used_car_agent.delete_listing import delete_listing_bp
from controllers.used_car_agent.search_listings import search_listings_bp
from controllers.buyer.search_cars import search_cars_bp 
from controllers.buyer.save_listing import save_listing_bp
from controllers.buyer.search_shortlist import search_shortlist_bp
from controllers.buyer.view_shortlist import view_shortlist_bp
from controllers.seller.track_view import track_view_bp
from controllers.seller.track_shortlist import track_shortlist_bp
from controllers.seller.get_reviews import get_reviews_bp
from controllers.seller.get_metrics import get_metrics_bp
from controllers.review.rate_review_agent import rate_review_agent_bp 
from controllers.review.view_reviews import view_reviews_bp 
from controllers.buyer.loan_calculator import loan_calculator_bp 
from controllers.used_car_agent.view_listing import view_listings_bp 
from utils.listings import listings_bp

from utils.db import init_db
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__) 
# Initialize CORS
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}) 

# Initialize Database
init_db()

# Register all Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(create_user_bp)
app.register_blueprint(view_users_bp)
app.register_blueprint(update_user_bp)
app.register_blueprint(suspend_user_bp)
app.register_blueprint(reenable_user_bp)
app.register_blueprint(search_users_bp)
app.register_blueprint(create_profile_bp)
app.register_blueprint(view_profiles_bp)
app.register_blueprint(update_profile_bp)
app.register_blueprint(suspend_profile_bp)
app.register_blueprint(reenable_profile_bp)
app.register_blueprint(search_profiles_bp)
app.register_blueprint(create_listing_bp)
app.register_blueprint(listings_bp)
app.register_blueprint(update_listing_bp)
app.register_blueprint(delete_listing_bp)
app.register_blueprint(search_listings_bp)
app.register_blueprint(search_cars_bp) 
app.register_blueprint(save_listing_bp)
app.register_blueprint(search_shortlist_bp)
app.register_blueprint(view_shortlist_bp)
app.register_blueprint(track_view_bp)
app.register_blueprint(track_shortlist_bp)
app.register_blueprint(get_metrics_bp)
app.register_blueprint(rate_review_agent_bp)   
app.register_blueprint(view_reviews_bp)  
app.register_blueprint(loan_calculator_bp)
app.register_blueprint(view_listings_bp)
app.register_blueprint(get_reviews_bp)


# Define centralized error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad Request"}), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({"error": "Unauthorized"}), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({"error": "Forbidden"}), 403

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not Found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
