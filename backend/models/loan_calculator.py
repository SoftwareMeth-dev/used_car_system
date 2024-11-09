from utils.loan_calculator import LoanCalculator as LoanCalcUtil

from models.used_car_listing import UsedCarListing

class LoanCalculator:
    @staticmethod
    def calculate_loan(data):
        try:
            # Access data from dictionary
            listing_id = data.get('listing_id')
            annual_interest_rate = data.get('annual_interest_rate')
            loan_term_months = data.get('loan_term_months')
            down_payment = data.get('down_payment', 0)  # Default to 0 if not provided 

            # Type conversion and validation
            try:
                annual_interest_rate = float(annual_interest_rate)
                loan_term_months = int(loan_term_months)
                down_payment = float(down_payment)
            except ValueError:
                return {"error": "Invalid data types for one or more fields."}, 400

            # Validate input values
            if annual_interest_rate <= 0:
                return {"error": "Annual interest rate must be greater than zero."}, 400
            if loan_term_months <= 0:
                return {"error": "Loan term must be greater than zero months."}, 400
            if down_payment < 0:
                return {"error": "Down payment cannot be negative."}, 400

            listing_response = UsedCarListing.get_listing_by_id(listing_id)
            if not listing_response:
                return {"error": "Car listing not found."}, 404

            listing_data, status_code = listing_response

            if status_code != 200:
                return {"error": "Car listing not found."}, status_code

            listing = listing_data.get('listing')
            if not listing:
                return {"error": "Listing data not available."}, 500

            principal = listing.get('price')
            if principal is None:
                return {"error": "Listing price not available."}, 500
            if principal <= 0:
                return {"error": "Listing price must be greater than zero."}, 400

            # Perform loan calculation
            loan_calculator = LoanCalcUtil(
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
            print(f"Error in LoanCalculator.calculate_loan: {e}")
            return {"error": "An internal error occurred while processing the loan calculation."}, 500
