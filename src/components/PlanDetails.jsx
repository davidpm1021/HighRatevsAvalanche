import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PlanDetails() {
  const { state, dispatch } = useApp();
  const { selectedStrategy, results } = state;
  const [displayCount, setDisplayCount] = useState(24); // Initially show 24 months
  
  if (!selectedStrategy || !results || !results[selectedStrategy]) {
    return (
      <div className="text-center p-lg">
        <p className="text-navy-blue mb-md">Please select a repayment strategy first.</p>
      </div>
    );
  }
  
  const strategyData = results[selectedStrategy];
  const { totalPaid, totalInterest, months, monthlyPayments } = strategyData;
  const minimumResult = results.minimum;
  
  // Ensure we have monthly payments data
  if (!monthlyPayments || monthlyPayments.length === 0) {
    return (
      <div className="text-center p-lg">
        <p className="text-navy-blue mb-md">No payment data available for this strategy.</p>
      </div>
    );
  }
  
  // Get strategy title and description
  const getStrategyInfo = (strategy) => {
    switch (strategy) {
      case 'minimum':
        return { 
          title: 'Minimum Payments',
          description: 'Pay just the minimum payment each month.',
          instruction: 'Make minimum payments on all debts with no roll over payments until all are paid.',
          priority: 'No specific order - just minimum payments on all debts'
        };
      case 'avalanche':
        return { 
          title: 'Avalanche Method',
          description: 'Pay off the highest interest rate debt first.',
          instruction: 'Pay extra on the highest interest rate debt while making minimum payments on all others.',
          priority: 'Pay off the highest interest rates first in the order shown below:'
        };
      case 'snowball':
        return { 
          title: 'Snowball Method',
          description: 'Pay off smallest balances first.',
          instruction: 'Pay extra on the smallest balance debt while making minimum payments on all others.',
          priority: 'Pay off the smallest balances first in the order shown below:'
        };
      default:
        return { title: 'Unknown Strategy', description: '', instruction: '', priority: '' };
    }
  };
  
  const { title, description, instruction, priority } = getStrategyInfo(selectedStrategy);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 24, months));
  };
  
  const loadAll = () => {
    setDisplayCount(months);
  };

  // Calculate savings compared to minimum payments
  const savings = minimumResult ? {
    interest: minimumResult.totalInterest - totalInterest,
    time: minimumResult.months - months
  } : { interest: 0, time: 0 };

  // Get debts in order of repayment priority (for avalanche or snowball)
  const getPriorityDebts = () => {
    if (selectedStrategy === 'minimum') {
      return state.debts;
    }
    
    const debtsCopy = [...state.debts];
    
    if (selectedStrategy === 'avalanche') {
      // Order by interest rate (highest first)
      return debtsCopy.sort((a, b) => b.apr - a.apr);
    } else if (selectedStrategy === 'snowball') {
      // Order by balance (lowest first)
      return debtsCopy.sort((a, b) => a.balance - b.balance);
    }
    
    return debtsCopy;
  };
  
  const priorityDebts = getPriorityDebts();
  
  // Determine the color based on the strategy
  const getStrategyColor = () => {
    switch (selectedStrategy) {
      case 'minimum': return 'bg-orange text-white';
      case 'avalanche': return 'bg-bright-green text-white';
      case 'snowball': return 'bg-bright-blue text-white';
      default: return 'bg-royal-blue text-white';
    }
  };
  
  // Get the current month's payment distribution
  const currentMonth = monthlyPayments[0];
  
  // Find which debt is receiving extra payment in the first month
  const getExtraPaymentDebt = () => {
    if (!currentMonth || selectedStrategy === 'minimum') return null;
    
    const extraPaymentDebt = currentMonth.debtPayments.find(p => p.extraPayment > 0);
    if (!extraPaymentDebt) return null;
    
    const debt = state.debts.find(d => d.id === extraPaymentDebt.debtId);
    return debt;
  };
  
  const extraPaymentDebt = getExtraPaymentDebt();
  const strategyColor = getStrategyColor();

  return (
    <div className="space-y-lg">
      <div className={`${strategyColor} py-sm px-lg text-center rounded-t-lg`}>
        <h3 className="text-h4 font-bold text-white mb-0">{title} Method Plan</h3>
        </div>
        
          <div className="flex justify-center items-center bg-light-gray-blue p-md rounded-lg mb-lg">
            <div className="text-center">
              <span className="text-h3 font-bold text-navy-blue">{months}</span>
              <span className="text-regular text-navy-blue ml-xs">months and</span>
              <span className="text-h3 font-bold text-navy-blue ml-xs">{formatCurrency(totalPaid)}</span>
              <span className="text-regular text-navy-blue ml-xs">to eliminate your target debt.</span>
            </div>
          </div>
          
          {minimumResult && minimumResult !== strategyData && (
            <div className="bg-soft-yellow p-md rounded-lg mb-lg">
              <div className="text-navy-blue">
                <div>save <span className="text-h3 font-bold">{formatCurrency(savings.interest)}</span> in interest costs and pay off</div>
                <div><span className="text-h3 font-bold">{savings.time}</span> Months faster than the minimum payment method.</div>
              </div>
            </div>
          )}
          
          <p className="text-small text-navy-blue mb-lg">{instruction}</p>
          
          <div className="mb-lg">
            <p className="text-regular font-bold text-navy-blue mb-sm">{priority}</p>
            
            <table className="min-w-full divide-y divide-light-gray-blue mb-md">
              <thead>
                <tr>
                  <th className="px-md py-sm bg-soft-blue text-left text-small text-navy-blue font-medium">Rate</th>
                  <th className="px-md py-sm bg-soft-blue text-left text-small text-navy-blue font-medium">Debt</th>
                  <th className="px-md py-sm bg-soft-blue text-right text-small text-navy-blue font-medium">This Month's Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray-blue">
                {priorityDebts.map((debt) => {
                  const payment = currentMonth?.debtPayments.find(p => p.debtId === debt.id);
                  const isExtraPayment = payment?.extraPayment > 0;
                  
                  return (
                    <tr key={debt.id} className={isExtraPayment ? "bg-soft-blue" : ""}>
                  <td className="px-md py-sm whitespace-nowrap text-small text-navy-blue font-medium">{debt.apr.toFixed(2)}%</td>
                      <td className="px-md py-sm whitespace-nowrap text-small text-navy-blue">
                        {debt.name}
                        {isExtraPayment && (
                          <span className="text-small text-bright-blue font-medium ml-sm">
                            with Extra Payments
                          </span>
                        )}
                      </td>
                      <td className="px-md py-sm whitespace-nowrap text-small text-navy-blue text-right font-bold">
                        {payment ? formatCurrency(payment.payment) : "$0.00"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
      <div className="bg-soft-blue p-md rounded-md mb-lg">
        <h3 className="text-regular font-bold text-navy-blue mb-sm">Month-by-Month Debt Balances</h3>
        <p className="text-small text-navy-blue mb-md">Watch your debts disappear as you apply the {title.toLowerCase()} strategy. Debts receiving extra payments are highlighted in green.</p>
        
        {/* Show table view only if 3 or fewer debts, otherwise show card view */}
        {state.debts.length <= 3 ? (
          // TABLE VIEW (for 3 or fewer debts)
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-light-gray-blue">
              <thead>
                <tr className="bg-white">
                  <th className="px-md py-sm text-left text-small text-navy-blue font-medium sticky left-0 bg-white">Month</th>
                  {state.debts.map((debt) => (
                    <th key={debt.id} className="px-md py-sm text-center text-small text-navy-blue font-medium min-w-[200px]" colSpan="2">
                      {debt.name}
                      <div className="text-xs text-gray-500">{debt.apr.toFixed(2)}% APR</div>
                      <div className="grid grid-cols-2 gap-2 text-xs mt-1 border-t border-gray-200 pt-1">
                        <span className="text-center">Balance</span>
                        <span className="text-center">Payment</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-md py-sm text-right text-small text-navy-blue font-medium">Total Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray-blue">
                {monthlyPayments.slice(0, displayCount).map((month) => {
                  // Calculate total payment for this month
                  const monthlyTotal = month.debtPayments.reduce((sum, p) => sum + p.payment, 0);
                  
                  // Check for same-month rollover scenario
                  const extraPaymentDebts = month.debtPayments.filter(p => p.extraPayment > 0);
                  const hasMultipleExtraPayments = extraPaymentDebts.length > 1;
                  
                  return (
                    <tr key={month.month} className={`bg-white hover:bg-soft-blue ${hasMultipleExtraPayments ? 'ring-2 ring-bright-green' : ''}`}>
                      <td className="px-md py-sm whitespace-nowrap text-small text-navy-blue font-medium sticky left-0 bg-white">
                        <div className="flex flex-col">
                          <span>{month.month}</span>
                          {hasMultipleExtraPayments && (
                            <span className="text-xs text-bright-green font-bold">↻ ROLLOVER</span>
                          )}
                        </div>
                      </td>
                      {state.debts.map((debt) => {
                        const payment = month.debtPayments.find(p => p.debtId === debt.id);
                        const isExtraPayment = payment?.extraPayment > 0;
                        const balance = payment?.balance || 0;
                        const paymentAmount = payment?.payment || 0;
                        const isPaidOff = balance === 0 && paymentAmount > 0;
                        
                        return (
                          <React.Fragment key={debt.id}>
                            {/* Balance Column */}
                            <td className={`px-md py-sm whitespace-nowrap text-small text-center font-medium border-r border-gray-200 w-[100px]
                              ${isPaidOff ? 'text-gray-400' : 'text-navy-blue'}
                            `}>
                              {isPaidOff ? (
                                <span className="font-bold text-bright-green text-xs">PAID! 🎉</span>
                              ) : (
                                formatCurrency(balance)
                              )}
                            </td>
                            
                            {/* Payment Column */}
                            <td className={`px-md py-sm whitespace-nowrap text-small text-center font-medium w-[100px]
                              ${isExtraPayment ? 'bg-bright-green text-white' : ''}
                              ${paymentAmount === 0 ? 'text-gray-400' : isPaidOff ? 'text-navy-blue' : 'text-navy-blue'}
                            `}>
                              {paymentAmount > 0 ? (
                                <div>
                                  <div className={isExtraPayment ? 'text-white font-bold' : 'text-navy-blue'}>
                                    {formatCurrency(paymentAmount)}
                                  </div>
                                  {isExtraPayment && hasMultipleExtraPayments && (
                                    <div className="text-xs text-yellow-200">
                                      rollover
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </React.Fragment>
                        );
                      })}
                      <td className="px-md py-sm whitespace-nowrap text-small text-navy-blue text-right font-bold">
                        {formatCurrency(monthlyTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          // CARD VIEW (for 4+ debts)
          <div className="space-y-md">
            {monthlyPayments.slice(0, displayCount).map((month) => {
              const monthlyTotal = month.debtPayments.reduce((sum, p) => sum + p.payment, 0);
              const extraPaymentDebts = month.debtPayments.filter(p => p.extraPayment > 0);
              const hasMultipleExtraPayments = extraPaymentDebts.length > 1;
              
              return (
                <div key={month.month} className={`bg-white rounded-lg p-md border ${hasMultipleExtraPayments ? 'border-bright-green border-2' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-sm">
                    <h4 className="text-regular font-bold text-navy-blue">
                      Month {month.month}
                      {hasMultipleExtraPayments && (
                        <span className="text-xs text-bright-green font-bold ml-sm">↻ ROLLOVER</span>
                      )}
                    </h4>
                    <div className="text-right">
                      <div className="text-xs text-navy-blue">Total Payment</div>
                      <div className="text-regular font-bold text-navy-blue">{formatCurrency(monthlyTotal)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sm">
                    {state.debts.map((debt) => {
                      const payment = month.debtPayments.find(p => p.debtId === debt.id);
                      const isExtraPayment = payment?.extraPayment > 0;
                      const balance = payment?.balance || 0;
                      const paymentAmount = payment?.payment || 0;
                      const isPaidOff = balance === 0 && paymentAmount > 0;
                      
                      return (
                        <div key={debt.id} className={`p-sm rounded border ${isExtraPayment ? 'bg-bright-green text-white' : 'bg-gray-50'}`}>
                          <div className={`text-xs font-medium mb-xs ${isExtraPayment ? 'text-white' : 'text-navy-blue'}`}>
                            {debt.name} ({debt.apr.toFixed(2)}%)
                            {isExtraPayment && hasMultipleExtraPayments && (
                              <span className="text-yellow-200 ml-1">rollover</span>
                            )}
                          </div>
                          <div className="space-y-xs">
                            <div className="flex justify-between">
                              <span className={`text-xs ${isExtraPayment ? 'text-white' : 'text-gray-600'}`}>Balance:</span>
                              <span className={`text-xs font-medium ${isExtraPayment ? 'text-white' : isPaidOff ? 'text-gray-400' : 'text-navy-blue'}`}>
                                {isPaidOff ? (
                                  <span className="text-bright-green font-bold">PAID! 🎉</span>
                                ) : (
                                  formatCurrency(balance)
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={`text-xs ${isExtraPayment ? 'text-white' : 'text-gray-600'}`}>Payment:</span>
                              <span className={`text-xs font-bold ${isExtraPayment ? 'text-white' : paymentAmount === 0 ? 'text-gray-400' : 'text-navy-blue'}`}>
                                {paymentAmount > 0 ? formatCurrency(paymentAmount) : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
            
        <div className="mt-md p-sm bg-white rounded-md">
          <h4 className="text-small font-bold text-navy-blue mb-xs">Legend:</h4>
          <div className="flex flex-wrap gap-md text-xs text-navy-blue">
            <div className="flex items-center gap-xs">
              <div className="w-4 h-4 bg-bright-green rounded"></div>
              <span>Payment with extra amount</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="text-bright-green font-bold">PAID! 🎉</span>
              <span>Debt completely paid off</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="text-gray-400">—</span>
              <span>No payment this month</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="text-bright-green font-bold text-xs">↻ ROLLOVER</span>
              <span>Same-month payment rollover</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="text-yellow-200 text-xs">rollover</span>
              <span>Payment includes rollover amount</span>
            </div>
          </div>
        </div>
            
        {displayCount < months && (
          <div className="flex justify-center space-x-md mt-md">
            <button
              onClick={loadMore}
              className="border border-bright-blue text-bright-blue py-xs px-md rounded-full hover:bg-soft-blue transition-colors text-small"
            >
              Load More Months
            </button>
            <button
              onClick={loadAll}
              className="border border-bright-blue text-bright-blue py-xs px-md rounded-full hover:bg-soft-blue transition-colors text-small"
            >
              Show All {months} Months
            </button>
          </div>
        )}
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
          className="text-bright-blue font-bold py-sm px-xl rounded-full border-2 border-bright-blue hover:bg-soft-blue transition-colors"
        >
          Back to Comparison
        </button>
      </div>
    </div>
  );
} 