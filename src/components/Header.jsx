import React from 'react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { state } = useApp();
  
  return (
    <header className="bg-white shadow-sm" style={{ borderBottom: '1px solid #e0e0e0' }}>
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* NGPF Logo Section */}
          <div className="flex items-center">
            {/* Logo image - put your logo file in public/ngpf-logo.png */}
            <img 
              src="/ngpf-logo.png" 
              alt="NGPF Logo" 
              className="h-20 w-auto"
              onError={(e) => {
                // Fallback to text logo if image not found
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline-block';
              }}
            />
            {/* Fallback text logo */}
            <div 
              className="font-bold text-white px-6 py-3 rounded-md text-2xl"
              style={{ 
                backgroundColor: '#2196f3',
                display: 'none' // Hidden by default, shown if image fails
              }}
            >
              ngpf
            </div>
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