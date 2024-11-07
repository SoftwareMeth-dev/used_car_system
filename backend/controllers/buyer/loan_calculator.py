# backend/controllers/buyer/loan_calculator_controller.py

from flask import Blueprint, request, jsonify
from utils.loan_calculator import LoanCalculator
from models.used_car_listing import UsedCarListing

loan_calculator_bp = Blueprint('loan_calculator', __name__, url_prefix='/api/buyer')

class LoanCalculatorController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        loan_calculator_bp.add_url_rule('/loan_calculator', view_func=self.loan_calculator, methods=['POST'])

    def loan_calculator(self):
        """
        Endpoint to calculate loan estimates based on provided parameters.
        Expects JSON payload with:
            - listing_id (str): The ID of the car listing.
            - annual_interest_rate (float): The annual interest rate in percentage.
            - loan_term_months (int): The loan term in months.
            - down_payment (float, optional): The down payment amount.

        Returns:
            - JSON with monthly_payment, total_payment, and total_interest.
        """
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No input data provided."}), 400

            listing_id = data.get('listing_id')
            annual_interest_rate = data.get('annual_interest_rate')
            loan_term_months = data.get('loan_term_months')
            down_payment = data.get('down_payment', 0)

            # Validate required fields
            required_fields = ['listing_id', 'annual_interest_rate', 'loan_term_months']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}."}), 400

            # Type validation
            try:
                annual_interest_rate = float(annual_interest_rate)
                loan_term_months = int(loan_term_months)
                down_payment = float(down_payment)
            except ValueError:
                return jsonify({"error": "Invalid data types for one or more fields."}), 400

            # Fetch listing by listing_id
            listing = UsedCarListing.get_listing_by_id(listing_id)
            if not listing:
                return jsonify({"error": "Car listing not found."}), 404

            principal = listing.get('price')
            if principal is None:
                return jsonify({"error": "Listing price not available."}), 500

            # Instantiate the LoanCalculator class
            loan_calculator = LoanCalculator(
                principal=principal,
                annual_interest_rate=annual_interest_rate,
                loan_term_months=loan_term_months,
                down_payment=down_payment
            )

            # Perform calculation
            loan_details = loan_calculator.calculate()

            return jsonify(loan_details), 200

        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400  # Bad Request for validation errors
        except Exception as e:
            print(f"Error in loan_calculator: {e}")
            return jsonify({"error": "An error occurred while processing the loan calculation."}), 500  # Internal Server Error

# Instantiate the controller to register routes
loan_calculator_controller = LoanCalculatorController()
