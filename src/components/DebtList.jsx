import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import EditDebtForm from './EditDebtForm';

export default function DebtList() {
  const { state, dispatch } = useApp();
  const [showInfoId, setShowInfoId] = useState(null);
  const [editingDebt, setEditingDebt] = useState(null);

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_DEBT', payload: id });
  };

  const toggleInfo = (id) => {
    setShowInfoId(showInfoId === id ? null : id);
  };

  const handleEdit = (debt) => {
    setEditingDebt(debt);
  };

  const handleCancelEdit = () => {
    setEditingDebt(null);
  };

  // Calculate credit card minimum payment
  const calculateCreditCardMinPayment = (balance, apr) => {
    const monthlyInterestRate = apr / 100 / 12;
    const monthlyInterest = balance * monthlyInterestRate;
    const percentageOfBalance = balance * 0.01; // 1% of balance
    const calculatedMinimum = percentageOfBalance + monthlyInterest;
    
    // Most credit cards have a minimum of $25 or the full balance if less than $25
    const fixedMinimum = balance < 25 ? balance : 25;
    
    return Math.max(calculatedMinimum, fixedMinimum);
  };

  const totalDebt = state.debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinPayment = state.debts.reduce((sum, debt) => sum + debt.minPayment, 0);

  return (
    <div className="space-y-md">
      {editingDebt && (
        <EditDebtForm 
          debt={editingDebt} 
          onCancel={handleCancelEdit} 
        />
      )}

      {!editingDebt && (
        <div className="overflow-x-auto">
          {state.debts.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-light-gray-blue">
                  <th className="px-md py-sm text-left text-small font-medium text-navy-blue">Name</th>
                  <th className="px-md py-sm text-left text-small font-medium text-navy-blue">Interest Rate (APR) %</th>
                  <th className="px-md py-sm text-right text-small font-medium text-navy-blue">Balance</th>
                  <th className="px-md py-sm text-right text-small font-medium text-navy-blue">Minimum Monthly Payment</th>
                  <th className="px-md py-sm text-right text-small font-medium text-navy-blue"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray-blue">
                {state.debts.map((debt) => (
                  <React.Fragment key={debt.id}>
                    <tr className="hover:bg-soft-blue">
                      <td className="px-md py-sm whitespace-nowrap text-regular font-medium text-navy-blue">
                        <div className="flex items-center">
                          {debt.name}
                          {debt.isCreditCard && (
                            <span className="ml-sm inline-flex items-center px-xs py-xs rounded-full text-xs font-medium bg-bright-blue text-white">
                              CC
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-md py-sm whitespace-nowrap text-regular text-navy-blue">
                        {debt.apr.toFixed(2)}%
                      </td>
                      <td className="px-md py-sm whitespace-nowrap text-regular text-navy-blue text-right">
                        ${debt.balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-md py-sm whitespace-nowrap text-regular text-bright-blue font-medium text-right">
                        <div className="flex items-center justify-end">
                          ${debt.minPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          {debt.isCreditCard && (
                            <button 
                              onClick={() => toggleInfo(debt.id)}
                              className="ml-xs text-navy-blue hover:text-bright-blue"
                              title="Credit Card Min Payment Info"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-md py-sm whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-xs">
                          <button
                            onClick={() => handleDelete(debt.id)}
                            className="px-sm py-xs bg-light-gray-blue text-navy-blue text-small rounded-md hover:bg-bright-blue hover:text-white transition-colors duration-200"
                          >
                            Delete
                          </button>
                          <button 
                            onClick={() => handleEdit(debt)}
                            className="px-sm py-xs text-small bg-light-gray-blue text-navy-blue rounded-md hover:bg-bright-blue hover:text-white transition-colors duration-200"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                    {debt.isCreditCard && showInfoId === debt.id && (
                      <tr className="bg-soft-blue">
                        <td colSpan="5" className="px-md py-sm">
                          <div className="p-md bg-white rounded-md border border-light-gray-blue">
                            <h4 className="font-medium text-navy-blue mb-sm">Credit Card Minimum Payment Calculation</h4>
                            <p className="text-small text-navy-blue mb-xs">
                              Credit card minimum payments are typically calculated as:
                            </p>
                            <ul className="list-disc list-inside text-small text-navy-blue mb-md">
                              <li>1% of your balance + this month's interest, or</li>
                              <li>A fixed minimum amount (usually $25), whichever is higher</li>
                            </ul>
                            <div className="bg-soft-blue p-sm rounded-md">
                              <p className="text-small text-navy-blue mb-xs">
                                <strong>For this card:</strong>
                              </p>
                              <div className="grid grid-cols-2 gap-xs text-small">
                                <div>1% of balance:</div>
                                <div>${(debt.balance * 0.01).toFixed(2)}</div>
                                <div>Monthly interest:</div>
                                <div>${(debt.balance * (debt.apr / 100 / 12)).toFixed(2)}</div>
                                <div>Fixed minimum:</div>
                                <div>${debt.balance < 25 ? debt.balance.toFixed(2) : '25.00'}</div>
                                <div className="font-medium">Calculated minimum:</div>
                                <div className="font-medium">${calculateCreditCardMinPayment(debt.balance, debt.apr).toFixed(2)}</div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-xl text-center text-navy-blue">
              No debts added yet. Add your first debt to get started.
            </div>
          )}
        </div>
      )}

      {state.debts.length > 0 && !editingDebt && (
        <div className="mt-lg py-md px-lg bg-navy-blue rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-sm md:space-y-0 md:space-x-xl">
              <div className="text-center md:text-left">
                <p className="text-small text-white mb-xs">Total Debt</p>
                <p className="text-h4 font-bold text-white mb-0">${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-small text-white mb-xs">Total Minimum Monthly Payment</p>
                <p className="text-h4 font-bold text-white mb-0">${totalMinPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 