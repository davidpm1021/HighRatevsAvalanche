import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '../context/AppContext';

export default function PaymentSetup() {
  const { state, dispatch } = useApp();
  const { register, watch, formState: { errors } } = useForm({
    defaultValues: {
      extraPayment: state.extraMonthlyPayment
    }
  });

  // Watch the extra payment value
  const extraPayment = watch('extraPayment');

  // Auto-save when the extraPayment value changes
  useEffect(() => {
    const parsedValue = parseFloat(extraPayment) || 0;
    
    // Only dispatch if the value is valid
    if (!isNaN(parsedValue) && parsedValue >= 0) {
      dispatch({
        type: 'SET_EXTRA_PAYMENT',
        payload: parsedValue
      });
    }
  }, [extraPayment, dispatch]);

  const totalMinPayment = state.debts.reduce((sum, debt) => sum + debt.minPayment, 0);
  const totalDebt = state.debts.reduce((sum, debt) => sum + debt.balance, 0);

  return (
    <div className="space-y-8">
      {/* Debt Summary Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333' }}>Your Debt Summary</h3>
        
        <div className="rounded-md p-6" style={{ backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
          <table className="min-w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#333' }}>Debt Name</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: '#333' }}>Balance</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: '#333' }}>Minimum Payment</th>
              </tr>
            </thead>
            <tbody>
              {state.debts.map(debt => (
                <tr key={debt.id} className="hover:bg-white" style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: '#333' }}>
                    {debt.name}
                    {debt.isCreditCard && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#bbdefb', color: '#1976d2' }}>
                        CC
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: '#333' }}>
                    ${debt.balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right" style={{ color: '#2196f3' }}>
                    ${debt.minPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center py-4 px-6 rounded-md mt-4" style={{ backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
          <div className="font-medium" style={{ color: '#333' }}>Total Minimum Monthly Payment</div>
          <div className="text-xl font-bold" style={{ color: '#2196f3' }}>${totalMinPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>
      
      {/* Extra Payment Section */}
      <div className="extra-payments-section">
        <h3 className="extra-payments-title">Extra Payments</h3>
        
        <div className="space-y-6">
          <div className="form-group">
            <label htmlFor="extraPayment" className="form-label">
              Monthly Extra Payment ($):
            </label>
            <input
              type="number"
              id="extraPayment"
              placeholder="0"
              min="0"
              step="0.01"
              {...register('extraPayment', { 
                min: { value: 0, message: 'Extra payment must be positive' }
              })}
            />
            {errors.extraPayment && (
              <p className="mt-2 text-sm" style={{ color: '#f44336' }}>{errors.extraPayment.message}</p>
            )}
            <p className="mt-2 text-sm" style={{ color: '#666' }}>
              Even an extra $50 per month can make a significant difference in your total interest paid.
            </p>
          </div>
          
          <div className="form-group">
            <label htmlFor="oneTimePayment" className="form-label">
              One-Time Extra Payment ($):
            </label>
            <input
              type="number"
              id="oneTimePayment"
              placeholder="0"
              min="0"
              step="0.01"
              disabled
            />
            <p className="mt-2 text-sm" style={{ color: '#666' }}>
              One-time payment feature coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 