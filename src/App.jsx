import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import DebtForm from './components/DebtForm';
import DebtList from './components/DebtList';
import PaymentSetup from './components/PaymentSetup';
import StrategyCards from './components/StrategyCards';
import PlanDetails from './components/PlanDetails';
import Navigation from './components/Navigation';
import Instructions from './components/Instructions';

function AppContent() {
  const { state } = useApp();
  const { currentStep } = state;
  
  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8" style={{ border: '1px solid #e0e0e0' }}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2" style={{ color: '#333' }}>Add Your Debts</h2>
                <p className="text-sm" style={{ color: '#666' }}>Enter information about each of your debts to get started.</p>
              </div>
              <DebtForm />
              <DebtList />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8" style={{ border: '1px solid #e0e0e0' }}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2" style={{ color: '#333' }}>Payment Setup</h2>
                <p className="text-sm" style={{ color: '#666' }}>Set your extra monthly payment amount.</p>
              </div>
              <PaymentSetup />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8" style={{ border: '1px solid #e0e0e0' }}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2" style={{ color: '#333' }}>Compare Strategies</h2>
                <p className="text-sm" style={{ color: '#666' }}>Choose the debt repayment strategy that works best for you.</p>
              </div>
              <StrategyCards />
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8" style={{ border: '1px solid #e0e0e0' }}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2" style={{ color: '#333' }}>Your Repayment Plan</h2>
                <p className="text-sm" style={{ color: '#666' }}>Detailed breakdown of your selected repayment strategy.</p>
              </div>
              <PlanDetails />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <Header />
      <main className="py-8 px-6">
        {renderContent()}
        <div className="mt-8 max-w-2xl mx-auto">
          <Navigation />
        </div>
      </main>
      <Instructions />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App; 