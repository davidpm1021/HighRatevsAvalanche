import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '../context/AppContext';

export default function DebtForm() {
  const [showForm, setShowForm] = useState(false);
  const [isCreditCard, setIsCreditCard] = useState(false);
  const { register, handleSubmit, reset, formState: { errors }, setValue, unregister } = useForm();
  const { dispatch } = useApp();

  // Calculate credit card minimum payment
  const calculateCreditCardMinimum = (balance, apr) => {
    const monthlyInterestRate = apr / 100 / 12;
    const monthlyInterest = balance * monthlyInterestRate;
    const percentageOfBalance = balance * 0.01; // 1% of balance
    const calculatedMinimum = percentageOfBalance + monthlyInterest;
    
    // Most credit cards have a minimum of $25 or the full balance if less than $25
    const fixedMinimum = balance < 25 ? balance : 25;
    
    return Math.max(calculatedMinimum, fixedMinimum);
  };

  // Handle toggle of credit card
  const handleCreditCardToggle = () => {
    const newValue = !isCreditCard;
    setIsCreditCard(newValue);
    
    // Update the form value for isCreditCard
    setValue('isCreditCard', newValue);
    
    // If it's now a credit card, unregister minimum payment field to remove validation
    if (newValue) {
      unregister('minPayment');
    }
  };

  const onSubmit = (data) => {
    const balance = parseFloat(data.balance);
    const apr = parseFloat(data.apr);
    
    // If it's a credit card, calculate the minimum payment
    const minPayment = isCreditCard 
      ? calculateCreditCardMinimum(balance, apr)
      : parseFloat(data.minPayment);

    dispatch({
      type: 'ADD_DEBT',
      payload: {
        name: data.name,
        apr: apr,
        balance: balance,
        minPayment: minPayment,
        isCreditCard: isCreditCard
      }
    });
    reset();
    setShowForm(false);
    setIsCreditCard(false);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    setIsCreditCard(false);
  };

  return (
    <div className="space-y-6">
      {!showForm ? (
        <button
          onClick={toggleForm}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Add New Debt</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-md" style={{ backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
            <label htmlFor="isCreditCard" className="text-sm font-medium" style={{ color: '#333' }}>
              This is a credit card
            </label>
            <button 
              type="button"
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${isCreditCard ? 'bg-blue-600' : 'bg-gray-300'}`}
              style={{ backgroundColor: isCreditCard ? '#2196f3' : '#e0e0e0' }}
              onClick={handleCreditCardToggle}
              id="isCreditCard"
            >
              <span className="sr-only">Toggle credit card</span>
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isCreditCard ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <input
              type="hidden"
              {...register('isCreditCard')}
              value={isCreditCard}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Debt Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="e.g., Student Loans"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="mt-2 text-sm" style={{ color: '#f44336' }}>{errors.name.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="balance" className="form-label">
                Current Balance ($)
              </label>
              <input
                type="number"
                step="0.01"
                id="balance"
                placeholder="0"
                {...register('balance', { 
                  required: 'Balance is required',
                  min: { value: 0, message: 'Balance must be positive' }
                })}
              />
              {errors.balance && (
                <p className="mt-2 text-sm" style={{ color: '#f44336' }}>{errors.balance.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="apr" className="form-label">
                Annual Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                id="apr"
                placeholder="0"
                {...register('apr', { 
                  required: 'APR is required',
                  min: { value: 0, message: 'APR must be positive' }
                })}
              />
              {errors.apr && (
                <p className="mt-2 text-sm" style={{ color: '#f44336' }}>{errors.apr.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="minPayment" className="form-label">
                Minimum Monthly Payment ($)
              </label>
              {!isCreditCard ? (
                <>
                  <input
                    type="number"
                    step="0.01"
                    id="minPayment"
                    placeholder="0"
                    {...register('minPayment', { 
                      required: 'Minimum payment is required',
                      min: { value: 0, message: 'Payment must be positive' }
                    })}
                  />
                  {errors.minPayment && (
                    <p className="mt-2 text-sm" style={{ color: '#f44336' }}>{errors.minPayment.message}</p>
                  )}
                </>
              ) : (
                <div className="rounded-md p-4" style={{ border: '1px solid #e0e0e0', backgroundColor: '#bbdefb', color: '#333' }}>
                  <div className="flex items-center mb-2">
                    <svg className="h-4 w-4 mr-2" style={{ color: '#1976d2' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium" style={{ color: '#1976d2' }}>Automatically calculated</p>
                  </div>
                  <p className="text-xs mb-2">For credit cards, minimum payment is:</p>
                  <ul className="list-disc list-inside text-xs mb-2 ml-4">
                    <li>1% of balance + monthly interest</li>
                    <li>Or $25 minimum (if balance allows)</li>
                  </ul>
                  <p className="text-xs italic">Calculated using standard industry practices</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              Add Debt
            </button>
            <button
              type="button"
              onClick={toggleForm}
              className="btn-secondary px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 