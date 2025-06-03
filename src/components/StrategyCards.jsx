import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateMinimum, calculateAvalanche, calculateSnowball } from '../utils/repaymentStrategies';

// Collapsible Info Box Component
const CollapsibleInfo = ({ title, icon, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div className="border border-light-gray-blue rounded-md overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-bright-blue focus:ring-inset text-left"
        aria-expanded={isExpanded}
        aria-controls={`info-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center space-x-2">
          {icon && <span className="text-base" aria-hidden="true">{icon}</span>}
          <span className="text-sm font-bold text-navy-blue uppercase tracking-wide">{title}</span>
        </div>
        <svg 
          className={`h-4 w-4 text-navy-blue transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div 
          id={`info-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="p-4 bg-white border-t border-light-gray-blue"
        >
          {children}
        </div>
      )}
    </div>
  );
};

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
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const strategies = [
    {
      id: 'minimum',
      title: 'Minimum Payments',
      subtitle: 'If you make just the minimum payment, then you would pay...',
      results: state.results?.minimum,
      bgColor: 'bg-orange',
      buttonColor: 'bg-orange',
      description: 'Make the required minimum payment on each debt.',
      howItWorks: 'You make the required minimum payment on each debt with no extra payments',
      pros: [
        'Keep more cash in your pocket each month',
        'Provides short-term financial flexibility'
      ],
      cons: [
        'Slowest and most expensive way to pay off debt',
        'Interest piles up over time',
        'You could stay in debt for decades'
      ],
      bestFor: 'Those with very tight budgets who need maximum monthly flexibility'
    },
    {
      id: 'avalanche',
      title: 'Debt Avalanche',
      subtitle: 'If you pay off the highest interest rate debt first, then you would pay...',
      results: state.results?.avalanche,
      bgColor: 'bg-bright-green',
      buttonColor: 'bg-bright-green',
      description: 'Pay the minimum on all debts, then send extra money to the highest interest rate debt first.',
      howItWorks: 'You pay the minimum on all debts and send any extra money to the debt with the highest interest rate first',
      pros: [
        'Saves you the most money over time',
        'Cuts down on total interest paid',
        'Mathematically optimal strategy'
      ],
      cons: [
        'Progress can feel slow at first',
        'Your biggest debts might not budge right away',
        'Requires discipline to stick with it'
      ],
      bestFor: 'Disciplined savers who want to minimize total interest costs'
    },
    {
      id: 'snowball',
      title: 'Debt Snowball',
      subtitle: 'If you pay off smallest balances first, then you would pay...',
      results: state.results?.snowball,
      bgColor: 'bg-bright-blue',
      buttonColor: 'bg-bright-blue',
      description: 'Pay the minimum on all debts, then send extra money to the smallest balance first.',
      howItWorks: 'You pay the minimum on all debts and send any extra money to the debt with the smallest balance first',
      pros: [
        'Gives you quick wins and early victories',
        'Helps build motivation and momentum',
        'Easier to stay committed long-term'
      ],
      cons: [
        'You might pay a bit more in total interest',
        'Not the most mathematically efficient',
        'Could cost more over time than avalanche'
      ],
      bestFor: 'People who need motivation and psychological wins to stay on track'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);
  };

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);

  return (
    <div className="space-y-8">
      {/* Strategy Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => {
          return (
            <div 
              key={strategy.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full"
            >
              {/* Strategy Header - Fixed Height */}
              <div className={`${strategy.bgColor} px-6 py-4 flex flex-col justify-center`} style={{ minHeight: '80px' }}>
                <h3 className="text-xl font-bold text-white leading-tight text-center">
                  {strategy.title}
                </h3>
              </div>
                
              <div className="p-6 flex flex-col flex-grow">
                {/* Subtitle - Fixed Height */}
                <div style={{ minHeight: '48px' }} className="flex items-center justify-center mb-6">
                  <p className="text-sm text-gray-600 leading-relaxed text-center">{strategy.subtitle}</p>
                </div>
                  
                {strategy.results ? (
                  <>
                    {/* Key Metrics - Fixed Height */}
                    <div className="text-center mb-6" style={{ minHeight: '120px' }}>
                      <div className="text-3xl font-bold text-navy-blue mb-2">
                        {formatCurrency(strategy.results.totalPaid)}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">total cost</div>
                      
                      <div className="flex items-center justify-center space-x-4 text-sm">
                        <div className="text-center">
                          <div className="text-xl font-bold text-navy-blue">{strategy.results.months}</div>
                          <div className="text-gray-600">months</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange">{formatCurrency(strategy.results.totalInterest)}</div>
                          <div className="text-gray-600">interest</div>
                        </div>
                      </div>
                    </div>
                      
                    {/* Educational Content - Collapsible - Flexible Height */}
                    <div className="space-y-3 mb-6 flex-grow">
                      <CollapsibleInfo 
                        title="How It Works" 
                        icon="⚙️"
                        defaultExpanded={false}
                      >
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {strategy.howItWorks}
                        </p>
                      </CollapsibleInfo>
                      
                      <CollapsibleInfo 
                        title="Pros & Cons" 
                        icon="⚖️"
                        defaultExpanded={false}
                      >
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-bold text-bright-green uppercase mb-2 flex items-center">
                              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Pros
                            </h4>
                            <ul className="space-y-1">
                              {strategy.pros.map((pro, index) => (
                                <li key={index} className="flex items-start text-sm">
                                  <span className="text-bright-green mr-2 mt-0.5">✓</span>
                                  <span className="text-gray-700">{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-bold text-orange uppercase mb-2 flex items-center">
                              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm4.707-7.293a1 1 0 00-1.414-1.414L11 11.586l-2.293-2.293a1 1 0 00-1.414 1.414L9.586 13l-2.293 2.293a1 1 0 101.414 1.414L11 14.414l2.293 2.293a1 1 0 001.414-1.414L12.414 13l2.293-2.293z" clipRule="evenodd" />
                              </svg>
                              Cons
                            </h4>
                            <ul className="space-y-1">
                              {strategy.cons.map((con, index) => (
                                <li key={index} className="flex items-start text-sm">
                                  <span className="text-orange mr-2 mt-0.5">✗</span>
                                  <span className="text-gray-700">{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CollapsibleInfo>
                      
                      <CollapsibleInfo 
                        title="Best For" 
                        icon="🎯"
                        defaultExpanded={false}
                      >
                        <div className="bg-soft-blue-tint rounded-md p-3">
                          <p className="text-sm text-navy-blue font-medium">
                            {strategy.bestFor}
                          </p>
                        </div>
                      </CollapsibleInfo>
                    </div>
                      
                    {/* Action Button - Fixed Height and Position */}
                    <div className="mt-auto">
                      <button
                        onClick={() => handleSelectStrategy(strategy.id)}
                        className={`w-full text-white font-bold rounded-md transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 ${strategy.buttonColor} focus:ring-opacity-50`}
                        style={{ height: '48px' }}
                        disabled={!strategy.results}
                        aria-label={`View detailed payment plan for ${strategy.title} strategy`}
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <span>View Payment Plan</span>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 flex-grow flex items-center justify-center">
                    <div className="text-center">
                      <svg className="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-600">Calculating results...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Interest Comparison Summary */}
      {state.results && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-navy-blue mb-4 text-center">
            Interest Savings Comparison
          </h3>
          <p className="text-sm text-gray-600 text-center mb-6 max-w-2xl mx-auto">
            See how much you could save in interest costs by choosing an accelerated repayment strategy.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strategies.map((strategy) => {
              if (!strategy.results) return null;
              
              const minInterest = state.results.minimum?.totalInterest || 0;
              const currentInterest = strategy.results.totalInterest;
              const savings = minInterest - currentInterest;
              const savingsPercent = minInterest > 0 ? ((savings / minInterest) * 100) : 0;
              
              return (
                <div 
                  key={strategy.id} 
                  className="text-center p-4 border border-gray-200 rounded-md hover:border-bright-blue transition-colors"
                >
                  <h4 className="text-sm font-bold text-navy-blue uppercase mb-3 tracking-wide">
                    {strategy.title}
                  </h4>
                  <div className="text-2xl font-bold text-orange mb-1">
                    {formatCurrency(currentInterest)}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">total interest</div>
                  
                  {strategy.id !== 'minimum' && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-lg font-bold text-bright-green mb-1">
                        {savings > 0 ? `Save ${formatCurrency(savings)}` : 'No savings'}
                      </div>
                      {savings > 0 && (
                        <div className="text-sm text-gray-600">
                          ({savingsPercent.toFixed(1)}% less interest)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 