/**
 * Repayment Strategy Calculation Functions
 * 
 * This file contains the core logic for calculating different debt repayment strategies:
 * - Minimum payments only
 * - Avalanche method (highest interest first)
 * - Snowball method (lowest balance first)
 * 
 * Credit Card Logic:
 * 1. Apply interest to balance
 * 2. Apply payment (interest first, then principal)
 * 3. Apply extra payment (straight to principal)
 * 
 * Amortized Loan Logic:
 * 1. Skip interest step (payment includes both interest and principal)
 * 2. Apply fixed payment
 * 3. Apply extra payment (straight to principal)
 */

/**
 * Debug function to log payment application details
 * Set DEBUG_PAYMENTS to true to enable logging
 */
const DEBUG_PAYMENTS = false;
const debugLog = (message, data = null) => {
  if (DEBUG_PAYMENTS) {
    console.log(`[PAYMENT DEBUG] ${message}`, data || '');
  }
};

/**
 * Calculate the monthly interest for a debt
 * @param {Object} debt - The debt object
 * @returns {number} - Monthly interest amount
 */
const calculateMonthlyInterest = (debt) => {
  return (debt.balance * (debt.apr / 100)) / 12;
};

/**
 * Process monthly payments for a single debt following the 3-step logic
 * @param {Object} debt - The debt object (will be modified)
 * @param {number} extraPayment - Extra payment to apply (0 for minimum payments only)
 * @param {Object} totals - Running totals object to update
 * @returns {Object} - Payment breakdown for this debt
 */
const processDebtPayment = (debt, extraPayment, totals) => {
  if (debt.balance <= 0) {
    return {
      debtId: debt.id,
      payment: 0,
      minimumPayment: 0,
      extraPayment: 0,
      balance: 0,
      interestCharged: 0,
      originalMinPayment: debt.originalMinPayment || debt.minPayment
    };
  }

  let interestCharged = 0;
  let minPayment = 0;
  let actualPayment = 0;
  let extraApplied = 0;

  if (debt.isCreditCard) {
    // CREDIT CARD LOGIC:
    // Step 1: Apply Interest to balance
    interestCharged = calculateMonthlyInterest(debt);
    debt.balance += interestCharged;
    totals.totalInterest += interestCharged;
    
    // Step 2: Calculate dynamic minimum payment based on current balance
    // Credit card minimum = 1% of balance + monthly interest, or $25 minimum
    const monthlyInterest = calculateMonthlyInterest(debt);
    const percentageOfBalance = debt.balance * 0.01;
    const calculatedMinimum = percentageOfBalance + monthlyInterest;
    const fixedMinimum = debt.balance < 25 ? debt.balance : 25;
    minPayment = Math.min(Math.max(calculatedMinimum, fixedMinimum), debt.balance);
    
    // Step 3: Calculate total payment (minimum + extra) and apply at once
    const totalPayment = Math.min(minPayment + extraPayment, debt.balance);
    extraApplied = Math.max(0, totalPayment - minPayment);
    actualPayment = totalPayment;
    debt.balance -= totalPayment;
    totals.totalPaid += totalPayment;
    
  } else {
    // AMORTIZED LOAN LOGIC:
    // Step 1: Apply monthly interest to balance (debt grows each month)
    const monthlyInterestAmount = calculateMonthlyInterest(debt);
    debt.balance += monthlyInterestAmount;
    totals.totalInterest += monthlyInterestAmount;
    
    // Step 2: Get the fixed minimum payment
    minPayment = debt.minPayment;
    
    // Step 3: Apply minimum payment to the balance (now includes accumulated interest)
    const minimumPaymentAmount = Math.min(minPayment, debt.balance);
    actualPayment += minimumPaymentAmount;
    debt.balance -= minimumPaymentAmount;
    
    // For tracking, the interest charged this month was the monthly interest amount
    interestCharged = monthlyInterestAmount;
    
    totals.totalPaid += minimumPaymentAmount;
    
    // Apply extra payment if any remaining balance and extra payment available
    if (extraPayment > 0 && debt.balance > 0) {
      extraApplied = Math.min(extraPayment, debt.balance);
      debt.balance -= extraApplied;
      actualPayment += extraApplied;
      totals.totalPaid += extraApplied;
      // Extra payments go directly to principal, so no additional interest
    }
  }

  // Clean up tiny balances
  if (debt.balance < 0.01) {
    debt.balance = 0;
  }

  return {
    debtId: debt.id,
    payment: actualPayment,
    minimumPayment: minPayment,
    extraPayment: extraApplied,
    balance: debt.balance,
    interestCharged: interestCharged,
    originalMinPayment: debt.originalMinPayment || debt.minPayment
  };
};

