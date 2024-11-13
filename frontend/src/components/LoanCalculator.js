// src/components/buyer/LoanCalculator.js
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Divider } from '@mui/material';
import loanCalculatorController from '../../controllers/LoanCalculatorController';

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState(null);

  const handleCalculate = () => {
    const payment = loanCalculatorController.calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
    setMonthlyPayment(payment);
  };

  const loanCalculatorController = {
    calculateMonthlyPayment: (loanAmount, annualInterestRate, loanTermYears) => {
      const principal = parseFloat(loanAmount);
      const monthlyInterestRate = parseFloat(annualInterestRate) / 100 / 12;
      const numberOfPayments = parseInt(loanTermYears) * 12;
  
      if (isNaN(principal) || isNaN(monthlyInterestRate) || isNaN(numberOfPayments) || principal <= 0 || monthlyInterestRate < 0 || numberOfPayments <= 0) {
        return 0;
      }
  
      const monthlyPayment = (principal * monthlyInterestRate) /
        (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
        
      return monthlyPayment;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Loan Calculator</Typography>
      
      <Paper sx={{ padding: 3, mb: 3 }}>
        <TextField
          label="Loan Amount"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          type="number"
        />
        <TextField
          label="Annual Interest Rate (%)"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          type="number"
        />
        <TextField
          label="Loan Term (Years)"
          value={loanTerm}
          onChange={(e) => setLoanTerm(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          type="number"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCalculate}
          fullWidth
        >
          Calculate
        </Button>
      </Paper>

      {monthlyPayment !== null && (
        <Paper sx={{ padding: 3 }}>
          <Typography variant="h6">Estimated Monthly Payment</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1">${monthlyPayment.toFixed(2)}</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default LoanCalculator;
