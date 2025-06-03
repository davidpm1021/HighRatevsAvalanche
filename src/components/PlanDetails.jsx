import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PlanDetails() {
  const { state, dispatch } = useApp();
  const { selectedStrategy, results } = state;
  const [displayCount, setDisplayCount] = useState(24);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  
  if (!selectedStrategy || !results || !results[selectedStrategy]) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Strategy Selected</h2>
          <p className="text-gray-600 mb-6">Please select a repayment strategy to view your detailed breakdown.</p>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
            className="bg-blue-600 text-white font-medium py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            Choose Strategy
          </button>
        </div>
      </div>
    );
  }
  
  const strategyData = results[selectedStrategy];
  const { totalPaid, totalInterest, months, monthlyPayments } = strategyData;
  const minimumResult = results.minimum;
  
  if (!monthlyPayments || monthlyPayments.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Payment Data Available</h2>
          <p className="text-gray-600">Unable to calculate payment schedule for this strategy.</p>
        </div>
      </div>
    );
  }
  
  // Get strategy info with consistent naming
  const getStrategyInfo = (strategy) => {
    const strategies = {
      minimum: { 
        title: 'Minimum Payments',
        bgColor: 'bg-orange',
        color: 'orange'
      },
      avalanche: { 
        title: 'Debt Avalanche',
        bgColor: 'bg-bright-green',
        color: 'bright-green'
      },
      snowball: { 
        title: 'Debt Snowball',
        bgColor: 'bg-bright-blue',
        color: 'bright-blue'
      }
    };
    return strategies[strategy] || { title: 'Unknown Strategy', bgColor: 'bg-gray-600', color: 'gray' };
  };
  
  const { title, bgColor, color } = getStrategyInfo(selectedStrategy);
  
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

  // Calculate simple debt priority and payoff order
  const getDebtPriorityList = () => {
    const debtPayoffData = [];
    
    // Find when each debt gets paid off
    state.debts.forEach(debt => {
      let payoffMonth = null;
      for (let i = 0; i < monthlyPayments.length; i++) {
        const month = monthlyPayments[i];
        const payment = month.debtPayments.find(p => p.debtId === debt.id);
        if (payment && payment.balance === 0 && payment.payment > 0) {
          payoffMonth = i + 1;
          break;
        }
      }
      
      debtPayoffData.push({
        ...debt,
        payoffMonth: payoffMonth || months // Use total months if not found
      });
    });
    
    // Sort debts by strategy order
    let sortedDebts;
    let sortingDescription;
    
    if (selectedStrategy === 'avalanche') {
      sortedDebts = [...debtPayoffData].sort((a, b) => b.apr - a.apr);
      sortingDescription = 'Ordered by highest interest rate first';
    } else if (selectedStrategy === 'snowball') {
      sortedDebts = [...debtPayoffData].sort((a, b) => a.balance - b.balance);
      sortingDescription = 'Ordered by lowest balance first';
    } else {
      sortedDebts = [...debtPayoffData].sort((a, b) => a.payoffMonth - b.payoffMonth);
      sortingDescription = 'Ordered by natural payoff timeline';
    }
    
    return {
      debts: sortedDebts,
      sortingDescription
    };
  };
  
  const { debts: prioritizedDebts, sortingDescription } = getDebtPriorityList();

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Back Navigation */}
      <div className="mb-8">
        <button
          onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors shadow-sm"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Comparison</span>
        </button>
      </div>

      {/* Strategy Header */}
      <div className={`${bgColor} rounded-lg py-8 px-8 text-center mb-8`}>
        <h1 className="text-3xl font-bold mb-2 text-white">{title}</h1>
      </div>
        
      {/* Key Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{months}</div>
            <div className="text-lg text-gray-600">months to payoff</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{formatCurrency(totalPaid)}</div>
            <div className="text-lg text-gray-600">total cost</div>
          </div>
        </div>
      </div>
      
      {/* Savings Summary */}
      {minimumResult && minimumResult !== strategyData && savings.interest > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings vs Minimum Payments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(savings.interest)}</div>
              <div className="text-gray-600">interest saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{savings.time} months</div>
              <div className="text-gray-600">time saved</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Debt Priority List */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg border border-blue-200 p-8 mb-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Debt Priority Order</h2>
          <p className="text-gray-600">{sortingDescription}</p>
        </div>
        
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            {prioritizedDebts.map((debt, index) => (
              <div 
                key={debt.id} 
                className="flex items-center justify-between py-4 px-6 bg-soft-blue-tint border border-light-gray-blue rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-blue">{debt.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{debt.apr.toFixed(2)}% APR</span>
                      <span>•</span>
                      <span>{formatCurrency(debt.balance)} balance</span>
                      {debt.isCreditCard && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-bright-blue text-white">
                            Credit Card
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Paid off in</div>
                  <div className="text-2xl font-bold text-green-600">
                    Month {debt.payoffMonth}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {prioritizedDebts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 mb-4">
                <div className="text-lg font-bold">🎉 All debts paid off in {months} months! 🎉</div>
              </div>
              <button
                onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-700 transition-colors font-medium py-3 px-6 rounded-lg border border-blue-200 shadow-sm mx-auto"
              >
                <span>{showDetailedBreakdown ? 'Hide' : 'Show'} Month-by-Month Details</span>
                <svg 
                  className={`h-5 w-5 transition-transform ${showDetailedBreakdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {/* Detailed Month-by-Month Breakdown */}
        {showDetailedBreakdown && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Month-by-Month Details</h3>
            </div>
            
            {/* Responsive Table/Card View */}
            {state.debts.length <= 3 ? (
              // TABLE VIEW (for 3 or fewer debts)
              <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 mb-6">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Month</th>
                      {state.debts.map((debt) => (
                        <th key={debt.id} className="px-6 py-3 text-center text-sm font-semibold text-gray-900" colSpan="2">
                          <div className="mb-1">{debt.name}</div>
                          <div className="text-xs font-normal text-gray-600">{debt.apr.toFixed(2)}% APR</div>
                          <div className="grid grid-cols-2 gap-2 text-xs mt-2 pt-2 border-t border-gray-200">
                            <span>Balance</span>
                            <span>Payment</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthlyPayments.slice(0, displayCount).map((month, monthIndex) => {
                      const monthlyTotal = month.debtPayments.reduce((sum, p) => sum + p.payment, 0);
                      const extraPaymentDebts = month.debtPayments.filter(p => p.extraPayment > 0);
                      
                      return (
                        <tr key={month.month} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            Month {month.month}
                            {extraPaymentDebts.length > 1 && (
                              <div className="text-xs text-green-600 mt-1">Multiple payments</div>
                            )}
                          </td>
                          {state.debts.map((debt) => {
                            const payment = month.debtPayments.find(p => p.debtId === debt.id);
                            const isExtraPayment = payment?.extraPayment > 0;
                            const balance = payment?.balance || 0;
                            const paymentAmount = payment?.payment || 0;
                            const isPaidOff = balance === 0 && paymentAmount > 0;
                            
                            return (
                              <React.Fragment key={debt.id}>
                                <td className={`px-6 py-4 text-sm text-center border-r border-gray-200 ${isPaidOff ? 'text-gray-400' : 'text-gray-900'}`}>
                                  {isPaidOff ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100">
                                      PAID OFF
                                    </span>
                                  ) : (
                                    formatCurrency(balance)
                                  )}
                                </td>
                                <td className={`px-6 py-4 text-sm text-center ${isExtraPayment ? 'bg-green-50 text-green-700 font-semibold' : paymentAmount === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                                  {paymentAmount > 0 ? formatCurrency(paymentAmount) : '—'}
                                </td>
                              </React.Fragment>
                            );
                          })}
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-semibold">
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
              <div className="grid grid-cols-1 gap-4 mb-6">
                {monthlyPayments.slice(0, displayCount).map((month) => {
                  const monthlyTotal = month.debtPayments.reduce((sum, p) => sum + p.payment, 0);
                  const extraPaymentDebts = month.debtPayments.filter(p => p.extraPayment > 0);
                  
                  return (
                    <div key={month.month} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Month {month.month}
                          {extraPaymentDebts.length > 1 && (
                            <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              Multiple payments
                            </span>
                          )}
                        </h4>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Total Payment</div>
                          <div className="text-lg font-semibold text-gray-900">{formatCurrency(monthlyTotal)}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {state.debts.map((debt) => {
                          const payment = month.debtPayments.find(p => p.debtId === debt.id);
                          const isExtraPayment = payment?.extraPayment > 0;
                          const balance = payment?.balance || 0;
                          const paymentAmount = payment?.payment || 0;
                          const isPaidOff = balance === 0 && paymentAmount > 0;
                          
                          return (
                            <div 
                              key={debt.id} 
                              className={`rounded-lg p-4 border ${isExtraPayment ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                            >
                              <h5 className="font-semibold text-gray-900 mb-2">
                                {debt.name}
                                <span className="block text-sm font-normal text-gray-600">
                                  {debt.apr.toFixed(2)}% APR
                                </span>
                              </h5>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Balance:</span>
                                  <span className={`text-sm font-medium ${isPaidOff ? 'text-gray-400' : 'text-gray-900'}`}>
                                    {isPaidOff ? (
                                      <span className="text-green-600">PAID OFF</span>
                                    ) : (
                                      formatCurrency(balance)
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Payment:</span>
                                  <span className={`text-sm font-medium ${isExtraPayment ? 'text-green-600' : paymentAmount === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
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
            
            {/* Legend */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Legend</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 rounded border border-green-200"></div>
                  <span className="text-gray-700">Extra payment applied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100">
                    PAID OFF
                  </span>
                  <span className="text-gray-700">Debt eliminated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-lg font-bold">—</span>
                  <span className="text-gray-700">No payment required</span>
                </div>
              </div>
            </div>
            
            {/* Load More Controls */}
            {displayCount < months && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={loadMore}
                  className="w-full sm:w-auto bg-white border border-blue-300 text-blue-600 font-medium py-3 px-6 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Load More Months
                </button>
                <button
                  onClick={loadAll}
                  className="w-full sm:w-auto bg-blue-600 text-white font-medium py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Show All {months} Months
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 