/**
 * Calculate minimum payment repayment strategy
 * Only makes minimum payments on all debts
 * 
 * @param {Array} debts - List of debt objects
 * @returns {Object} - Results of calculation
 */
export const calculateMinimum = (debts) => {
  if (!debts.length) return null;
  
  // Create a deep copy of debts to avoid mutating the original
  let workingDebts = JSON.parse(JSON.stringify(debts));
  
  let totals = {
    totalPaid: 0,
    totalInterest: 0
  };
  let months = 0;
  let monthlyPayments = [];
  
  // Continue until all debts are paid off
  while (workingDebts.some(debt => debt.balance > 0) && months < 1200) { // max 100 years of payments
    months++;
    let monthPaymentBreakdown = [];
    
    // Process each debt with minimum payments only
    for (let i = 0; i < workingDebts.length; i++) {
      const paymentInfo = processDebtPayment(workingDebts[i], 0, totals);
      monthPaymentBreakdown.push(paymentInfo);
    }
    
    monthlyPayments.push({
      month: months,
      debtPayments: monthPaymentBreakdown,
      totalPaid: totals.totalPaid,
      remainingDebt: workingDebts.reduce((sum, debt) => sum + debt.balance, 0)
    });
  }
  
  return {
    totalPaid: totals.totalPaid,
    totalInterest: totals.totalInterest,
    months,
    monthlyPayments
  };
};

/**
 * Calculate Avalanche repayment strategy
 * Pays minimum on all debts, then adds extra payment to highest interest debt
 * 
 * @param {Array} debts - List of debt objects
 * @param {number} extraPayment - Extra amount to pay each month
 * @returns {Object} - Results of calculation
 */
export const calculateAvalanche = (debts, extraPayment = 0) => {
  if (!debts.length) return null;
  
  // If no extra payment, use the minimum payment strategy for consistency
  if (extraPayment === 0) {
    return calculateMinimum(debts);
  }
  
  // Create a deep copy of debts to avoid mutating the original
  let workingDebts = JSON.parse(JSON.stringify(debts));
  
  // Preserve original minimum payments
  workingDebts.forEach(debt => {
    debt.originalMinPayment = debt.minPayment;
  });
  
  let totals = {
    totalPaid: 0,
    totalInterest: 0
  };
  let months = 0;
  let monthlyPayments = [];
  
  // Continue until all debts are paid off
  while (workingDebts.some(debt => debt.balance > 0) && months < 1200) {
    months++;
    let monthPaymentBreakdown = [];
    
    // Calculate total minimums from PREVIOUSLY paid-off debts that should be redistributed
    const paidOffMinimums = workingDebts
      .filter(debt => debt.balance <= 0)
      .reduce((sum, debt) => sum + debt.originalMinPayment, 0);
    
    // Find the highest APR debt that still has a balance
    const activeDebts = workingDebts.filter(debt => debt.balance > 0);
    const priorityDebt = activeDebts.length > 0 
      ? activeDebts.reduce((highest, current) => current.apr > highest.apr ? current : highest)
      : null;
    
    // Process each debt
    for (let i = 0; i < workingDebts.length; i++) {
      const debt = workingDebts[i];
      
      if (debt.balance <= 0) {
        // Debt is already paid off
        monthPaymentBreakdown.push({
          debtId: debt.id,
          payment: 0,
          minimumPayment: 0,
          extraPayment: 0,
          balance: 0,
          interestCharged: 0,
          originalMinPayment: debt.originalMinPayment
        });
        continue;
      }
      
      // Determine extra payment amount for this debt
      let extraForThisDebt = 0;
      
      if (debt === priorityDebt) {
        // Priority debt gets: extra payment + minimums from ALREADY paid-off debts
        extraForThisDebt = extraPayment + paidOffMinimums;
      }
      // Other debts get no extra payment
      
      // Apply the payment using our existing logic
      const paymentInfo = processDebtPayment(debt, extraForThisDebt, totals);
      
      monthPaymentBreakdown.push({
        debtId: debt.id,
        payment: paymentInfo.payment,
        minimumPayment: paymentInfo.minimumPayment,
        extraPayment: paymentInfo.extraPayment,
        balance: paymentInfo.balance,
        interestCharged: paymentInfo.interestCharged,
        originalMinPayment: debt.originalMinPayment
      });
    }
    
    monthlyPayments.push({
      month: months,
      debtPayments: monthPaymentBreakdown,
      totalPaid: totals.totalPaid,
      remainingDebt: workingDebts.reduce((sum, debt) => sum + debt.balance, 0)
    });
  }
  
  return {
    totalPaid: totals.totalPaid,
    totalInterest: totals.totalInterest,
    months,
    monthlyPayments
  };
};

