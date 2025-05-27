import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculateMinimum, calculateAvalanche, calculateSnowball } from '../utils/repaymentStrategies';

export default function StrategyCards() {
  const { state, dispatch } = useApp();
  const { debts, extraMonthlyPayment, selectedStrategy } = state;

  useEffect(() => {
    // Calculate results for all strategies when this component mounts
    if (debts.length > 0) {
      const minimum = calculateMinimum(debts);
      const avalanche = calculateAvalanche(debts, extraMonthlyPayment);
      const snowball = calculateSnowball(debts, extraMonthlyPayment);
      
      dispatch({
        type: 'SET_RESULTS',
        payload: { minimum, avalanche, snowball }
      });
    }
  }, [debts, extraMonthlyPayment, dispatch]);

  const handleSelectStrategy = (strategy) => {
    dispatch({ type: 'SET_STRATEGY', payload: strategy });
    // Navigate to detailed plan immediately
    dispatch({ type: 'SET_STEP', payload: 4 });
  };

  const strategies = [
    {
      id: 'minimum',
      title: 'Minimum Payments Only',
      subtitle: 'If you make just the minimum payment, then you would pay...',
      results: state.results?.minimum,
      bgColor: 'bg-orange',
      buttonColor: 'bg-orange',
      description: 'Make minimum payments on all debts with no roll over payments until all are paid.'
    },
    {
      id: 'avalanche',
      title: 'Avalanche Method',
      subtitle: 'If you pay off the highest interest rate debt first, then you would pay...',
      results: state.results?.avalanche,
      bgColor: 'bg-bright-green',
      buttonColor: 'bg-bright-green',
      description: 'Pay extra on the highest interest rate debt while making minimum payments on all others.'
    },
    {
      id: 'snowball',
      title: 'Snowball Method',
      subtitle: 'If you pay off smallest balances first, then you would pay...',
      results: state.results?.snowball,
      bgColor: 'bg-bright-blue',
      buttonColor: 'bg-bright-blue',
      description: 'Pay extra on the smallest balance debt while making minimum payments on all others.'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);
  };

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {strategies.map((strategy) => {
          const isSelected = selectedStrategy === strategy.id;
          
          return (
            <div 
              key={strategy.id} 
              className={`border-2 rounded-lg overflow-hidden transition-all ${
                isSelected 
                  ? `border-${strategy.bgColor.replace('bg-', '')} shadow-lg transform scale-102` 
                  : 'border-light-gray-blue'
              }`}
            >
              <div className={`${strategy.bgColor} py-md px-lg relative`}>
                  <h3 className="text-h4 text-white font-bold">{strategy.title}</h3>
                {isSelected && (
                  <div className="absolute top-0 right-0 -mt-1 -mr-1 bg-white rounded-full p-1 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-bright-green" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                </div>
                
                <div className="p-lg">
                  <p className="text-small text-navy-blue mb-md">{strategy.subtitle}</p>
                  
                  {strategy.results ? (
                    <>
                      <p className="text-h3 text-navy-blue font-bold mb-sm">
                        {formatCurrency(strategy.results.totalPaid)}
                      </p>
                      
                      <div className="mb-md">
                        <p className="text-small text-navy-blue">over the course of...</p>
                        <p className="text-h3 font-bold text-navy-blue inline">{strategy.results.months}</p>
                        <span className="text-regular text-navy-blue ml-xs">months</span>
                      </div>
                    
                    {/* Principal vs Interest Breakdown */}
                    <div className="mb-md bg-soft-blue rounded-md p-sm">
                      <h4 className="text-small font-bold text-navy-blue mb-xs">Payment Breakdown</h4>
                      <div className="space-y-xs">
                        <div className="flex justify-between text-small">
                          <span className="text-navy-blue">Principal:</span>
                          <span className="font-medium text-bright-blue">{formatCurrency(totalDebt)}</span>
                        </div>
                        <div className="flex justify-between text-small">
                          <span className="text-navy-blue">Interest:</span>
                          <span className="font-medium text-orange">{formatCurrency(strategy.results.totalInterest)}</span>
                        </div>
                        <div className="border-t border-light-gray-blue pt-xs">
                          <div className="flex justify-between text-small font-bold">
                            <span className="text-navy-blue">Total:</span>
                            <span className="text-navy-blue">{formatCurrency(strategy.results.totalPaid)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                      
                      <hr className="border-light-gray-blue my-md" />
                      
                      <p className="text-small text-navy-blue mb-lg">{strategy.description}</p>
                      
                      <button
                        onClick={() => handleSelectStrategy(strategy.id)}
                      className={`text-white font-bold py-sm px-md rounded-full flex items-center justify-center space-x-xs w-full ${strategy.buttonColor} hover:opacity-90 transition-opacity ${isSelected ? 'opacity-80' : ''}`}
                        disabled={!strategy.results}
                      >
                      <span>{isSelected ? 'Selected' : `Select ${strategy.title}`}</span>
                      {!isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-lg">
                      <p className="text-navy-blue">No results available.</p>
                    </div>
                  )}
                </div>
              </div>
          );
        })}
      </div>
      
      {/* Interest Comparison Summary */}
      {state.results && (
        <div className="bg-white p-lg rounded-lg shadow-md">
          <h3 className="text-regular font-bold text-navy-blue mb-md">Interest Savings Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {strategies.map((strategy) => {
              if (!strategy.results) return null;
              
              const minInterest = state.results.minimum?.totalInterest || 0;
              const currentInterest = strategy.results.totalInterest;
              const savings = minInterest - currentInterest;
              const savingsPercent = minInterest > 0 ? ((savings / minInterest) * 100) : 0;
              
              return (
                <div key={strategy.id} className="text-center p-md border border-light-gray-blue rounded-md">
                  <h4 className="text-small font-bold text-navy-blue mb-sm">{strategy.title}</h4>
                  <p className="text-h4 font-bold text-orange mb-xs">
                    {formatCurrency(currentInterest)}
                  </p>
                  <p className="text-xs text-navy-blue">total interest</p>
                  
                  {strategy.id !== 'minimum' && (
                    <div className="mt-sm pt-sm border-t border-light-gray-blue">
                      <p className="text-small font-bold text-bright-green">
                        {savings > 0 ? `Save ${formatCurrency(savings)}` : 'No savings'}
                      </p>
                      {savings > 0 && (
                        <p className="text-xs text-navy-blue">
                          ({savingsPercent.toFixed(1)}% less interest)
                        </p>
                      )}
                    </div>
        )}
      </div>
              );
            })}
          </div>
          
          <div className="mt-md p-md bg-soft-yellow rounded-md flex items-center justify-center">
            <p className="text-small text-navy-blue text-center">
              <strong>💡 Tip:</strong> The Avalanche method typically saves the most money in interest, 
              while the Snowball method provides psychological wins with faster debt elimination.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 