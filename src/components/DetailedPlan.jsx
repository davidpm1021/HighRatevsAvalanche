import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function DetailedPlan() {
  const { state } = useApp();
  const { selectedStrategy, results } = state;
  const [viewFrequency, setViewFrequency] = useState('monthly'); // 'monthly', 'biannual', 'yearly'
  
  if (!selectedStrategy || !results) {
    return <div>No strategy selected. Please go back and select a repayment strategy.</div>;
  }

  const strategyResults = results[selectedStrategy];
  if (!strategyResults) {
    return <div>No results available for the selected strategy.</div>;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);
  };

  // Get strategy name for display
  const getStrategyName = () => {
    switch (selectedStrategy) {
      case 'minimum': return 'Minimum Payments Only';
      case 'avalanche': return 'Avalanche Method';
      case 'snowball': return 'Snowball Method';
      default: return 'Selected Strategy';
    }
  };

  // Filter payments based on selected frequency
  const getFilteredPayments = () => {
    if (viewFrequency === 'monthly') {
      return strategyResults.monthlyPayments;
    } else if (viewFrequency === 'biannual') {
      return strategyResults.monthlyPayments.filter((_, index) => index % 6 === 0);
    } else { // yearly
      return strategyResults.monthlyPayments.filter((_, index) => index % 12 === 0);
    }
  };

  const filteredPayments = getFilteredPayments();
  
  // Get the header label based on the selected frequency
  const getHeaderLabel = () => {
    switch (viewFrequency) {
      case 'monthly': return 'Month';
      case 'biannual': return 'Every 6 Months';
      case 'yearly': return 'Year';
      default: return 'Period';
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex justify-between items-center mb-lg">
        <h2 className="text-h3 text-navy-blue font-bold">{getStrategyName()} Plan</h2>
        
        <div className="flex space-x-sm">
          <button
            onClick={() => setViewFrequency('monthly')}
            className={`px-md py-sm rounded-md text-small font-medium ${
              viewFrequency === 'monthly' 
                ? 'bg-bright-blue text-white' 
                : 'bg-soft-blue text-navy-blue hover:bg-light-gray-blue'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewFrequency('biannual')}
            className={`px-md py-sm rounded-md text-small font-medium ${
              viewFrequency === 'biannual' 
                ? 'bg-bright-blue text-white' 
                : 'bg-soft-blue text-navy-blue hover:bg-light-gray-blue'
            }`}
          >
            Twice a Year
          </button>
          <button
            onClick={() => setViewFrequency('yearly')}
            className={`px-md py-sm rounded-md text-small font-medium ${
              viewFrequency === 'yearly' 
                ? 'bg-bright-blue text-white' 
                : 'bg-soft-blue text-navy-blue hover:bg-light-gray-blue'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-navy-blue text-white">
              <tr>
                <th className="px-md py-sm text-left text-small font-medium sticky left-0 bg-navy-blue">{getHeaderLabel()}</th>
                {state.debts.map(debt => (
                  <th key={debt.id} className="px-md py-sm text-right text-small font-medium" colSpan="2">
                    {debt.name}
                    {debt.isCreditCard && (
                      <span className="ml-sm inline-flex items-center px-xs py-xs rounded-full text-xs font-medium bg-bright-blue text-white">
                        CC
                      </span>
                    )}
                  </th>
                ))}
                <th className="px-md py-sm text-right text-small font-medium">Total Paid</th>
                <th className="px-md py-sm text-right text-small font-medium">Remaining Debt</th>
              </tr>
              <tr className="bg-soft-blue text-navy-blue">
                <th className="px-md py-xs text-left text-xs font-medium sticky left-0 bg-soft-blue"></th>
                {state.debts.map(debt => (
                  <React.Fragment key={`header-${debt.id}`}>
                    <th className="px-md py-xs text-right text-xs font-medium">Payment</th>
                    <th className="px-md py-xs text-right text-xs font-medium">Balance</th>
                  </React.Fragment>
                ))}
                <th className="px-md py-xs text-right text-xs font-medium"></th>
                <th className="px-md py-xs text-right text-xs font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray-blue">
              {filteredPayments.map((payment, index) => {
                const periodLabel = viewFrequency === 'monthly' 
                  ? index + 1
                  : viewFrequency === 'biannual' 
                    ? `Month ${(index * 6) + 1}`
                    : `Year ${Math.floor(index * 12 / 12) + 1}`;
                
                return (
                  <tr key={index} className="hover:bg-soft-blue">
                    <td className="px-md py-sm text-regular font-medium text-navy-blue sticky left-0 bg-white hover:bg-soft-blue">
                      {periodLabel}
                    </td>
                    
                    {payment.debtPayments.map((debtPayment, i) => {
                      // Identify if this debt is receiving extra payment
                      const isReceivingExtra = debtPayment.payment > debtPayment.minimumPayment && debtPayment.balance > 0;
                      // Identify if this debt was paid off this period
                      const justPaidOff = debtPayment.balance === 0 && 
                        (index === 0 || filteredPayments[index - 1].debtPayments[i].balance > 0);
                      
                      return (
                        <React.Fragment key={`payment-${index}-${i}`}>
                          <td className={`px-md py-sm text-right whitespace-nowrap ${
                            isReceivingExtra ? 'text-bright-green font-bold' : 'text-navy-blue'
                          }`}>
                            {formatCurrency(debtPayment.payment)}
                            {isReceivingExtra && (
                              <span className="inline-block ml-xs">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-bright-green" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </td>
                          <td className={`px-md py-sm text-right whitespace-nowrap ${
                            justPaidOff ? 'text-bright-green font-bold' : 'text-navy-blue'
                          }`}>
                            {formatCurrency(debtPayment.balance)}
                            {justPaidOff && (
                              <span className="ml-xs text-xs bg-bright-green text-white px-xs py-xs rounded-sm">
                                PAID!
                              </span>
                            )}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    
                    <td className="px-md py-sm text-right whitespace-nowrap text-bright-blue font-medium">
                      {formatCurrency(payment.totalPaid)}
                    </td>
                    <td className="px-md py-sm text-right whitespace-nowrap text-navy-blue">
                      {formatCurrency(payment.remainingDebt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-md bg-soft-blue">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-sm md:space-y-0">
            <div>
              <p className="text-navy-blue font-medium">Total Paid: <span className="text-bright-blue font-bold">{formatCurrency(strategyResults.totalPaid)}</span></p>
              <p className="text-navy-blue font-medium">Total Interest: <span className="text-orange font-bold">{formatCurrency(strategyResults.totalInterest)}</span></p>
            </div>
            <div>
              <p className="text-navy-blue font-medium">Months to Debt-Free: <span className="text-bright-blue font-bold">{strategyResults.months}</span></p>
              <p className="text-navy-blue font-medium">Years to Debt-Free: <span className="text-bright-blue font-bold">{(strategyResults.months / 12).toFixed(1)}</span></p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-md rounded-lg shadow-md">
        <h3 className="text-regular font-bold text-navy-blue mb-sm">Understanding This Plan</h3>
        <div className="space-y-sm text-small text-navy-blue">
          <p>
            <span className="inline-block mr-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-bright-green" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <strong className="text-bright-green">Green payments with up arrows</strong> show where your extra payment is being applied.
          </p>
          <p>
            <span className="inline-block mr-xs text-xs bg-bright-green text-white px-xs py-xs rounded-sm">
              PAID!
            </span>
            <strong className="text-bright-green">PAID! tag</strong> indicates when a debt is completely paid off.
          </p>
          {selectedStrategy !== 'minimum' && (
            <p>
              <strong>How rollover works:</strong> When one debt is paid off, its minimum payment amount "rolls over" and is added to the extra payment for the next debt in line, accelerating your progress.
            </p>
          )}
          {selectedStrategy === 'avalanche' && (
            <p>
              <strong>Avalanche Method:</strong> Your extra payment targets the highest interest rate debt first, saving you the most money in interest over time.
            </p>
          )}
          {selectedStrategy === 'snowball' && (
            <p>
              <strong>Snowball Method:</strong> Your extra payment targets the smallest balance debt first, giving you quick wins to maintain motivation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 