/**
 * Calculate Snowball repayment strategy
 * Pays minimum on all debts, then adds extra payment to lowest balance debt
 * 
 * @param {Array} debts - List of debt objects
 * @param {number} extraPayment - Extra amount to pay each month
 * @returns {Object} - Results of calculation
 */
export const calculateSnowball = (debts, extraPayment = 0) => {
  if (!debts.length) return null;
  
  // If no extra payment, use the minimum payment strategy for consistency
  if (extraPayment === 0) {
    return calculateMinimum(debts);
  }
  
  // Create a deep copy of debts to avoid mutating the original
  let workingDebts = JSON.parse(JSON.stringify(debts));
  
  // Preserve original minimum payments
  workingDebts.forEach(debt => {
    debt.originalMinPayment = debt.minPayment;
  });
  
  let totals = {
    totalPaid: 0,
    totalInterest: 0
  };
  let months = 0;
  let monthlyPayments = [];
  
  // Continue until all debts are paid off
  while (workingDebts.some(debt => debt.balance > 0) && months < 1200) {
    months++;
    let monthPaymentBreakdown = [];
    
    // Calculate total minimums from PREVIOUSLY paid-off debts that should be redistributed
    const paidOffMinimums = workingDebts
      .filter(debt => debt.balance <= 0)
      .reduce((sum, debt) => sum + debt.originalMinPayment, 0);
    
    // Find the lowest balance debt that still has a balance
    const activeDebts = workingDebts.filter(debt => debt.balance > 0);
    const priorityDebt = activeDebts.length > 0 
      ? activeDebts.reduce((lowest, current) => 
          current.balance < lowest.balance || (current.balance === lowest.balance && current.apr > lowest.apr)
            ? current : lowest
        )
      : null;
    
    // Process each debt
    for (let i = 0; i < workingDebts.length; i++) {
      const debt = workingDebts[i];
      
      if (debt.balance <= 0) {
        // Debt is already paid off
        monthPaymentBreakdown.push({
          debtId: debt.id,
          payment: 0,
          minimumPayment: 0,
          extraPayment: 0,
          balance: 0,
          interestCharged: 0,
          originalMinPayment: debt.originalMinPayment
        });
        continue;
      }
      
      // Determine extra payment amount for this debt
      let extraForThisDebt = 0;
      
      if (debt === priorityDebt) {
        // Priority debt gets: extra payment + minimums from ALREADY paid-off debts
        extraForThisDebt = extraPayment + paidOffMinimums;
      }
      // Other debts get no extra payment
      
      // Apply the payment using our existing logic
      const paymentInfo = processDebtPayment(debt, extraForThisDebt, totals);
      
      monthPaymentBreakdown.push({
        debtId: debt.id,
        payment: paymentInfo.payment,
        minimumPayment: paymentInfo.minimumPayment,
        extraPayment: paymentInfo.extraPayment,
        balance: paymentInfo.balance,
        interestCharged: paymentInfo.interestCharged,
        originalMinPayment: debt.originalMinPayment
      });
    }
    
    monthlyPayments.push({
      month: months,
      debtPayments: monthPaymentBreakdown,
      totalPaid: totals.totalPaid,
      remainingDebt: workingDebts.reduce((sum, debt) => sum + debt.balance, 0)
    });
  }
  
  return {
    totalPaid: totals.totalPaid,
    totalInterest: totals.totalInterest,
    months,
    monthlyPayments
  };
}; 