# backend/utils/populate_sample_data.py

import sys
import os
import string
from faker import Faker
import random
from bson.objectid import ObjectId

# Ensure that the parent directory is in the Python path to allow imports from `models`
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)  # Prepend the parent directory to sys.path

# Now import models
from models.user import User
from models.profile import Profile
from models.used_car_listing import UsedCarListing
from models.review import Review

fake = Faker()

def random_string(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def populate_profiles():
    """Create user profiles with specific roles and rights."""
    profiles = [
        {
            "role": "user_admin",
            "rights": [
                "create_user", "view_user", "update_user",
                "suspend_user", "search_user", "manage_profiles"
            ],
            "suspended": False
        },
        {
            "role": "used_car_agent",
            "rights": [
                "create_listing", "view_listing", "update_listing",
                "delete_listing", "search_listing"
            ],
            "suspended": False
        },
        {
            "role": "buyer",
            "rights": [
                "search_cars", "view_listings", "save_shortlist",
                "search_shortlist", "view_shortlist", "use_loan_calculator"
            ],
            "suspended": False
        },
        {
            "role": "seller",
            "rights": [
                "track_views", "track_shortlists", "rate_review_agents"
            ],
            "suspended": False
        }
    ]
    for profile in profiles:
        Profile.create_profile(profile)

def populate_users(n_total=100, n_sellers=20):
    """
    Create a total of `n_total` users, with `n_sellers` of them being sellers.
    Returns a tuple of (seller_user_ids, buyer_user_ids, agent_user_ids)
    """
    roles = ['user_admin', 'used_car_agent', 'buyer', 'seller']
    sellers = []
    buyers = []
    agents = []
    
    # First, create `n_sellers` seller users
    for _ in range(n_sellers):
        user = {
            "username": 'seller_' + fake.unique.user_name(),
            "password": fake.password(length=10),
            "email": fake.unique.email(),
            "role": 'seller',
            "suspended": False
        }
        result = User.create_user(user)
        sellers.append(str(result.inserted_id))  # Store the seller's ObjectId as string
    
    # Now, create the remaining users with random roles
    for _ in range(n_total - n_sellers):
        role = random.choice(['user_admin', 'used_car_agent', 'buyer'])
        user = {
            "username": role + '_' + fake.unique.user_name(),
            "password": fake.password(length=10),
            "email": fake.unique.email(),
            "role": role,
            "suspended": False
        }
        result = User.create_user(user)
        if role == 'buyer':
            buyers.append(str(result.inserted_id))
        elif role == 'used_car_agent':
            agents.append(str(result.inserted_id))
    
    return sellers, buyers, agents

def populate_used_car_listings(n=100, seller_ids=[]):
    """
    Create `n` used car listings, assigning each listing to a seller from `seller_ids`.
    """
    if not seller_ids:
        print("No seller IDs provided. Cannot create listings without sellers.")
        return
    
    makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Nissan', 'Hyundai', 'Kia']
    models = ['Corolla', 'Civic', 'F-150', 'Impala', '3 Series', 'C-Class', 'A4', 'Altima', 'Elantra', 'Sorento']
    
    for _ in range(n):
        listing = {
            "make": random.choice(makes),
            "model": random.choice(models),
            "year": random.randint(2000, 2023),
            "price": random.randint(5000, 50000),
            "seller_id": random.choice(seller_ids),  # Assign to a pre-existing seller
            "views": 0,
            "shortlists": 0,
            "suspended": False,
            "created_at": fake.date_time_this_decade()
        }
        UsedCarListing.create_listing(listing)

def populate_reviews(sellers, buyers, agents, n=50):
    """
    Create `n` reviews from buyers and sellers to agents.
    """
    for _ in range(n):
        review = {
            "agent_id": random.choice(agents),
            "rating": random.randint(1, 5),
            "review": fake.sentence(nb_words=10),
            "created_at": fake.date_time_this_decade()
        }

        # Randomly decide if it's from a buyer or seller
        if random.choice(['buyer', 'seller']) == 'buyer' and buyers:
            review["buyer_id"] = random.choice(buyers)
        elif sellers:
            review["seller_id"] = random.choice(sellers)
        
        Review.create_review(review)

def main():
    """Main function to populate the database with sample data."""
    # Create Profiles
    print("Populating profiles...")
    populate_profiles()
    
    # Create Users and collect seller, buyer, and agent IDs
    print("Populating users...")
    sellers, buyers, agents = populate_users(n_total=100, n_sellers=20)
    
    # Create Used Car Listings
    print("Populating used car listings...")
    populate_used_car_listings(n=100, seller_ids=sellers)
    
    # Create Reviews
    print("Populating reviews...")
    populate_reviews(sellers, buyers, agents, n=50)
    
    print("Sample data populated successfully.")

if __name__ == "__main__":
    # Adjust the Python path to include the parent directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    sys.path.append(parent_dir)
    
    main()
