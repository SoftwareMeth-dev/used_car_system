# backend/models/user_model.py

import logging
import bcrypt
from utils.db import db
from bson import ObjectId
from bson.errors import InvalidId
from marshmallow import Schema, fields, ValidationError

# Configure Logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

users_collection = db['users']


def serialize_user(user):
    if not user:
        return None
    user['_id'] = str(user['_id'])
    return user


def serialize_users(users):
    return [serialize_user(user) for user in users]


class CreateUserSchema(Schema):
    username = fields.Str(required=True)
    password = fields.Str(required=True)
    email = fields.Email(required=True)
    role = fields.Str(required=True)
    # Add other necessary fields here


class UpdateUserSchema(Schema):
    password = fields.Str()
    email = fields.Email()
    role = fields.Str()
    # Add other fields that can be updated


class User:
    @staticmethod
    def authenticate_user(data):
        """
        Authenticates a user based on username and password.
        Returns a dictionary with 'data' and 'status_code'.
        """
        try:
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                logger.warning("Username or password missing.")
                return {"data": False, "status_code": 400}  # Bad Request

            user = users_collection.find_one({"username": username})
            if not user:
                logger.warning(f"User '{username}' not found.")
                return {"data": False, "status_code": 401}  # Unauthorized

            if user.get('suspended'):
                logger.warning(f"User '{username}' account is suspended.")
                return {"data": False, "status_code": 403}  # Forbidden

            hashed_password = user.get('password')
            if hashed_password != password:
                logger.warning(f"Incorrect password for user '{username}'.")
                return {"data": False, "status_code": 401}  # Unauthorized

            # Fetch profile data
            from models.profile import Profile  # Import here to avoid circular imports
            profile_result = Profile.get_profile_by_role(user.get('role'))
            if profile_result['status_code'] != 200:
                logger.error(f"Profile for role '{user.get('role')}' not found.")
                return {"data": False, "status_code": 500}  # Internal Server Error

            login_data = {
                "user": serialize_user(user),
                "profile": profile_result['data']['profile']
            }
            logger.info(f"User '{username}' authenticated successfully.")
            return {"data": login_data, "status_code": 200}  # OK

        except Exception as e:
            logger.exception(f"Exception during user authentication: {e}")
            return {"data": False, "status_code": 500}  # Internal Server Error

    @staticmethod
    def logout_user():
        """
        Handles user logout.
        Returns a dictionary with 'data' and 'status_code'.
        """
        # Implement logout logic as needed (e.g., session termination)
        logger.info("User logged out successfully.")
        return {"data": {"message": "Logout successful."}, "status_code": 200}  # OK

    @staticmethod
    def create_user(user_data):
        """
        Creates a new user account.
        Validates input data and inserts into the database.
        Returns a dictionary with 'data' and 'status_code'.
        """
        schema = CreateUserSchema()
        try:
            validated_data = schema.load(user_data)
        except ValidationError as err:
            logger.warning(f"Validation errors during user creation: {err.messages}")
            return {"data": {"error": err.messages}, "status_code": 400}  # Bad Request

        # Hash the password before storing
        try:
            password = validated_data['password'].encode('utf-8')
            hashed = bcrypt.hashpw(password, bcrypt.gensalt())
            validated_data['password'] = hashed.decode('utf-8')
        except Exception as e:
            logger.exception(f"Error hashing password: {e}")
            return {"data": {"error": "Failed to process password."}, "status_code": 500}  # Internal Server Error

        try:
            existing_user = users_collection.find_one({"username": validated_data['username']})
            if existing_user:
                logger.warning(f"Username '{validated_data['username']}' already exists.")
                return {"data": {"error": "Username already exists."}, "status_code": 400}  # Bad Request

            result = users_collection.insert_one(validated_data)
            if result.inserted_id:
                logger.info(f"User created successfully with ID: {result.inserted_id}")
                return {"data": {"message": "User created successfully."}, "status_code": 201}  # Created
            logger.error("Failed to create user without exception.")
            return {"data": {"error": "Failed to create user."}, "status_code": 500}  # Internal Server Error
        except Exception as e:
            logger.exception(f"Exception during user creation: {e}")
            return {"data": {"error": "An error occurred while creating the user."}, "status_code": 500}  # Internal Server Error

    @staticmethod
    def get_user_by_username(username=None):
        """
        Retrieves a user by username or all users if no username is provided.
        Returns a dictionary with 'data' and 'status_code'.
        """
        try:
            if username:
                # If a specific username is provided, return that user
                user = users_collection.find_one({"username": username})
                serialized = serialize_user(user)
                if serialized:
                    return {"data": {"user": serialized}, "status_code": 200}
                logger.warning(f"User not found with username: {username}")
                return {"data": {"error": "User not found."}, "status_code": 404}  # Not Found
            else:
                # If no username is provided, return all users
                users = list(users_collection.find())
                serialized = serialize_users(users)
                return {"data": {"users": serialized}, "status_code": 200}
        except Exception as e:
            logger.exception(f"Exception during fetching user(s): {e}")
            return {"data": {"error": "Failed to fetch user(s)."}, "status_code": 500}  # Internal Server Error

    @staticmethod
    def filter_users(username=None, email=None, role=None, status=None):
        """
        Filters users based on the provided criteria.
        Returns a dictionary with 'data' and 'status_code'.
        """
        try:
            query = {}
            if username:
                query["username"] = {"$regex": username, "$options": "i"}  # Case-insensitive partial match
            if email:
                query["email"] = {"$regex": email, "$options": "i"}
            if role:
                query["role"] = role
            if status:
                # Assuming status can be 'active' or 'suspended'
                if status.lower() == 'active':
                    query["suspended"] = False
                elif status.lower() == 'suspended':
                    query["suspended"] = True

            users = users_collection.find(query)
            serialized_users = serialize_users(users)
            logger.info(f"Filtered users based on criteria: {query}")
            return {"data": {"users": serialized_users}, "status_code": 200}
        except Exception as e:
            logger.exception(f"Exception during filtering users: {e}")
            return {"data": {"error": "Failed to filter users."}, "status_code": 500}  # Internal Server Error

    @staticmethod
    def get_user_by_id(user_id):
        """
        Retrieves a user by their ObjectId.
        Returns a dictionary with 'data' and 'status_code'.
        """
        try:
            oid = ObjectId(user_id)
        except InvalidId:
            logger.warning(f"Invalid user_id format: {user_id}")
            return {"data": {"error": "Invalid user_id."}, "status_code": 400}  # Bad Request

        try:
            user = users_collection.find_one({"_id": oid})
            if user:
                serialized = serialize_user(user)
                logger.info(f"Retrieved user with ID: {user_id}")
                return {"data": {"user": serialized}, "status_code": 200}
            logger.warning(f"User not found with ID: {user_id}")
            return {"data": {"error": "User not found."}, "status_code": 404}  # Not Found
        except Exception as e:
            logger.exception(f"Exception during fetching user by ID: {e}")
            return {"data": {"error": "Failed to fetch user."}, "status_code": 500}  # Internal Server Error

    @staticmethod
    def update_user(username, update_data):
        """
        Updates a user's information based on their username.
        Validates input data and updates the database.
        Returns a dictionary with 'data' and 'status_code'.
        """
        if not update_data:
            logger.warning("No update data provided.")
            return {"data": {"error": "No update data provided."}, "status_code": 400}  # Bad Request

        schema = UpdateUserSchema()
        try:
            validated_data = schema.load(update_data)
        except ValidationError as err:
            logger.warning(f"Validation errors during user update: {err.messages}")
            return {"data": {"error": err.messages}, "status_code": 400}  # Bad Request

        # If password is being updated, hash it
        if 'password' in validated_data:
            try:
                password = validated_data['password'].encode('utf-8')
                hashed = bcrypt.hashpw(password, bcrypt.gensalt())
                validated_data['password'] = hashed.decode('utf-8')
            except Exception as e:
                logger.exception(f"Error hashing password during update: {e}")
                return {"data": {"error": "Failed to process password."}, "status_code": 500}  # Internal Server Error

        try:
            result = users_collection.update_one({"username": username}, {"$set": validated_data})
            if result.modified_count > 0:
                logger.info(f"User '{username}' updated successfully.")
                return {"data": {"message": "User updated successfully."}, "status_code": 200}
            logger.warning(f"No changes made to user '{username}'.")
            return {"data": {"message": "No changes made to the user."}, "status_code": 200}
        except Exception as e:
            logger.exception(f"Exception during user update: {e}")
            return {"data": {"error": "Failed to update user."}, "status_code": 500}  # Internal Server Error

    @staticmethod
    def suspend_user(username):
        """
        Suspends a user by setting their 'suspended' field to True.
        Returns a dictionary with 'data' and 'status_code'.
        """
        try:
            result = users_collection.update_one({"username": username}, {"$set": {"suspended": True}})
            if result.modified_count > 0:
                logger.info(f"User '{username}' suspended successfully.")
                return {"data": {"message": "User suspended successfully."}, "status_code": 200}
            logger.warning(f"No changes made to user '{username}' during suspension.")
            return {"data": {"message": "No changes made to the user."}, "status_code": 200}
        except Exception as e:
            logger.exception(f"Exception during suspending user '{username}': {e}")
            return {"data": {"error": "Failed to suspend user."}, "status_code": 500}  # Internal Server Error

    @staticmethod
    def reenable_user(username):
        """
        Re-enables a user by setting their 'suspended' field to False.
        Returns a dictionary with 'data' and 'status_code'.
        """
        try:
            result = users_collection.update_one({"username": username}, {"$set": {"suspended": False}})
            if result.modified_count > 0:
                logger.info(f"User '{username}' re-enabled successfully.")
                return {"data": {"message": "User re-enabled successfully."}, "status_code": 200}
            logger.warning(f"No changes made to user '{username}' during re-enabling.")
            return {"data": {"message": "No changes made to the user."}, "status_code": 200}
        except Exception as e:
            logger.exception(f"Exception during re-enabling user '{username}': {e}")
            return {"data": {"error": "Failed to re-enable user."}, "status_code": 500}  # Internal Server Error

    @staticmethod
    def suspend_users_by_role(role):
        """
        Suspends all users with the specified role.
        Returns a dictionary with 'data' and 'status_code'.
        """
        try:
            result = users_collection.update_many({"role": role}, {"$set": {"suspended": True}})
            if result.modified_count > 0:
                logger.info(f"{result.modified_count} user(s) with role '{role}' suspended successfully.")
                return {"data": {"message": f"{result.modified_count} user(s) suspended successfully."}, "status_code": 200}
            logger.warning(f"No users found with role '{role}' to suspend.")
            return {"data": {"message": "No users found with the specified role."}, "status_code": 200}
        except Exception as e:
            logger.exception(f"Exception during suspending users by role '{role}': {e}")
            return {"data": {"error": "Failed to suspend users by role."}, "status_code": 500}  # Internal Server Error

    @staticmethod
    def reenable_users_by_role(role):
        """
        Re-enables all users with the specified role.
        Returns a dictionary with 'data' and 'status_code'.
        """
        try:
            result = users_collection.update_many({"role": role}, {"$set": {"suspended": False}})
            if result.modified_count > 0:
                logger.info(f"{result.modified_count} user(s) with role '{role}' re-enabled successfully.")
                return {"data": {"message": f"{result.modified_count} user(s) re-enabled successfully."}, "status_code": 200}
            logger.warning(f"No users found with role '{role}' to re-enable.")
            return {"data": {"message": "No users found with the specified role."}, "status_code": 200}
        except Exception as e:
            logger.exception(f"Exception during re-enabling users by role '{role}': {e}")
            return {"data": {"error": "Failed to re-enable users by role."}, "status_code": 500}  # Internal Server Error

    @staticmethod
    def search_users(query):
        """
        Searches users by username or email using a regex.
        Returns a dictionary with 'data' and 'status_code'.
        """
        if not query:
            logger.warning("Search query parameter is missing.")
            return {"data": {"error": "Query parameter is required."}, "status_code": 400}  # Bad Request
        try:
            cursor = users_collection.find({"$or": [
                {"username": {"$regex": query, "$options": "i"}},
                {"email": {"$regex": query, "$options": "i"}}
            ]})
            serialized_users = serialize_users(cursor)
            logger.info(f"Search completed for users with query: '{query}'")
            return {"data": {"users": serialized_users}, "status_code": 200}  # OK
        except Exception as e:
            logger.exception(f"Exception during searching users with query '{query}': {e}")
            return {"data": {"error": "Failed to search users."}, "status_code": 500}  # Internal Server Error
