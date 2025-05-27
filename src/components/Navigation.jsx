import React from 'react';
import { useApp } from '../context/AppContext';

export default function Navigation() {
  const { state, dispatch } = useApp();
  const { currentStep, debts } = state;
  
  const goToStep = (step) => {
    // Ensure we can't go to strategy comparison or details with no debts
    if ((step === 3 || step === 4) && debts.length === 0) {
      return;
    }
    
    // Ensure we can't go to details without selecting a strategy first
    if (step === 4 && !state.selectedStrategy) {
      return;
    }
    
    dispatch({ type: 'SET_STEP', payload: step });
  };
  
  return (
    <div className="flex justify-between items-center py-md">
      <button
        onClick={() => goToStep(currentStep - 1)}
        className={`btn-secondary ${currentStep === 1 ? 'invisible' : ''}`}
        disabled={currentStep === 1}
      >
        Previous Step
      </button>
      
      <div className="flex space-x-xs">
        {[1, 2, 3, 4].map((step) => (
          <button
            key={step}
            onClick={() => goToStep(step)}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === step
                ? 'bg-bright-blue text-white'
                : 'bg-light-gray-blue text-navy-blue'
            }`}
            disabled={(step === 3 || step === 4) && debts.length === 0}
          >
            {step}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => goToStep(currentStep + 1)}
        className={`btn-primary ${currentStep === 4 ? 'invisible' : ''}`}
        disabled={
          currentStep === 4 ||
          (currentStep === 2 && debts.length === 0) ||
          (currentStep === 3 && !state.selectedStrategy)
        }
      >
        Next Step
      </button>
    </div>
  );
} 