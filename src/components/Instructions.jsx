import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Instructions() {
  const { state } = useApp();
  const { currentStep } = state;
  const [showInstructions, setShowInstructions] = useState(true);

  // Close instructions
  const handleClose = () => {
    setShowInstructions(false);
  };
  
  // If instructions are closed, just show a button to reopen
  if (!showInstructions) {
    return (
      <button 
        onClick={() => setShowInstructions(true)}
        className="fixed bottom-4 right-4 bg-navy-blue text-white rounded-full p-md shadow-lg hover:bg-royal-blue transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    );
  }

  // Different instructions based on the current step
  const getStepInstructions = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h3 className="text-h4 font-bold text-navy-blue mb-sm">Step 1: Enter Your Debts</h3>
            <ul className="space-y-xs text-navy-blue mb-md">
              <li>• Click the <span className="font-bold">+ Add Debt</span> button to add each debt you have</li>
              <li>• For each debt, enter:</li>
              <li className="ml-md">- A name (like "Credit Card" or "Student Loan")</li>
              <li className="ml-md">- The interest rate (APR%, found on your statements)</li>
              <li className="ml-md">- Current balance (how much you owe)</li>
              <li className="ml-md">- Minimum monthly payment (what you must pay each month)</li>
              <li>• Add all your debts to get the most accurate results</li>
              <li>• When you're finished, click <span className="font-bold">Next Step</span> at the bottom</li>
            </ul>
          </>
        );
        
      case 2:
        return (
          <>
            <h3 className="text-h4 font-bold text-navy-blue mb-sm">Step 2: Set Up Your Payments</h3>
            <ul className="space-y-xs text-navy-blue mb-md">
              <li>• Review your debts and toggle any on/off if you want to exclude them from your plan</li>
              <li>• Enter how much EXTRA money you can pay each month beyond the minimums</li>
              <li>• Even $50 extra per month can save you a lot of money and time!</li>
              <li>• When ready, click <span className="font-bold">Next Step</span> to see your strategy options</li>
            </ul>
          </>
        );
        
      case 3:
        return (
          <>
            <h3 className="text-h4 font-bold text-navy-blue mb-sm">Step 3: Compare Strategies</h3>
            <ul className="space-y-xs text-navy-blue mb-md">
              <li>• You'll see three different ways to pay off your debt:</li>
              <li className="ml-md">- <span className="font-bold">Minimum Payments:</span> Paying just the minimum each month (slowest method)</li>
              <li className="ml-md">- <span className="font-bold">Avalanche Method:</span> Paying extra on the debt with the highest interest rate first (saves the most money)</li>
              <li className="ml-md">- <span className="font-bold">Snowball Method:</span> Paying extra on the smallest debt first (gives quick wins and motivation)</li>
              <li>• Each card shows how long it will take and how much you'll pay in total</li>
              <li>• Click on any strategy card to select it and automatically see the detailed plan</li>
            </ul>
          </>
        );
        
      case 4:
        return (
          <>
            <h3 className="text-h4 font-bold text-navy-blue mb-sm">Step 4: Your Detailed Repayment Plan</h3>
            <ul className="space-y-xs text-navy-blue mb-md">
              <li>• The table shows exactly how your debts will be paid off month by month</li>
              <li>• Debts receiving extra payments are highlighted in green</li>
              <li>• The priority order shows which debts you'll focus on first</li>
              <li>• The savings summary shows how much you'll save compared to minimum payments</li>
              <li>• Use <span className="font-bold">Load More Months</span> to see your entire payment journey</li>
              <li>• Click <span className="font-bold">Back to Comparison</span> to try different strategies</li>
            </ul>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border-2 border-light-gray-blue overflow-hidden">
      <div className="flex justify-between items-center bg-soft-blue p-sm border-b border-light-gray-blue">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-bright-blue mr-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-regular font-bold text-navy-blue">How This Calculator Works</h2>
        </div>
        <button 
          onClick={handleClose}
          className="text-navy-blue hover:text-bright-blue"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-md max-h-80 overflow-y-auto">
        {getStepInstructions()}
        
        {currentStep === 3 && (
          <div className="bg-soft-yellow p-sm rounded-md text-small text-navy-blue">
            <p className="font-bold mb-xs">Quick math explanation:</p>
            <p>When you pay extra on one debt, you free up money faster. Once that debt is gone, you take its payment AND your extra money and apply it to the next debt. This creates a "snowball" effect that gets stronger as you pay off each debt!</p>
          </div>
        )}
      </div>
    </div>
  );
} 