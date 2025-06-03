import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import EditDebtForm from './EditDebtForm';

export default function DebtList() {
  const { state, dispatch } = useApp();
  const [editingDebt, setEditingDebt] = useState(null);

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_DEBT', payload: id });
  };

  const handleEdit = (debt) => {
    setEditingDebt(debt);
  };

  const handleCancelEdit = () => {
    setEditingDebt(null);
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
                  <tr key={debt.id} className="hover:bg-soft-blue">
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
                      ${debt.minPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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