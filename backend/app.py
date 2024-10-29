# # backend/app.py
# from flask import Flask

# from flask_cors import CORS  # Import CORS
# from controllers import user_admin, used_car_agent, buyer, seller
# from utils.db import init_db
# from dotenv import load_dotenv
# import os

# load_dotenv()

# app = Flask(__name__)

# # Initialize CORS
# CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}) 


# # Initialize Database
# init_db()

# # Register Blueprints
# app.register_blueprint(user_admin.bp, url_prefix='/api/user_admin')
# app.register_blueprint(used_car_agent.bp, url_prefix='/api/used_car_agent')
# app.register_blueprint(buyer.bp, url_prefix='/api/buyer')
# app.register_blueprint(seller.bp, url_prefix='/api/seller')

# if __name__ == '__main__':
#     app.run(debug=True)


from flask import Flask
from flask_cors import CORS
from controllers.user_admin import bp as user_admin_bp
from controllers.used_car_agent import bp as used_car_agent_bp
from controllers.buyer import bp as buyer_bp
from controllers.seller import bp as seller_bp
from utils.db import init_db
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

# Initialize CORS
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}) 

# Initialize Database
init_db()

# Register Blueprints
app.register_blueprint(user_admin_bp)
app.register_blueprint(used_car_agent_bp)
app.register_blueprint(buyer_bp)
app.register_blueprint(seller_bp)

if __name__ == '__main__':
    app.run(debug=True)
