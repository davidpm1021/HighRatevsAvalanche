/**
 * Debug utility to trace payment flows in detail
 * This helps us understand exactly what's happening with payment redistribution
 */

import { calculateAvalanche, calculateSnowball } from './repaymentStrategies.js';

/**
 * Debug payment flow for a specific strategy
 */
export function debugPaymentFlow(debts = null, extraPayment = 300, strategy = 'avalanche') {
  console.log('🔍 Debugging Payment Flow...\n');
  
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
  const expectedTotal = totalMinPayments + extraPayment;
  
  console.log('Initial Setup:');
  console.log(`  Total minimum payments: $${totalMinPayments}`);
  console.log(`  Extra payment: $${extraPayment}`);
  console.log(`  Expected monthly total: $${expectedTotal}`);
  console.log('');
  
  // Calculate strategy
  const result = strategy === 'snowball' 
    ? calculateSnowball(testDebts, extraPayment)
    : calculateAvalanche(testDebts, extraPayment);
  
  if (!result || !result.monthlyPayments) {
    console.log('❌ No results available');
    return;
  }
  
  console.log('📊 Monthly Payment Flow:');
  console.log('Month | Total | Debt 1 | Debt 2 | Debt 3 | Notes');
  console.log('------|-------|--------|--------|--------|--------');
  
  result.monthlyPayments.slice(0, 35).forEach((month, index) => {
    const monthlyTotal = month.debtPayments.reduce((sum, p) => sum + p.payment, 0);
    const debt1Payment = month.debtPayments.find(p => p.debtId === 1)?.payment || 0;
    const debt2Payment = month.debtPayments.find(p => p.debtId === 2)?.payment || 0;
    const debt3Payment = month.debtPayments.find(p => p.debtId === 3)?.payment || 0;
    
    // Check for paid off debts
    const paidOffDebts = month.debtPayments.filter(p => p.balance === 0 && p.payment > 0);
    const extraPayments = month.debtPayments.filter(p => p.extraPayment > 0);
    
    let notes = '';
    if (paidOffDebts.length > 0) {
      notes += `PAID: ${paidOffDebts.map(p => testDebts.find(d => d.id === p.debtId)?.name || p.debtId).join(', ')} `;
    }
    if (extraPayments.length > 1) {
      notes += 'ROLLOVER ';
    }
    
    const diff = monthlyTotal - expectedTotal;
    if (Math.abs(diff) > 0.10) {
      notes += `DIFF: ${diff > 0 ? '+' : ''}${diff.toFixed(2)} `;
    }
    
    console.log(`${month.month.toString().padStart(5)} | ${monthlyTotal.toFixed(2).padStart(5)} | ${debt1Payment.toFixed(0).padStart(6)} | ${debt2Payment.toFixed(0).padStart(6)} | ${debt3Payment.toFixed(0).padStart(6)} | ${notes}`);
  });
  
  return result;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.debugPaymentFlow = debugPaymentFlow;
} 