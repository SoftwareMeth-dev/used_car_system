# backend/controllers/buyer/loan_calculator_controller.py

from flask import Blueprint, request, jsonify
from models.loan_calculator import LoanCalculatorModel

loan_calculator_bp = Blueprint('loan_calculator', __name__, url_prefix='/api/buyer')

class LoanCalculatorController:
    def __init__(self):
        self.register_routes()

    def register_routes(self):
        loan_calculator_bp.add_url_rule('/loan_calculator', view_func=self.loan_calculator, methods=['POST'])

    def loan_calculator(self):
        data = request.get_json()
        response, status_code = LoanCalculatorModel.calculate_loan(data)
        return jsonify(response), status_code

# Instantiate the controller to register routes
loan_calculator_controller = LoanCalculatorController()