/**
 * Unified Debt Repayment Calculation System
 * 
 * This system handles all three repayment methods with shared calculation logic:
 * - Minimum payments only
 * - Avalanche method (highest APR first)
 * - Snowball method (lowest balance first)
 * 
 * Follows the specification for credit card minimum calculations and
 * consistent monthly payment processing.
 */

/**
 * Calculate credit card minimum payment using the standard formula
 * @param {number} balance - Current balance
 * @param {number} apr - Annual percentage rate (as decimal, e.g., 0.1999)
 * @returns {number} - Minimum payment amount
 */
const calculateCreditCardMinimum = (balance, apr) => {
  if (balance <= 0) return 0;
  
  const monthly_interest = balance * (apr / 12);
  const base = 0.01 * balance;
  const calculated_minimum = base + monthly_interest;
  
  // Apply the three-tier rule
  if (balance < 25) return balance;
  if (calculated_minimum < 25) return 25;
  return calculated_minimum;
};

/**
 * Process monthly payment for a single debt
 * @param {Object} debt - Debt object with balance, apr, minPayment, isCreditCard
 * @param {number} paymentAmount - Total payment to apply this month
 * @param {Object} totals - Running totals to update
 * @returns {Object} - Payment details for this month
 */
const processMonthlyDebtPayment = (debt, paymentAmount, totals) => {
  if (debt.balance <= 0) {
    return {
      debtId: debt.id,
      payment: 0,
      minimumPayment: 0,
      extraPayment: 0,
      balance: 0,
      interestCharged: 0
    };
  }

  const monthly_interest = debt.balance * (debt.apr / 12);
  let minimumPayment;
  
  if (debt.isCreditCard) {
    // Credit cards: recalculate minimum each month
    minimumPayment = calculateCreditCardMinimum(debt.balance, debt.apr);
  } else {
    // Other loans: fixed minimum payment
    minimumPayment = debt.minPayment;
  }
  
  // Apply payment
  const actualPayment = Math.min(paymentAmount, debt.balance);
  const principal_payment = actualPayment - monthly_interest;
  
  // Ensure principal payment is not negative
  const safe_principal = Math.max(0, principal_payment);
  
  // Update debt balance
  debt.balance = Math.max(0, debt.balance - safe_principal);
  
  // Update totals
  totals.totalInterest += monthly_interest;
  totals.totalPaid += actualPayment;
  
  return {
    debtId: debt.id,
    payment: actualPayment,
    minimumPayment: minimumPayment,
    extraPayment: Math.max(0, actualPayment - minimumPayment),
    balance: debt.balance,
    interestCharged: monthly_interest
  };
};

/**
 * Unified calculation engine for all repayment methods
 * @param {Array} debts - Array of debt objects
 * @param {number} extraPaymentAmount - Additional monthly payment (0 for minimum only)
 * @param {string} method - 'minimum', 'avalanche', or 'snowball'
 * @returns {Object} - Complete calculation results
 */
