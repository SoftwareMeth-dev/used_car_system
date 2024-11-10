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
        />
        <TextField
          label="Annual Interest Rate (%)"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Loan Term (Years)"
          value={loanTerm}
          onChange={(e) => setLoanTerm(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
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
