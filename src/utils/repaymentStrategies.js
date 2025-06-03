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
  
  // Create a deep copy of debts to avoid mutating the original
  let workingDebts = JSON.parse(JSON.stringify(debts));
  
  // Preserve original minimum payments and calculate fixed budget
  workingDebts.forEach(debt => {
    debt.originalMinPayment = debt.minPayment;
  });
  
  // Calculate fixed monthly budget that will remain consistent
  const totalOriginalMinPayments = workingDebts.reduce((sum, debt) => sum + debt.originalMinPayment, 0);
  const fixedMonthlyBudget = totalOriginalMinPayments + extraPayment;
  
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
    let remainingBudget = fixedMonthlyBudget;
    
    // Step 1: Process minimum payments for all debts first
    for (let i = 0; i < workingDebts.length; i++) {
      if (workingDebts[i].balance <= 0) {
        monthPaymentBreakdown.push({
          debtId: workingDebts[i].id,
          payment: 0,
          minimumPayment: 0,
          extraPayment: 0,
          balance: 0,
          interestCharged: 0,
          originalMinPayment: workingDebts[i].originalMinPayment
        });
        continue;
      }
      
      const paymentInfo = processDebtPayment(workingDebts[i], 0, totals);
      monthPaymentBreakdown.push(paymentInfo);
      remainingBudget -= paymentInfo.payment;
    }
    
    // Step 2: Apply remaining budget (including savings from reduced credit card minimums) to highest APR debt
    while (remainingBudget > 0.01) {
      // Sort remaining debts by APR (highest first) for extra payment
      const debtsByAPR = [...workingDebts]
        .map((debt, index) => ({ ...debt, index }))
        .filter(debt => debt.balance > 0)
        .sort((a, b) => b.apr - a.apr);
      
      if (debtsByAPR.length === 0) break; // No more debts to pay
      
      const priorityDebt = debtsByAPR[0];
      const extraToApply = Math.min(remainingBudget, priorityDebt.balance);
      
      debugLog(`Month ${months}: Applying ${extraToApply} extra to ${priorityDebt.name}`, { 
        debtBalance: priorityDebt.balance, 
        remainingBudget 
      });
      
      // Apply extra payment
      workingDebts[priorityDebt.index].balance -= extraToApply;
      monthPaymentBreakdown[priorityDebt.index].payment += extraToApply;
      monthPaymentBreakdown[priorityDebt.index].extraPayment = (monthPaymentBreakdown[priorityDebt.index].extraPayment || 0) + extraToApply;
      monthPaymentBreakdown[priorityDebt.index].balance = workingDebts[priorityDebt.index].balance;
      
      remainingBudget -= extraToApply;
      totals.totalPaid += extraToApply;
      
      // Clean up paid off debt
      if (workingDebts[priorityDebt.index].balance < 0.01) {
        workingDebts[priorityDebt.index].balance = 0;
        monthPaymentBreakdown[priorityDebt.index].balance = 0;
        
        debugLog(`Month ${months}: PAID OFF ${priorityDebt.name}! Remaining budget will be redistributed.`);
      }
      
      debugLog(`Month ${months}: After payment`, { 
        debtName: priorityDebt.name, 
        newBalance: workingDebts[priorityDebt.index].balance, 
        remainingBudget
      });
    }
    
    if (remainingBudget > 0.01) {
      debugLog(`Month ${months}: WARNING - ${remainingBudget.toFixed(2)} budget unused!`);
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
  
  // Create a deep copy of debts to avoid mutating the original
  let workingDebts = JSON.parse(JSON.stringify(debts));
  
  // Preserve original minimum payments and calculate fixed budget
  workingDebts.forEach(debt => {
    debt.originalMinPayment = debt.minPayment;
  });
  
  // Calculate fixed monthly budget that will remain consistent
  const totalOriginalMinPayments = workingDebts.reduce((sum, debt) => sum + debt.originalMinPayment, 0);
  const fixedMonthlyBudget = totalOriginalMinPayments + extraPayment;
  
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
    let remainingBudget = fixedMonthlyBudget;
    
    debugLog(`Month ${months}: Starting with budget`, { remainingBudget, fixedMonthlyBudget });
    
    // STEP 1: Process minimum payments for all debts
    for (let i = 0; i < workingDebts.length; i++) {
      if (workingDebts[i].balance <= 0) {
        monthPaymentBreakdown.push({
          debtId: workingDebts[i].id,
          payment: 0,
          minimumPayment: 0,
          extraPayment: 0,
          balance: 0,
          interestCharged: 0,
          originalMinPayment: workingDebts[i].originalMinPayment
        });
        continue;
      }
      
      const paymentInfo = processDebtPayment(workingDebts[i], 0, totals);
      monthPaymentBreakdown.push(paymentInfo);
      remainingBudget -= paymentInfo.payment;
    }
    
    // STEP 2: Apply remaining budget (including savings from reduced credit card minimums) to lowest balance debt
    while (remainingBudget > 0.01) {
      // Sort remaining debts by balance (lowest first) for snowball method
      const debtsWithBalance = [...workingDebts]
        .map((debt, index) => ({ ...debt, index }))
        .filter(debt => debt.balance > 0)
        .sort((a, b) => a.balance === b.balance ? b.apr - a.apr : a.balance - b.balance);
      
      if (debtsWithBalance.length === 0) break; // No more debts to pay
      
      const priorityDebt = debtsWithBalance[0];
      const extraToApply = Math.min(remainingBudget, priorityDebt.balance);
      
      debugLog(`Month ${months}: Applying ${extraToApply} extra to ${priorityDebt.name}`, { 
        debtBalance: priorityDebt.balance, 
        remainingBudget 
      });
      
      // Apply the extra payment
      workingDebts[priorityDebt.index].balance -= extraToApply;
      monthPaymentBreakdown[priorityDebt.index].payment += extraToApply;
      monthPaymentBreakdown[priorityDebt.index].extraPayment = (monthPaymentBreakdown[priorityDebt.index].extraPayment || 0) + extraToApply;
      monthPaymentBreakdown[priorityDebt.index].balance = workingDebts[priorityDebt.index].balance;
      
      remainingBudget -= extraToApply;
      totals.totalPaid += extraToApply;
      
      // Clean up paid off debt
      if (workingDebts[priorityDebt.index].balance < 0.01) {
        workingDebts[priorityDebt.index].balance = 0;
        monthPaymentBreakdown[priorityDebt.index].balance = 0;
        
        debugLog(`Month ${months}: PAID OFF ${priorityDebt.name}! Remaining budget will be redistributed.`);
        
        // Continue the loop to immediately apply the remaining budget to next priority debt
      } else {
        // Debt not fully paid off, continue with remaining budget if any
        debugLog(`Month ${months}: Applied ${extraToApply} to ${priorityDebt.name}, new balance: ${workingDebts[priorityDebt.index].balance}, remaining budget: ${remainingBudget}`);
      }
    }
    
    if (remainingBudget > 0.01) {
      debugLog(`Month ${months}: WARNING - ${remainingBudget.toFixed(2)} budget unused!`);
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