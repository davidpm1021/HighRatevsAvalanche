/**
 * Test utility to verify payment consistency across repayment strategies
 * 
 * This test ensures that total monthly payment amounts remain constant
 * throughout the repayment period, with payments only being redistributed
 * as debts are paid off (not reduced).
 */

import { calculateAvalanche, calculateSnowball, calculateMinimum } from './repaymentStrategies.js';

/**
 * Test payment consistency for a given strategy
 * @param {Array} debts - Array of debt objects
 * @param {number} extraPayment - Extra monthly payment amount
 * @param {string} strategyName - Name of strategy for logging
 * @param {Function} strategyFunction - Strategy calculation function
 * @returns {Object} - Test results
 */
function testPaymentConsistency(debts, extraPayment, strategyName, strategyFunction) {
  console.log(`\n=== Testing ${strategyName} Payment Consistency ===`);
  
  // Calculate total expected monthly payment
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minPayment, 0);
  const expectedMonthlyTotal = totalMinimumPayments + extraPayment;
  
  console.log(`Expected monthly payment: $${expectedMonthlyTotal.toFixed(2)}`);
  console.log(`  - Total minimum payments: $${totalMinimumPayments.toFixed(2)}`);
  console.log(`  - Extra payment: $${extraPayment.toFixed(2)}`);
  
  // Run the strategy calculation
  const result = strategyFunction(debts, extraPayment);
  
  if (!result || !result.monthlyPayments) {
    console.log('❌ No results or monthly payments data available');
    return { success: false, message: 'No data available' };
  }
  
  let inconsistentMonths = [];
  let totalPayments = [];
  
  // Check each month's payment total
  result.monthlyPayments.forEach((month, index) => {
    const monthlyTotal = month.debtPayments.reduce((sum, payment) => sum + payment.payment, 0);
    totalPayments.push(monthlyTotal);
    
    // Allow for small rounding differences (less than $0.10)
    const difference = Math.abs(monthlyTotal - expectedMonthlyTotal);
    
    // Skip the final month if it's less than expected (remaining balance < full budget)
    const isLastMonth = index === result.monthlyPayments.length - 1;
    const isUnderPayment = monthlyTotal < expectedMonthlyTotal;
    
    if (difference > 0.10 && !(isLastMonth && isUnderPayment)) {
      inconsistentMonths.push({
        month: month.month,
        actual: monthlyTotal,
        expected: expectedMonthlyTotal,
        difference: difference
      });
    }
  });
  
  // Log results
  if (inconsistentMonths.length === 0) {
    console.log(`✅ All ${result.monthlyPayments.length} months have consistent payments`);
    console.log(`Average monthly payment: $${(totalPayments.reduce((sum, p) => sum + p, 0) / totalPayments.length).toFixed(2)}`);
    return { 
      success: true, 
      message: 'Payment consistency maintained',
      monthlyPayments: totalPayments
    };
  } else {
    console.log(`❌ Found ${inconsistentMonths.length} months with inconsistent payments:`);
    inconsistentMonths.slice(0, 5).forEach(month => {
      console.log(`  Month ${month.month}: $${month.actual.toFixed(2)} (expected $${month.expected.toFixed(2)}, diff: $${month.difference.toFixed(2)})`);
    });
    
    if (inconsistentMonths.length > 5) {
      console.log(`  ... and ${inconsistentMonths.length - 5} more`);
    }
    
    return {
      success: false,
      message: `${inconsistentMonths.length} months with inconsistent payments`,
      inconsistentMonths: inconsistentMonths
    };
  }
}

/**
 * Run comprehensive payment consistency tests
 * @param {Array} debts - Array of debt objects to test with
 * @param {number} extraPayment - Extra payment amount to test with
 */
export function runPaymentConsistencyTests(debts = null, extraPayment = 300) {
  console.log('🧪 Running Payment Consistency Tests...');
  
  // Use sample data if no debts provided
  const testDebts = debts || [
    {
      id: 1,
      name: 'Credit Card 1',
      balance: 5000,
      apr: 24.99,
      minPayment: 100,
      isCreditCard: true
    },
    {
      id: 2,
      name: 'Credit Card 2', 
      balance: 3000,
      apr: 18.99,
      minPayment: 75,
      isCreditCard: true
    },
    {
      id: 3,
      name: 'Personal Loan',
      balance: 10000,
      apr: 12.50,
      minPayment: 250,
      isCreditCard: false
    }
  ];
  
  const totalMinPayments = testDebts.reduce((sum, debt) => sum + debt.minPayment, 0);
  const totalDebt = testDebts.reduce((sum, debt) => sum + debt.balance, 0);
  
  console.log(`\nTest Data:`);
  console.log(`  - ${testDebts.length} debts totaling $${totalDebt.toFixed(2)}`);
  console.log(`  - Total minimum payments: $${totalMinPayments.toFixed(2)}`);
  console.log(`  - Extra payment: $${extraPayment.toFixed(2)}`);
  console.log(`  - Expected monthly total: $${(totalMinPayments + extraPayment).toFixed(2)}`);
  
  // Test all strategies
  const avalancheResult = testPaymentConsistency(testDebts, extraPayment, 'Avalanche', calculateAvalanche);
  const snowballResult = testPaymentConsistency(testDebts, extraPayment, 'Snowball', calculateSnowball);
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`Avalanche: ${avalancheResult.success ? '✅' : '❌'} ${avalancheResult.message}`);
  console.log(`Snowball: ${snowballResult.success ? '✅' : '❌'} ${snowballResult.message}`);
  
  return {
    avalanche: avalancheResult,
    snowball: snowballResult
  };
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.runPaymentConsistencyTests = runPaymentConsistencyTests;
} 