const calculateRepaymentPlan = (debts, extraPaymentAmount = 0, method = 'minimum') => {
  if (!debts || debts.length === 0) return null;
  
  // Create deep copy to avoid mutating original data
  let workingDebts = JSON.parse(JSON.stringify(debts));
  
  // Convert APR percentages to decimals
  workingDebts.forEach(debt => {
    debt.apr = debt.apr / 100;
  });
  
  // Calculate initial total monthly payment for avalanche/snowball
  let totalMonthlyPayment;
  if (method === 'minimum') {
    totalMonthlyPayment = null; // Varies each month based on CC balances
  } else {
    // Fixed budget: sum of Month 1 minimums + extra payment
    const initialMinimums = workingDebts.reduce((sum, debt) => {
      if (debt.isCreditCard) {
        return sum + calculateCreditCardMinimum(debt.balance, debt.apr);
      } else {
        return sum + debt.minPayment;
      }
    }, 0);
    totalMonthlyPayment = initialMinimums + extraPaymentAmount;
  }
  
  let totals = {
    totalPaid: 0,
    totalInterest: 0
  };
  let months = 0;
  let monthlyPayments = [];
  
  // Continue until all debts are paid off (max 1200 months = 100 years)
  while (workingDebts.some(debt => debt.balance > 0) && months < 1200) {
    months++;
    let monthPaymentBreakdown = [];
    
    if (method === 'minimum') {
      // MINIMUM PAYMENTS ONLY: Each debt gets its minimum payment
      for (let debt of workingDebts) {
        if (debt.balance <= 0) {
          monthPaymentBreakdown.push({
            debtId: debt.id,
            payment: 0,
            minimumPayment: 0,
            extraPayment: 0,
            balance: 0,
            interestCharged: 0
          });
          continue;
        }
        
        const minPayment = debt.isCreditCard 
          ? calculateCreditCardMinimum(debt.balance, debt.apr)
          : debt.minPayment;
        
        const paymentInfo = processMonthlyDebtPayment(debt, minPayment, totals);
        monthPaymentBreakdown.push(paymentInfo);
      }
    } else {
      // AVALANCHE OR SNOWBALL: Fixed budget distribution
      let availableBudget = totalMonthlyPayment;
      
      // Step 1: Apply minimum payments to all debts
      for (let debt of workingDebts) {
        if (debt.balance <= 0) {
          monthPaymentBreakdown.push({
            debtId: debt.id,
            payment: 0,
            minimumPayment: 0,
            extraPayment: 0,
            balance: 0,
            interestCharged: 0
          });
          continue;
        }
        
        const minPayment = debt.isCreditCard 
          ? calculateCreditCardMinimum(debt.balance, debt.apr)
          : debt.minPayment;
        
        const actualMinPayment = Math.min(minPayment, debt.balance);
        const paymentInfo = processMonthlyDebtPayment(debt, actualMinPayment, totals);
        monthPaymentBreakdown.push(paymentInfo);
        availableBudget -= actualMinPayment;
      }
      
      // Step 2: Apply remaining budget to priority debt(s)
      while (availableBudget > 0.01) {
        // Get debts with remaining balance
        const debtsWithBalance = workingDebts
          .map((debt, index) => ({ ...debt, index }))
          .filter(debt => debt.balance > 0);
        
        if (debtsWithBalance.length === 0) break;
        
        // Sort by priority based on method
        let priorityDebt;
        if (method === 'avalanche') {
          // Highest APR first
          debtsWithBalance.sort((a, b) => b.apr - a.apr);
          priorityDebt = debtsWithBalance[0];
        } else if (method === 'snowball') {
          // Lowest balance first (tie-breaker: highest APR)
          debtsWithBalance.sort((a, b) => {
            if (Math.abs(a.balance - b.balance) < 0.01) {
              return b.apr - a.apr; // tie-breaker
            }
            return a.balance - b.balance;
          });
          priorityDebt = debtsWithBalance[0];
        }
        
        // Apply available budget to priority debt
        const extraToApply = Math.min(availableBudget, priorityDebt.balance);
        
        // Process extra payment (interest already handled in minimum payment)
        workingDebts[priorityDebt.index].balance -= extraToApply;
        monthPaymentBreakdown[priorityDebt.index].payment += extraToApply;
        monthPaymentBreakdown[priorityDebt.index].extraPayment += extraToApply;
        monthPaymentBreakdown[priorityDebt.index].balance = workingDebts[priorityDebt.index].balance;
        
        availableBudget -= extraToApply;
        totals.totalPaid += extraToApply;
        
        // Clean up paid off debts
        if (workingDebts[priorityDebt.index].balance < 0.01) {
          workingDebts[priorityDebt.index].balance = 0;
          monthPaymentBreakdown[priorityDebt.index].balance = 0;
        }
      }
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
 * Calculate minimum payment repayment strategy
 * @param {Array} debts - List of debt objects
 * @returns {Object} - Results of calculation
 */
export const calculateMinimum = (debts) => {
  return calculateRepaymentPlan(debts, 0, 'minimum');
};

/**
 * Calculate Avalanche repayment strategy (highest APR first)
 * @param {Array} debts - List of debt objects
 * @param {number} extraPayment - Extra amount to pay each month
 * @returns {Object} - Results of calculation
 */
export const calculateAvalanche = (debts, extraPayment = 0) => {
  return calculateRepaymentPlan(debts, extraPayment, 'avalanche');
};

/**
 * Calculate Snowball repayment strategy (lowest balance first)
 * @param {Array} debts - List of debt objects
 * @param {number} extraPayment - Extra amount to pay each month
 * @returns {Object} - Results of calculation
 */
export const calculateSnowball = (debts, extraPayment = 0) => {
  return calculateRepaymentPlan(debts, extraPayment, 'snowball');
}; 