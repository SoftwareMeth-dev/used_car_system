# backend/tests/test_api_v2.py

import pytest
import json
import random
import string
from app import create_app
from models.user_model import users_collection
from models.profile import profiles_collection

def generate_random_string(length=8):
    """Generate a random string of fixed length."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

@pytest.fixture
def client():
    # Configure the app for testing
    app = create_app({
        'TESTING': True,
        'MONGO_URI': 'mongodb://localhost:27017/test_database'  # Use a test database
    })

    with app.test_client() as client:
        with app.app_context():
            yield client
        # Teardown is optional since we're not wiping the database

def test_create_profile_success(client):
    """Test creating a new user profile successfully."""
    payload = {
        "role": f"role_{generate_random_string()}",
        "rights": "all"
    }
    response = client.post('/api/user_admin/create_profile', json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data["message"] == "Profile created successfully."

def test_create_profile_duplicate(client):
    """Test creating a duplicate user profile."""
    role_name = f"role_{generate_random_string()}"
    payload = {
        "role": role_name,
        "rights": "all"
    }
    # First creation
    response1 = client.post('/api/user_admin/create_profile', json=payload)
    assert response1.status_code == 201

    # Duplicate creation
    response2 = client.post('/api/user_admin/create_profile', json=payload)
    assert response2.status_code == 400
    data = response2.get_json()
    assert "error" in data
    assert data["error"] == "Profile with this role already exists."

def test_create_user_success(client):
    """Test creating a new user successfully."""
    # First, create a profile
    role_name = f"role_{generate_random_string()}"
    profile_payload = {
        "role": role_name,
        "rights": "all"
    }
    client.post('/api/user_admin/create_profile', json=profile_payload)

    # Create user
    user_payload = {
        "username": f"user_{generate_random_string()}",
        "password": "password123",
        "email": f"{generate_random_string()}@example.com",
        "role": role_name
    }
    response = client.post('/api/user_admin/create_user', json=user_payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data["message"] == "User created successfully."

def test_create_user_missing_fields(client):
    """Test creating a user with missing required fields."""
    # Assume that 'password' is missing
    user_payload = {
        "username": f"user_{generate_random_string()}",
        # "password": "password123",  # Missing
        "email": f"{generate_random_string()}@example.com",
        "role": "admin"  # Assuming 'admin' profile exists
    }
    response = client.post('/api/user_admin/create_user', json=user_payload)
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data
    assert "password" in data["error"]

def test_create_user_duplicate_username(client):
    """Test creating a user with a duplicate username."""
    # First, create a profile
    role_name = f"role_{generate_random_string()}"
    profile_payload = {
        "role": role_name,
        "rights": "all"
    }
    client.post('/api/user_admin/create_profile', json=profile_payload)

    # Create user
    username = f"user_{generate_random_string()}"
    user_payload = {
        "username": username,
        "password": "password123",
        "email": f"{generate_random_string()}@example.com",
        "role": role_name
    }
    response1 = client.post('/api/user_admin/create_user', json=user_payload)
    assert response1.status_code == 201

    # Attempt to create another user with the same username
    user_payload_duplicate = {
        "username": username,
        "password": "password456",
        "email": f"{generate_random_string()}@example.com",
        "role": role_name
    }
    response2 = client.post('/api/user_admin/create_user', json=user_payload_duplicate)
    assert response2.status_code == 400
    data = response2.get_json()
    # Adjust based on actual error message for duplicate username
    assert "error" in data

def test_create_user_invalid_role(client):
    """Test creating a user with an invalid role (profile does not exist)."""
    user_payload = {
        "username": f"user_{generate_random_string()}",
        "password": "password123",
        "email": f"{generate_random_string()}@example.com",
        "role": "nonexistent_role"
    }
    response = client.post('/api/user_admin/create_user', json=user_payload)
    assert response.status_code == 500  # Adjust based on actual implementation
    data = response.get_json()
    assert "error" in data

def test_user_login_success(client):
    """Test user login with correct credentials."""
    # Create a profile
    role_name = f"role_{generate_random_string()}"
    profile_payload = {
        "role": role_name,
        "rights": "all"
    }
    client.post('/api/user_admin/create_profile', json=profile_payload)

    # Create user
    username = f"user_{generate_random_string()}"
    password = "password123"
    email = f"{generate_random_string()}@example.com"
    user_payload = {
        "username": username,
        "password": password,
        "email": email,
        "role": role_name
    }
    client.post('/api/user_admin/create_user', json=user_payload)

    # Assume there is a login endpoint at /api/user_admin/login
    login_payload = {
        "username": username,
        "password": password
    }
    response = client.post('/api/user_admin/login', json=login_payload)
    assert response.status_code == 200
    data = response.get_json()
    assert "message" in data
    assert data["message"] == "Login successful."

def test_user_login_wrong_password(client):
    """Test user login with incorrect password."""
    # Create a profile
    role_name = f"role_{generate_random_string()}"
    profile_payload = {
        "role": role_name,
        "rights": "all"
    }
    client.post('/api/user_admin/create_profile', json=profile_payload)

    # Create user
    username = f"user_{generate_random_string()}"
    correct_password = "password123"
    wrong_password = "wrongpassword"
    email = f"{generate_random_string()}@example.com"
    user_payload = {
        "username": username,
        "password": correct_password,
        "email": email,
        "role": role_name
    }
    client.post('/api/user_admin/create_user', json=user_payload)

    # Attempt to login with wrong password
    login_payload = {
        "username": username,
        "password": wrong_password
    }
    response = client.post('/api/user_admin/login', json=login_payload)
    assert response.status_code == 401  # Unauthorized
    data = response.get_json()
    assert "error" in data
    assert data["error"] == "Invalid credentials."

def test_view_profiles(client):
    """Test viewing all profiles."""
    # Create profiles
    profiles = [
        {"role": f"role_{generate_random_string()}", "rights": "all"},
        {"role": f"role_{generate_random_string()}", "rights": "limited"}
    ]
    for profile in profiles:
        client.post('/api/user_admin/create_profile', json=profile)

    response = client.get('/api/user_admin/view_profiles')
    assert response.status_code == 200
    data = response.get_json()
    assert "profiles" in data
    assert len(data["profiles"]) >= 2  # Considering existing profiles

def test_view_profiles_filter(client):
    """Test viewing profiles filtered by role."""
    # Create profiles
    specific_role = f"role_{generate_random_string()}"
    other_role = f"role_{generate_random_string()}"
    profiles = [
        {"role": specific_role, "rights": "all"},
        {"role": other_role, "rights": "limited"}
    ]
    for profile in profiles:
        client.post('/api/user_admin/create_profile', json=profile)

    response = client.get('/api/user_admin/view_profiles', query_string={"role": specific_role})
    assert response.status_code == 200
    data = response.get_json()
    assert "profiles" in data
    assert len(data["profiles"]) >= 1
    assert any(profile["role"] == specific_role for profile in data["profiles"])

def test_view_users(client):
    """Test viewing all users."""
    # Create a profile
    role_name = f"role_{generate_random_string()}"
    profile_payload = {
        "role": role_name,
        "rights": "all"
    }
    client.post('/api/user_admin/create_profile', json=profile_payload)

    # Create users
    users = [
        {
            "username": f"user_{generate_random_string()}",
            "password": "password123",
            "email": f"{generate_random_string()}@example.com",
            "role": role_name
        },
        {
            "username": f"user_{generate_random_string()}",
            "password": "password456",
            "email": f"{generate_random_string()}@example.com",
            "role": role_name
        }
    ]
    for user in users:
        client.post('/api/user_admin/create_user', json=user)

    response = client.get('/api/user_admin/view_users')
    assert response.status_code == 200
    data = response.get_json()
    assert "users" in data
    assert len(data["users"]) >= 2  # Considering existing users

def test_view_users_filter(client):
    """Test viewing users filtered by username."""
    # Create a profile
    role_name = f"role_{generate_random_string()}"
    profile_payload = {
        "role": role_name,
        "rights": "all"
    }
    client.post('/api/user_admin/create_profile', json=profile_payload)

    # Create users
    specific_username = f"user_{generate_random_string()}"
    other_username = f"user_{generate_random_string()}"
    users = [
        {
            "username": specific_username,
            "password": "password123",
            "email": f"{generate_random_string()}@example.com",
            "role": role_name
        },
        {
            "username": other_username,
            "password": "password456",
            "email": f"{generate_random_string()}@example.com",
            "role": role_name
        }
    ]
    for user in users:
        client.post('/api/user_admin/create_user', json=user)

    response = client.get('/api/user_admin/view_users', query_string={"username": specific_username})
    assert response.status_code == 200
    data = response.get_json()
    assert "users" in data
    assert len(data["users"]) >= 1
    assert any(user["username"] == specific_username for user in data["users"])

def test_suspend_user(client):
    """Test suspending a user."""
    # Create a profile and user
    role_name = f"role_{generate_random_string()}"
    profile_payload = {
        "role": role_name,
        "rights": "all"
    }
    client.post('/api/user_admin/create_profile', json=profile_payload)

    username = f"user_{generate_random_string()}"
    user_payload = {
        "username": username,
        "password": "password123",
        "email": f"{generate_random_string()}@example.com",
        "role": role_name
    }
    client.post('/api/user_admin/create_user', json=user_payload)

    # Suspend the user
    response = client.patch(f'/api/user_admin/suspend_user/{username}')
    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "User suspended successfully."

    # Verify suspension in the database
    user = users_collection.find_one({"username": username})
    assert user["suspended"] == True

def test_reenable_user(client):
    """Test re-enabling a suspended user."""
    # Create a profile and user
    role_name = f"role_{generate_random_string()}"
    profile_payload = {
        "role": role_name,
        "rights": "all"
    }
    client.post('/api/user_admin/create_profile', json=profile_payload)

    username = f"user_{generate_random_string()}"
    user_payload = {
        "username": username,
        "password": "password123",
        "email": f"{generate_random_string()}@example.com",
        "role": role_name
    }
    client.post('/api/user_admin/create_user', json=user_payload)

    # Suspend the user first
    client.patch(f'/api/user_admin/suspend_user/{username}')

    # Re-enable the user
    response = client.patch(f'/api/user_admin/reenable_user/{username}')
    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "User re-enabled successfully."

    # Verify re-enabling in the database
    user = users_collection.find_one({"username": username})
    assert user["suspended"] == False

def test_suspend_profile(client):
    """Test suspending a profile and associated users."""
    # Create profiles and users
    role_admin = f"role_admin_{generate_random_string()}"
    role_buyer = f"role_buyer_{generate_random_string()}"

    profiles = [
        {"role": role_admin, "rights": "all"},
        {"role": role_buyer, "rights": "limited"}
    ]
    for profile in profiles:
        client.post('/api/user_admin/create_profile', json=profile)

    users = [
        {
            "username": f"admin_{generate_random_string()}",
            "password": "password123",
            "email": f"admin_{generate_random_string()}@example.com",
            "role": role_admin
        },
        {
            "username": f"buyer_{generate_random_string()}",
            "password": "password456",
            "email": f"buyer_{generate_random_string()}@example.com",
            "role": role_buyer
        }
    ]
    for user in users:
        client.post('/api/user_admin/create_user', json=user)

    # Suspend the 'admin' profile
    response = client.patch(f'/api/user_admin/suspend_profile/{role_admin}')
    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Profile and associated users suspended successfully."

    # Verify suspension in the database
    profile = profiles_collection.find_one({"role": role_admin})
    assert profile["suspended"] == True

    admin_user = users_collection.find_one({"role": role_admin})
    assert admin_user["suspended"] == True

    buyer_user = users_collection.find_one({"role": role_buyer})
    assert buyer_user["suspended"] == False  # Should remain unaffected

def test_reenable_profile(client):
    """Test re-enabling a suspended profile and associated users."""
    # Create profiles and users
    role_admin = f"role_admin_{generate_random_string()}"
    role_buyer = f"role_buyer_{generate_random_string()}"

    profiles = [
        {"role": role_admin, "rights": "all"},
        {"role": role_buyer, "rights": "limited"}
    ]
    for profile in profiles:
        client.post('/api/user_admin/create_profile', json=profile)

    users = [
        {
            "username": f"admin_{generate_random_string()}",
            "password": "password123",
            "email": f"admin_{generate_random_string()}@example.com",
            "role": role_admin
        },
        {
            "username": f"buyer_{generate_random_string()}",
            "password": "password456",
            "email": f"buyer_{generate_random_string()}@example.com",
            "role": role_buyer
        }
    ]
    for user in users:
        client.post('/api/user_admin/create_user', json=user)

    # Suspend the 'admin' profile first
    client.patch(f'/api/user_admin/suspend_profile/{role_admin}')

    # Re-enable the 'admin' profile
    response = client.patch(f'/api/user_admin/reenable_profile/{role_admin}')
    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Profile and associated users re-enabled successfully."

    # Verify re-enabling in the database
    profile = profiles_collection.find_one({"role": role_admin})
    assert profile["suspended"] == False

    admin_user = users_collection.find_one({"role": role_admin})
    assert admin_user["suspended"] == False

def test_search_profiles(client):
    """Test searching profiles by query."""
    # Create profiles
    profiles = [
        {"role": f"role_{generate_random_string()}", "rights": "all"},
        {"role": f"role_{generate_random_string()}", "rights": "limited"},
        {"role": f"role_{generate_random_string()}", "rights": "basic"}
    ]
    for profile in profiles:
        client.post('/api/user_admin/create_profile', json=profile)

    # Search for profiles with 'all' rights
    response = client.get('/api/user_admin/search_profiles', query_string={"query": "all"})
    assert response.status_code == 200
    data = response.get_json()
    assert "profiles" in data
    assert len(data["profiles"]) >= 1
    assert all(profile["rights"] == "all" for profile in data["profiles"])

def test_search_users(client):
    """Test searching users by query."""
    # Create a profile
    role_name = f"role_{generate_random_string()}"
    profile_payload = {
        "role": role_name,
        "rights": "all"
    }
    client.post('/api/user_admin/create_profile', json=profile_payload)

    # Create users
    users = [
        {
            "username": f"user_{generate_random_string()}",
            "password": "password123",
            "email": "john.doe@example.com",
            "role": role_name
        },
        {
            "username": f"user_{generate_random_string()}",
            "password": "password456",
            "email": "jane.doe@example.com",
            "role": role_name
        }
    ]
    for user in users:
        client.post('/api/user_admin/create_user', json=user)

    # Search for users with email containing 'john'
    response = client.get('/api/user_admin/search_users', query_string={"query": "john"})
    assert response.status_code == 200
    data = response.get_json()
    assert "users" in data
    assert len(data["users"]) >= 1
    assert any("john" in user["email"] for user in data["users"])

def test_update_profile_success(client):
    """Test updating a profile's rights successfully."""
    # Create a profile
    role_name = f"role_{generate_random_string()}"
    initial_payload = {
        "role": role_name,
        "rights": "limited"
    }
    client.post('/api/user_admin/create_profile', json=initial_payload)

    # Update the profile's rights
    update_payload = {
        "rights": "all"
    }
    response = client.put(f'/api/user_admin/update_profile/{role_name}', json=update_payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Profile updated successfully."

    # Verify update in the database
    profile = profiles_collection.find_one({"role": role_name})
    assert profile["rights"] == "all"

def test_update_user_success(client):
    """Test updating a user's email successfully."""
    # Create a profile and user
    role_name = f"role_{generate_random_string()}"
    profile_payload = {
        "role": role_name,
        "rights": "all"
    }
    client.post('/api/user_admin/create_profile', json=profile_payload)

    username = f"user_{generate_random_string()}"
    user_payload = {
        "username": username,
        "password": "password123",
        "email": f"{generate_random_string()}@example.com",
        "role": role_name
    }
    client.post('/api/user_admin/create_user', json=user_payload)

    # Update the user's email
    update_payload = {
        "email": f"{generate_random_string()}@newdomain.com"
    }
    response = client.put(f'/api/user_admin/update_user/{username}', json=update_payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "User updated successfully."

    # Verify update in the database
    user = users_collection.find_one({"username": username})
    assert user["email"] == update_payload["email"]

def test_update_user_not_found(client):
    """Test updating a non-existent user."""
    update_payload = {
        "email": f"{generate_random_string()}@newdomain.com"
    }
    response = client.put(f'/api/user_admin/update_user/nonexistent_user', json=update_payload)
    assert response.status_code == 200  # As per model, returns 200 even if no changes
    data = response.get_json()
    assert data["message"] == "No changes made to the user."

def test_suspend_user_not_found(client):
    """Test suspending a non-existent user."""
    response = client.patch('/api/user_admin/suspend_user/nonexistent_user')
    assert response.status_code == 200  # As per model, returns 200 even if no changes
    data = response.get_json()
    assert data["message"] == "No changes made to the user."

def test_reenable_user_not_found(client):
    """Test re-enabling a non-existent user."""
    response = client.patch('/api/user_admin/reenable_user/nonexistent_user')
    assert response.status_code == 200  # As per model, returns 200 even if no changes
    data = response.get_json()
    assert data["message"] == "No changes made to the user."

def test_suspend_profile_not_found(client):
    """Test suspending a non-existent profile."""
    role_name = f"role_{generate_random_string()}"
    response = client.patch(f'/api/user_admin/suspend_profile/{role_name}')
    assert response.status_code == 404
    data = response.get_json()
    assert data["error"] == "Profile not found."

def test_reenable_profile_not_found(client):
    """Test re-enabling a non-existent profile."""
    role_name = f"role_{generate_random_string()}"
    response = client.patch(f'/api/user_admin/reenable_profile/{role_name}')
    assert response.status_code == 404
    data = response.get_json()
    assert data["error"] == "Profile not found."
