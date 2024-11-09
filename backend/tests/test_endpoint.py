import unittest
import requests
import uuid
import logging
import time

class TestEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """
        Set up test environment by creating unique users for each role.
        """
        # Configure logging
        logging.basicConfig(filename='test_log.log',
                            level=logging.INFO,
                            format='%(asctime)s - %(levelname)s - %(message)s')
        cls.logger = logging.getLogger('TestEndpoints')
        
        # Base URL of the Flask backend
        cls.base_url = 'http://localhost:5000/api'
        
        # Generate a unique identifier to ensure test data uniqueness
        cls.unique_id = str(uuid.uuid4())
        
        # Define user credentials with unique usernames
        cls.user_admin = {
            'username': f'user_admin_{cls.unique_id}',
            'password': 'adminpass',
            'email': f'user_admin_{cls.unique_id}@example.com',
            'role': 'user_admin'
        }
        
        cls.used_car_agent = {
            'username': f'agent_{cls.unique_id}',
            'password': 'agentpass',
            'email': f'agent_{cls.unique_id}@example.com',
            'role': 'used_car_agent'
        }
        
        cls.buyer = {
            'username': f'buyer_{cls.unique_id}',
            'password': 'buyerpass',
            'email': f'buyer_{cls.unique_id}@example.com',
            'role': 'buyer'
        }
        
        cls.seller = {
            'username': f'seller_{cls.unique_id}',
            'password': 'sellerpass',
            'email': f'seller_{cls.unique_id}@example.com',
            'role': 'seller'
        }
        
        cls.logger.info("Starting setUpClass: Creating test users.")
        
        # Create test users via user_admin endpoints
        try:
            # Create User Admin user
            response = requests.post(f'{cls.base_url}/user_admin/create_user', json=cls.user_admin)
            if response.status_code in [200, 201]:
                cls.logger.info(f"Created User Admin: {cls.user_admin['username']}")
            else:
                cls.logger.error(f"Failed to create User Admin: {response.text}")
            
            # Create Used Car Agent
            response = requests.post(f'{cls.base_url}/user_admin/create_user', json=cls.used_car_agent)
            if response.status_code in [200, 201]:
                cls.logger.info(f"Created Used Car Agent: {cls.used_car_agent['username']}")
            else:
                cls.logger.error(f"Failed to create Used Car Agent: {response.text}")
            
            # Create Buyer
            response = requests.post(f'{cls.base_url}/user_admin/create_user', json=cls.buyer)
            if response.status_code in [200, 201]:
                cls.logger.info(f"Created Buyer: {cls.buyer['username']}")
            else:
                cls.logger.error(f"Failed to create Buyer: {response.text}")
            
            # Create Seller
            response = requests.post(f'{cls.base_url}/user_admin/create_user', json=cls.seller)
            if response.status_code in [200, 201]:
                cls.logger.info(f"Created Seller: {cls.seller['username']}")
            else:
                cls.logger.error(f"Failed to create Seller: {response.text}")
            
            # Allow some time for the database to update
            time.sleep(1)
        except Exception as e:
            cls.logger.exception(f"Exception during setUpClass: {e}")
    
    @classmethod
    def tearDownClass(cls):
        """
        Clean up test environment by suspending all created users.
        """
        cls.logger.info("Starting tearDownClass: Cleaning up test users.")
        try:
            # Suspend User Admin
            response = requests.patch(f'{cls.base_url}/user_admin/suspend_user/{cls.user_admin["username"]}')
            if response.status_code == 200:
                cls.logger.info(f"Suspended User Admin: {cls.user_admin['username']}")
            else:
                cls.logger.error(f"Failed to suspend User Admin: {response.text}")
            
            # Suspend Used Car Agent
            response = requests.patch(f'{cls.base_url}/user_admin/suspend_user/{cls.used_car_agent["username"]}')
            if response.status_code == 200:
                cls.logger.info(f"Suspended Used Car Agent: {cls.used_car_agent['username']}")
            else:
                cls.logger.error(f"Failed to suspend Used Car Agent: {response.text}")
            
            # Suspend Buyer
            response = requests.patch(f'{cls.base_url}/user_admin/suspend_user/{cls.buyer["username"]}')
            if response.status_code == 200:
                cls.logger.info(f"Suspended Buyer: {cls.buyer['username']}")
            else:
                cls.logger.error(f"Failed to suspend Buyer: {response.text}")
            
            # Suspend Seller
            response = requests.patch(f'{cls.base_url}/user_admin/suspend_user/{cls.seller["username"]}')
            if response.status_code == 200:
                cls.logger.info(f"Suspended Seller: {cls.seller["username"]}")
            else:
                cls.logger.error(f"Failed to suspend Seller: {response.text}")
            
            # Allow some time for the database to update
            time.sleep(1)
        except Exception as e:
            cls.logger.exception(f"Exception during tearDownClass: {e}")
    
    def test_1_user_admin_login_logout(self):
        """
        Test User Admin login and logout functionalities.
        """
        self.logger.info("Testing User Admin Login.")
        # Login
        login_payload = {
            'username': self.user_admin['username'],
            'password': self.user_admin['password']
        }
        response = requests.post(f'{self.base_url}/login', json=login_payload)
        self.assertEqual(response.status_code, 200, "User Admin login failed.")
        data = response.json()
        self.logger.info(f"User Admin login response: {data}")
        self.assertIn('user', data)
        self.assertIn('profile', data)
        self.assertEqual(data['user']['username'], self.user_admin['username'])
        
        # Logout
        self.logger.info("Testing User Admin Logout.")
        response = requests.post(f'{self.base_url}/logout')
        self.assertEqual(response.status_code, 200, "User Admin logout failed.")
        data = response.json()
        self.assertTrue(data)
    
    def test_2_used_car_agent_login_logout(self):
        """
        Test Used Car Agent login and logout functionalities.
        """
        self.logger.info("Testing Used Car Agent Login.")
        # Login
        login_payload = {
            'username': self.used_car_agent['username'],
            'password': self.used_car_agent['password']
        }
        response = requests.post(f'{self.base_url}/login', json=login_payload)
        self.assertEqual(response.status_code, 200, "Used Car Agent login failed.")
        data = response.json()
        self.logger.info(f"Used Car Agent login response: {data}")
        self.assertIn('user', data)
        self.assertIn('profile', data)
        self.assertEqual(data['user']['username'], self.used_car_agent['username'])
        
        # Logout
        self.logger.info("Testing Used Car Agent Logout.")
        response = requests.post(f'{self.base_url}/logout')
        self.assertEqual(response.status_code, 200, "Used Car Agent logout failed.")
        data = response.json()
        self.assertTrue(data)
    
    def test_3_buyer_login_logout(self):
        """
        Test Buyer login and logout functionalities.
        """
        self.logger.info("Testing Buyer Login.")
        # Login
        login_payload = {
            'username': self.buyer['username'],
            'password': self.buyer['password']
        }
        response = requests.post(f'{self.base_url}/login', json=login_payload)
        self.assertEqual(response.status_code, 200, "Buyer login failed.")
        data = response.json()
        self.logger.info(f"Buyer login response: {data}")
        self.assertIn('user', data)
        self.assertIn('profile', data)
        self.assertEqual(data['user']['username'], self.buyer['username'])
        
        # Logout
        self.logger.info("Testing Buyer Logout.")
        response = requests.post(f'{self.base_url}/logout')
        self.assertEqual(response.status_code, 200, "Buyer logout failed.")
        data = response.json()
        self.assertTrue(data)
    
    def test_4_seller_login_logout(self):
        """
        Test Seller login and logout functionalities.
        """
        self.logger.info("Testing Seller Login.")
        # Login
        login_payload = {
            'username': self.seller['username'],
            'password': self.seller['password']
        }
        response = requests.post(f'{self.base_url}/login', json=login_payload)
        self.assertEqual(response.status_code, 200, "Seller login failed.")
        data = response.json()
        self.logger.info(f"Seller login response: {data}")
        self.assertIn('user', data)
        self.assertIn('profile', data)
        self.assertEqual(data['user']['username'], self.seller['username'])
        
        # Logout
        self.logger.info("Testing Seller Logout.")
        response = requests.post(f'{self.base_url}/logout')
        self.assertEqual(response.status_code, 200, "Seller logout failed.")
        data = response.json()
        self.assertTrue(data)
    
    def test_5_login_wrong_password(self):
        """
        Test login functionality with incorrect password.
        """
        self.logger.info("Testing Login with Wrong Password.")
        # Attempt to login with wrong password for User Admin
        login_payload = {
            'username': self.user_admin['username'],
            'password': 'wrongpassword'
        }
        response = requests.post(f'{self.base_url}/login', json=login_payload)
        self.assertEqual(response.status_code, 401, "Login should have failed with wrong password.")
        data = response.json()
        self.logger.info(f"Login with wrong password response: {data}")
        self.assertIn('error', data)
        self.assertEqual(data['error'], "Invalid username or password.")
    
    def test_6_login_non_existing_user(self):
        """
        Test login functionality with a non-existing user.
        """
        self.logger.info("Testing Login with Non-existing User.")
        # Attempt to login with a non-existing username
        login_payload = {
            'username': f'non_existing_{self.unique_id}',
            'password': 'somepassword'
        }
        response = requests.post(f'{self.base_url}/login', json=login_payload)
        self.assertEqual(response.status_code, 401, "Login should have failed for non-existing user.")
        data = response.json()
        self.logger.info(f"Login with non-existing user response: {data}")
        self.assertIn('error', data)
        self.assertEqual(data['error'], "Invalid username or password.")
     
    
    def test_8_create_duplicate_user(self):
        """
        Test creating a duplicate user to ensure appropriate error handling.
        """
        self.logger.info("Testing Creating Duplicate User.")
        # Attempt to create a user that already exists
        duplicate_user = self.user_admin.copy()
        response = requests.post(f'{self.base_url}/user_admin/create_user', json=duplicate_user)
        self.assertEqual(response.status_code, 400, "Creating duplicate user should fail.")
        data = response.json()
        self.logger.info(f"Creating duplicate user response: {data}")
        self.assertIn('error', data)

if __name__ == '__main__':
    # Option 1: Redirect unittest output to a text file using command line
    # Run the tests with: python test_endpoint.py > unittest_output.txt

    # Option 2: Redirect within the script
    with open('unittest_output.txt', 'w') as f:
        runner = unittest.TextTestRunner(stream=f, verbosity=2)
        unittest.main(testRunner=runner, exit=False)
