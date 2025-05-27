import React, { useState } from 'react';

export default function DemoNGPFForm() {
  const [formData, setFormData] = useState({
    loanAmount: '0',
    interestRate: '0',
    loanTerm: '0',
    monthlyExtra: '0',
    oneTimeExtra: '0'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCalculate = () => {
    console.log('Calculate clicked', formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="space-y-6">
        {/* Loan Amount */}
        <div className="form-group">
          <label htmlFor="loanAmount" className="form-label">
            Loan Amount ($)
          </label>
          <input
            type="number"
            id="loanAmount"
            placeholder="0"
            value={formData.loanAmount}
            onChange={(e) => handleInputChange('loanAmount', e.target.value)}
          />
        </div>

        {/* Annual Interest Rate */}
        <div className="form-group">
          <label htmlFor="interestRate" className="form-label">
            Annual Interest Rate (%):
          </label>
          <input
            type="number"
            id="interestRate"
            placeholder="0"
            step="0.01"
            value={formData.interestRate}
            onChange={(e) => handleInputChange('interestRate', e.target.value)}
          />
        </div>

        {/* Loan Term */}
        <div className="form-group">
          <label htmlFor="loanTerm" className="form-label">
            Loan Term (Years):
          </label>
          <input
            type="number"
            id="loanTerm"
            placeholder="0"
            value={formData.loanTerm}
            onChange={(e) => handleInputChange('loanTerm', e.target.value)}
          />
        </div>

        {/* Extra Payments Section */}
        <div className="extra-payments-section">
          <h3 className="extra-payments-title">Extra Payments</h3>
          
          <div className="space-y-6">
            <div className="form-group">
              <label htmlFor="monthlyExtra" className="form-label">
                Monthly Extra Payment ($):
              </label>
              <input
                type="number"
                id="monthlyExtra"
                placeholder="0"
                value={formData.monthlyExtra}
                onChange={(e) => handleInputChange('monthlyExtra', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="oneTimeExtra" className="form-label">
                One-Time Extra Payment ($):
              </label>
              <input
                type="number"
                id="oneTimeExtra"
                placeholder="0"
                value={formData.oneTimeExtra}
                onChange={(e) => handleInputChange('oneTimeExtra', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <button 
          onClick={handleCalculate}
          className="calculate-button"
        >
          Calculate
        </button>
      </div>
    </div>
  );
} 