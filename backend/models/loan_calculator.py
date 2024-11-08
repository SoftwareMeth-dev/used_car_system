# backend/models/loan_calculator_model.py

from utils.loan_calculator import LoanCalculator
from models.used_car_listing import UsedCarListing

class LoanCalculatorModel:
    @staticmethod
    def calculate_loan(data):
        """
        Handles loan calculation by validating input, fetching listing, and performing calculations.
        Returns a tuple of (response_dict, status_code).
        """
        try:
            # Extract and validate data
            listing_id = data.get('listing_id')
            annual_interest_rate = data.get('annual_interest_rate')
            loan_term_months = data.get('loan_term_months')
            down_payment = data.get('down_payment', 0)

            required_fields = ['listing_id', 'annual_interest_rate', 'loan_term_months']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return {"error": f"Missing required fields: {', '.join(missing_fields)}."}, 400

            # Type conversion and validation
            try:
                annual_interest_rate = float(annual_interest_rate)
                loan_term_months = int(loan_term_months)
                down_payment = float(down_payment)
            except ValueError:
                return {"error": "Invalid data types for one or more fields."}, 400

            # Fetch listing
            listing = UsedCarListing.get_listing_by_id(listing_id)
            if not listing:
                return {"error": "Car listing not found."}, 404

            principal = listing.get('price')
            if principal is None:
                return {"error": "Listing price not available."}, 500

            # Perform loan calculation
            loan_calculator = LoanCalculator(
                principal=principal,
                annual_interest_rate=annual_interest_rate,
                loan_term_months=loan_term_months,
                down_payment=down_payment
            )
            loan_details = loan_calculator.calculate()

            return loan_details, 200

        except ValueError as ve:
            return {"error": str(ve)}, 400
        except Exception as e:
            print(f"Error in LoanCalculatorModel.calculate_loan: {e}")
            return {"error": "An error occurred while processing the loan calculation."}, 500
