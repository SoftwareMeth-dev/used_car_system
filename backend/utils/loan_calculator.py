# backend/utils/loan_calculator.py

class LoanCalculator:
    """
    A class to calculate loan details such as monthly payments, total payments, and total interest.
    """

    def __init__(self, principal, annual_interest_rate, loan_term_months, down_payment=0):
        """
        Initializes the LoanCalculator with the necessary loan parameters.

        :param principal: (float) The total loan amount.
        :param annual_interest_rate: (float) The annual interest rate (in percentage).
        :param loan_term_months: (int) The loan term in months.
        :param down_payment: (float) The down payment amount. Defaults to 0.
        """
        self.principal = principal
        self.annual_interest_rate = annual_interest_rate
        self.loan_term_months = loan_term_months
        self.down_payment = down_payment

        # Perform validation upon initialization
        self.validate_inputs()

    def validate_inputs(self):
        """
        Validates the loan parameters to ensure they are logical and within acceptable ranges.
        """
        if self.principal <= 0:
            raise ValueError("Principal must be greater than 0.")
        if self.annual_interest_rate < 0:
            raise ValueError("Interest rate cannot be negative.")
        if self.loan_term_months <= 0:
            raise ValueError("Loan term must be greater than 0.")
        if self.down_payment < 0:
            raise ValueError("Down payment cannot be negative.")
        if self.down_payment > self.principal:
            raise ValueError("Down payment cannot exceed principal.")

    def calculate(self):
        """
        Calculates the monthly payment, total payment, and total interest for the loan.

        :return: (dict) A dictionary containing 'monthly_payment', 'total_payment', and 'total_interest'.
        """
        adjusted_principal = self.principal - self.down_payment

        if self.annual_interest_rate == 0:
            # No interest loan
            monthly_payment = adjusted_principal / self.loan_term_months
            total_payment = adjusted_principal
            total_interest = 0.0
        else:
            monthly_interest_rate = (self.annual_interest_rate / 100) / 12
            monthly_payment = adjusted_principal * (
                (monthly_interest_rate * (1 + monthly_interest_rate) ** self.loan_term_months) /
                ((1 + monthly_interest_rate) ** self.loan_term_months - 1)
            )
            total_payment = monthly_payment * self.loan_term_months
            total_interest = total_payment - adjusted_principal

        return {
            "monthly_payment": round(monthly_payment, 2),
            "total_payment": round(total_payment, 2),
            "total_interest": round(total_interest, 2)
        }
