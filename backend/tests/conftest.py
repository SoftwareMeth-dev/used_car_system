# backend/tests/conftest.py

import sys
import os
import pytest

# Add the backend directory to sys.path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from models.user_model import users_collection
from models.profile import profiles_collection

@pytest.fixture
def client():
    # Configure the app for testing
    app = create_app({
        'TESTING': True,
        'MONGO_URI': 'mongodb://localhost:27017/test_database'  # Use a test database
    })

    with app.test_client() as client:
        with app.app_context():
            # Setup: Ensure the test database has necessary data
            yield client
        # Teardown is optional since we're not wiping the database
