# backend/debug/test_endpoint.py

import requests
import json

def log_result(f, test_name, response):
    f.write(f"=== {test_name} ===\n")
    f.write(f"Request URL: {response.request.url}\n")
    f.write(f"Request Method: {response.request.method}\n")
    if response.request.body:
        f.write(f"Request Body: {response.request.body.decode('utf-8')}\n")
    f.write(f"Status Code: {response.status_code}\n")
    try:
        json_response = response.json()
        f.write(f"Response: {json.dumps(json_response, indent=2)}\n")
    except requests.exceptions.JSONDecodeError as e:
        f.write(f"Response: {response.text}\n")
        f.write(f"Error parsing response JSON: {e}\n")
    except Exception as e:
        f.write(f"Response: {response.text}\n")
        f.write(f"Unexpected error: {e}\n")
    f.write("\n")


def main():
    base_url = 'http://localhost:5000/api'
    session = requests.Session()
    # Open the debug file
    with open('debug.txt', 'w') as f:
        ### User Admin Endpoints ###

        # Create User Account
        test_name = "Create User Account"
        url = f"{base_url}/user_admin/create_user"
        payload = {
            "username": "testuser",
            "password": "password123",
            "email": "testuser@example.com",
            "role": "buyer"
        }
        response = session.post(url, json=payload)
        log_result(f, test_name, response)

        # View User Accounts
        test_name = "View User Accounts"
        url = f"{base_url}/user_admin/view_users"
        params = {"username": "testuser"}
        response = session.get(url, params=params)
        log_result(f, test_name, response)

        # Update User Account
        test_name = "Update User Account"
        url = f"{base_url}/user_admin/update_user/testuser"
        payload = {
            "email": "newemail@example.com",
            "role": "seller"
        }
        response = session.put(url, json=payload)
        log_result(f, test_name, response)

        # Suspend User Account
        test_name = "Suspend User Account"
        url = f"{base_url}/user_admin/suspend_user/testuser"
        response = session.patch(url)
        log_result(f, test_name, response)

        # Search User Accounts
        test_name = "Search User Accounts"
        url = f"{base_url}/user_admin/search_users"
        params = {"query": "test"}
        response = session.get(url, params=params)
        log_result(f, test_name, response)

        # Create User Profile
        test_name = "Create User Profile"
        url = f"{base_url}/user_admin/create_profile"
        payload = {
            "role": "testrole",
            "rights": ["create", "view"]
        }
        response = session.post(url, json=payload)
        log_result(f, test_name, response)

        # View User Profiles
        test_name = "View User Profiles"
        url = f"{base_url}/user_admin/view_profiles"
        params = {"role": "testrole"}
        response = session.get(url, params=params)
        log_result(f, test_name, response)

        # Update User Profile
        test_name = "Update User Profile"
        url = f"{base_url}/user_admin/update_profile/testrole"
        payload = {
            "rights": ["create", "view", "update"]
        }
        response = session.put(url, json=payload)
        log_result(f, test_name, response)

        # Suspend User Profile
        test_name = "Suspend User Profile"
        url = f"{base_url}/user_admin/suspend_profile/testrole"
        response = session.patch(url)
        log_result(f, test_name, response)

        # Search User Profiles
        test_name = "Search User Profiles"
        url = f"{base_url}/user_admin/search_profiles"
        params = {"query": "test"}
        response = session.get(url, params=params)
        log_result(f, test_name, response)

        # Login
        test_name = "User Admin Login"
        url = f"{base_url}/user_admin/login"
        payload = {
            "username": "testuser",
            "password": "password123"
        }
        response = session.post(url, json=payload)
        log_result(f, test_name, response)

        # Logout
        test_name = "User Admin Logout"
        url = f"{base_url}/user_admin/logout"
        response = session.post(url)
        log_result(f, test_name, response)

        ### Used Car Agent Endpoints ###

        # Create Used Car Listing
        test_name = "Create Used Car Listing"
        url = f"{base_url}/used_car_agent/create_listing"
        payload = {
            "make": "Toyota",
            "model": "Camry",
            "year": 2015,
            "price": 12000,
            "seller_id": "test_seller_id"
        }
        response = session.post(url, json=payload)
        log_result(f, test_name, response)

        # View Used Car Listings
        test_name = "View Used Car Listings"
        url = f"{base_url}/used_car_agent/view_listings"
        response = session.get(url)
        log_result(f, test_name, response)

        # Assuming we have at least one listing to update/delete
        listings = response.json()
        if listings:
            listing_id = listings[0]['_id']

            # Update Used Car Listing
            test_name = "Update Used Car Listing"
            url = f"{base_url}/used_car_agent/update_listing/{listing_id}"
            payload = {
                "price": 11500
            }
            response = session.put(url, json=payload)
            log_result(f, test_name, response)

            # Delete Used Car Listing
            test_name = "Delete Used Car Listing"
            url = f"{base_url}/used_car_agent/delete_listing/{listing_id}"
            response = session.delete(url)
            log_result(f, test_name, response)
        else:
            f.write("No listings available to update/delete.\n")

        # Search Used Car Listings
        test_name = "Search Used Car Listings"
        url = f"{base_url}/used_car_agent/search_listings"
        params = {"query": "Toyota"}
        response = session.get(url, params=params)
        log_result(f, test_name, response)

        ### Buyer Endpoints ###

        # Search for Cars
        test_name = "Buyer Search for Cars"
        url = f"{base_url}/buyer/search_cars"
        params = {"query": "Toyota"}
        response = session.get(url, params=params)
        log_result(f, test_name, response)

        # View Listings
        test_name = "Buyer View Listings"
        url = f"{base_url}/buyer/view_listings"
        response = session.get(url)
        log_result(f, test_name, response)

        # Save Listing to Shortlist
        test_name = "Save Listing to Shortlist"
        if listings:
            listing_id = listings[0]['_id']
            url = f"{base_url}/buyer/save_listing"
            payload = {
                "user_id": "test_buyer_id",
                "listing_id": listing_id
            }
            response = session.post(url, json=payload)
            log_result(f, test_name, response)
        else:
            f.write("No listings available to save to shortlist.\n")

        # View Shortlist
        test_name = "View Shortlist"
        url = f"{base_url}/buyer/view_shortlist"
        params = {"user_id": "test_buyer_id"}
        response = session.get(url, params=params)
        log_result(f, test_name, response)

        # Rate and Review Agent
        test_name = "Rate and Review Agent"
        url = f"{base_url}/buyer/rate_review_agent"
        payload = {
            "agent_id": "test_agent_id",
            "rating": 5,
            "review": "Excellent service",
            "buyer_id": "test_buyer_id"
        }
        response = session.post(url, json=payload)
        log_result(f, test_name, response)

        ### Seller Endpoints ###

        # Get Metrics
        test_name = "Get Metrics"
        if listings:
            listing_id = listings[0]['_id']
            url = f"{base_url}/seller/get_metrics/{listing_id}"
            response = session.get(url)
            log_result(f, test_name, response)
        else:
            f.write("No listings available to get metrics.\n")

        # Track View
        test_name = "Track View"
        url = f"{base_url}/seller/track_view"
        payload = {"listing_id": "test_listing_id"}
        response = session.post(url, json=payload)
        log_result(f, test_name, response)

        # Track Shortlist
        test_name = "Track Shortlist"
        url = f"{base_url}/seller/track_shortlist"
        payload = {"listing_id": "test_listing_id"}
        response = session.post(url, json=payload)
        log_result(f, test_name, response)

        # Logout
        test_name = "Seller Logout"
        url = f"{base_url}/seller/logout"
        response = session.post(url)
        log_result(f, test_name, response)

if __name__ == '__main__':
    main()
