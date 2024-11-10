// src/controllers/LoanCalculatorController.js

class LoanCalculatorController {
    calculateMonthlyPayment(loanAmount, annualInterestRate, loanTermYears) {
      const principal = parseFloat(loanAmount);
      const monthlyInterestRate = parseFloat(annualInterestRate) / 100 / 12;
      const numberOfPayments = parseFloat(loanTermYears) * 12;
  
      if (isNaN(principal) || isNaN(monthlyInterestRate) || isNaN(numberOfPayments) || principal <= 0 || monthlyInterestRate <= 0 || numberOfPayments <= 0) {
        throw new Error("Please provide valid numeric inputs for all fields.");
      }
  
      const monthlyPayment = (principal * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
      return monthlyPayment;
    }
  }
  
  export default new LoanCalculatorController();
  