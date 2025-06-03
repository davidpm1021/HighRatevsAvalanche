import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { state } = useApp();
  const [logoError, setLogoError] = useState(false);
  
  useEffect(() => {
    // Debug: Check if the logo file is accessible
    console.log('Checking logo at path: /ngpf-logo.png');
  }, []);
  
  return (
    <header className="bg-white shadow-sm" style={{ borderBottom: '1px solid #e0e0e0' }}>
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* NGPF Logo Section */}
          <div className="flex items-center">
            {/* Logo image */}
            {!logoError ? (
              <img 
                src={`${import.meta.env.BASE_URL}ngpf-logo.png`}
                alt="NGPF Logo" 
                className="h-20 w-auto"
                onError={(e) => {
                  console.log('Logo failed to load:', e);
                  setLogoError(true);
                }}
                onLoad={() => console.log('Logo loaded successfully')}
              />
            ) : (
              /* Fallback text logo */
              <div 
                className="font-bold text-white px-6 py-3 rounded-md text-2xl"
                style={{ backgroundColor: '#2196f3' }}
              >
                ngpf
              </div>
            )}
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-semibold" style={{ color: '#333' }}>
            Debt Repayment Calculator
          </h1>
        </div>
      </div>
    </header>
  );
} 