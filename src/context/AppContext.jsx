import React from 'react';
import { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  debts: [],
  extraMonthlyPayment: 0,
  oneTimePayments: [],
  selectedStrategy: null,
  currentStep: 1,
  results: null
};

// Action types
const ACTIONS = {
  ADD_DEBT: 'ADD_DEBT',
  UPDATE_DEBT: 'UPDATE_DEBT',
  DELETE_DEBT: 'DELETE_DEBT',
  SET_EXTRA_PAYMENT: 'SET_EXTRA_PAYMENT',
  ADD_ONE_TIME_PAYMENT: 'ADD_ONE_TIME_PAYMENT',
  SET_STRATEGY: 'SET_STRATEGY',
  SET_STEP: 'SET_STEP',
  SET_RESULTS: 'SET_RESULTS'
};

// Reducer function
function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_DEBT:
      return {
        ...state,
        debts: [...state.debts, { ...action.payload, id: Date.now() }]
      };
    
    case ACTIONS.UPDATE_DEBT:
      return {
        ...state,
        debts: state.debts.map(debt => 
          debt.id === action.payload.id ? action.payload : debt
        )
      };
    
    case ACTIONS.DELETE_DEBT:
      return {
        ...state,
        debts: state.debts.filter(debt => debt.id !== action.payload)
      };
    
    case ACTIONS.SET_EXTRA_PAYMENT:
      return {
        ...state,
        extraMonthlyPayment: action.payload
      };
    
    case ACTIONS.ADD_ONE_TIME_PAYMENT:
      return {
        ...state,
        oneTimePayments: [...state.oneTimePayments, action.payload]
      };
    
    case ACTIONS.SET_STRATEGY:
      return {
        ...state,
        selectedStrategy: action.payload
      };
    
    case ACTIONS.SET_STEP:
      return {
        ...state,
        currentStep: action.payload
      };
    
    case ACTIONS.SET_RESULTS:
      return {
        ...state,
        results: action.payload
      };
    
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Context provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 