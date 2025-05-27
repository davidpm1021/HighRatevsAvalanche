# Debt Repayment Options - Project Memory

## Purpose
A web-based tool for comparing three debt repayment strategies:
- Minimum Payments
- Avalanche (highest interest first)
- Snowball (smallest balance first)

## Tech Stack
- React (Vite)
- Tailwind CSS
- React Context API
- React Hook Form
- React-Chartjs-2 (for future visualizations)

## App Flow
1. User enters debts (name, APR, balance, min)
2. User adds extra monthly payment
3. App calculates 3 strategies
4. User selects and views detailed plan

## State Model
```js
{
  debts: [ { id, name, apr, balance, minPayment } ],
  extraMonthlyPayment: number,
  oneTimePayments: [],
  selectedStrategy: string,
  currentStep: number,
  results: {
    minimum: { totalPaid, totalInterest, months, monthlyBreakdown },
    avalanche: { totalPaid, totalInterest, months, monthlyBreakdown },
    snowball: { totalPaid, totalInterest, months, monthlyBreakdown }
  }
}
```

## Component Overview

### Form Components
- **DebtForm**: Form for adding new debts
- **DebtList**: Displays and manages the list of debts
- **PaymentSetup**: Input for adding extra monthly payments

### Strategy Components
- **StrategyCards**: Summary cards for each strategy
- **PlanDetails**: Detailed month-by-month breakdown

### Navigation
- **Header**: App title and step indicator
- **Navigation**: Controls for moving between steps

### App Structure
- **App**: Main container component
- **AppContent**: Handles step logic and rendering

## Core Logic
Utilities in /utils/repaymentStrategies.js:

- **calculateMinimum()**: Calculates minimum payment strategy
- **calculateAvalanche()**: Calculates highest interest first strategy
- **calculateSnowball()**: Calculates lowest balance first strategy

Each returns:
- Total paid
- Total interest
- Time to payoff
- Monthly breakdown

## Future Enhancements
- Visualizations/charts for comparison
- Ability to save/export plans
- Comparison charts showing interest saved
- Mobile optimization
- Dark mode support

## Project Status
🟡 Project Setup Phase

## Current Phase Details
### Setup Tasks
- [x] Initialize project with Vite + React
- [x] Install and configure Tailwind CSS
- [x] Install required dependencies
- [x] Set up project structure
- [x] Create initial components

### Dependencies Installed
- ✅ React (via Vite)
- ✅ Tailwind CSS
- ✅ React Hook Form
- ✅ Chart.js
- ✅ React Chart.js 2
- ✅ Heroicons

## Project Structure
```
src/
  components/          # UI components
    Header.jsx        # App header with navigation
    DebtForm.jsx      # Form for adding/editing debts
    DebtList.jsx      # List of all debts
    PaymentSetup.jsx  # Extra payment configuration
    StrategyCards.jsx # Strategy comparison cards
    PlanSummary.jsx   # Overall plan summary
    PlanDetails.jsx   # Detailed monthly breakdown
    Navigation.jsx    # Step navigation controls
  context/            # State management
    AppContext.jsx    # Global state management
  utils/              # Business logic
    calculateMinimum.js
    calculateAvalanche.js
    calculateSnowball.js
  App.jsx            # Main application component
  main.jsx           # Application entry point
  index.css          # Global styles
```

## Implementation Phases
1. 🟡 Project Setup & Structure
   - ✅ Create project
   - ✅ Install dependencies
   - ✅ Set up folder structure
   - ✅ Create initial components

2. ⚪ Core Functionality
   - ⏳ Implement debt entry
   - Create payment setup
   - Build calculation utilities

3. ⚪ User Interface
   - Design and implement components
   - Add navigation
   - Style with Tailwind

4. ⚪ Strategy Implementation
   - Minimum payment calculations
   - Avalanche method
   - Snowball method

5. ⚪ Results & Visualization
   - Strategy comparison
   - Detailed breakdowns
   - Charts and graphs

6. ⚪ Testing & Deployment
   - Test all features
   - Deploy to Netlify/Vercel
   - Final review

## Recent Updates
- ✅ Created project with Vite + React
- ✅ Installed all required dependencies
- ✅ Set up Tailwind CSS configuration
- ✅ Created project folder structure
- ✅ Implemented basic components:
  - Header
  - DebtForm
  - DebtList
- ✅ Set up AppContext for state management

## Next Steps
1. Implement PaymentSetup component
2. Create calculation utilities
3. Build StrategyCards component
4. Add navigation between steps

## Notes
- Basic structure and components are in place
- State management is set up with Context API
- Form handling is implemented with React Hook Form
- Need to implement calculation logic next

## Questions & Decisions
- [x] Choose Chart.js for visualizations (installed)
- [ ] Decide on deployment platform (Netlify vs Vercel)
- [ ] Determine color scheme and design system

## Resources
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://reactjs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Chart.js Documentation](https://www.chartjs.org/) 