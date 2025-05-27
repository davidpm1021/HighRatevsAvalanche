import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '../context/AppContext';

export default function EditDebtForm({ debt, onCancel }) {
  const [isCreditCard, setIsCreditCard] = useState(debt.isCreditCard);
  const { register, handleSubmit, reset, formState: { errors }, setValue, unregister } = useForm({
    defaultValues: {
      name: debt.name,
      apr: debt.apr,
      balance: debt.balance,
      minPayment: debt.minPayment,
      isCreditCard: debt.isCreditCard
    }
  });
  
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
      type: 'UPDATE_DEBT',
      payload: {
        id: debt.id,
        name: data.name,
        apr: apr,
        balance: balance,
        minPayment: minPayment,
        isCreditCard: isCreditCard
      }
    });
    
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-md bg-white p-lg rounded-lg shadow-md">
      <h3 className="text-regular text-bright-blue font-bold mb-md">Edit Debt</h3>
      
      <div className="flex items-center justify-between p-md border border-light-gray-blue rounded-md">
        <label htmlFor="isCreditCard" className="text-small font-medium text-navy-blue">
          This is a credit card
        </label>
        <button 
          type="button"
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${isCreditCard ? 'bg-bright-blue' : 'bg-gray-300'}`}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div>
          <label htmlFor="name" className="block text-small font-medium text-navy-blue mb-xs">
            Debt Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="e.g., Student Loans"
            {...register('name', { required: 'Name is required' })}
            className="w-full"
          />
          {errors.name && (
            <p className="mt-xs text-small text-orange">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="apr" className="block text-small font-medium text-navy-blue mb-xs">
            Interest Rate (APR) %
          </label>
          <input
            type="number"
            step="0.01"
            id="apr"
            placeholder="e.g., 5.49"
            {...register('apr', { 
              required: 'APR is required',
              min: { value: 0, message: 'APR must be positive' }
            })}
            className="w-full"
          />
          {errors.apr && (
            <p className="mt-xs text-small text-orange">{errors.apr.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="balance" className="block text-small font-medium text-navy-blue mb-xs">
            Current Balance ($)
          </label>
          <input
            type="number"
            step="0.01"
            id="balance"
            placeholder="e.g., 20000"
            {...register('balance', { 
              required: 'Balance is required',
              min: { value: 0, message: 'Balance must be positive' }
            })}
            className="w-full"
          />
          {errors.balance && (
            <p className="mt-xs text-small text-orange">{errors.balance.message}</p>
          )}
        </div>

        {!isCreditCard && (
          <div>
            <label htmlFor="minPayment" className="block text-small font-medium text-navy-blue mb-xs">
              Minimum Monthly Payment ($)
            </label>
            <input
              type="number"
              step="0.01"
              id="minPayment"
              placeholder="e.g., 50"
              {...register('minPayment', { 
                required: 'Minimum payment is required',
                min: { value: 0, message: 'Payment must be positive' }
              })}
              className="w-full"
            />
            {errors.minPayment && (
              <p className="mt-xs text-small text-orange">{errors.minPayment.message}</p>
            )}
          </div>
        )}
        
        {isCreditCard && (
          <div>
            <label className="block text-small font-medium text-navy-blue mb-xs">
              Minimum Payment
            </label>
            <div className="border border-bright-blue bg-soft-blue rounded-md p-md text-navy-blue shadow-sm">
              <p className="font-medium text-bright-blue mb-xs">Automatically calculated based on your balance</p>
              <p className="mb-sm">For credit cards, the minimum payment is calculated as:</p>
              <ul className="list-disc list-inside text-small mb-sm">
                <li>1% of your current balance <strong>plus</strong> monthly interest</li>
                <li>Or $25, whichever is higher (unless balance is lower)</li>
              </ul>
              <p className="text-xs italic">You don't need to enter this — we'll calculate it for you!</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-md">
        <button
          type="submit"
          className="btn-primary flex-1"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
} 