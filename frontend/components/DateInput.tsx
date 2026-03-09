import React, { useState, useEffect } from 'react';

interface DateInputProps {
  value: string; // ISO string YYYY-MM-DD or empty
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, className, disabled }) => {
  const [displayValue, setDisplayValue] = useState('');

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  useEffect(() => {
    if (!value) {
      setDisplayValue('');
      return;
    }
    const parts = value.split('-');
    if (parts.length === 3) {
      setDisplayValue(`${parts[2]}/${parts[1]}/${parts[0]}`);
    } else {
      setDisplayValue(value); // fallback
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); // keep only digits
    
    // Auto-formatting DD/MM/YYYY
    if (input.length > 8) input = input.slice(0, 8);
    
    let formatted = input;
    if (input.length > 4) {
      formatted = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4)}`;
    } else if (input.length > 2) {
      formatted = `${input.slice(0, 2)}/${input.slice(2)}`;
    }
    
    setDisplayValue(formatted);

    // If fully entered, parse to ISO and trigger onChange
    if (input.length === 8) {
      const d = input.slice(0, 2);
      const m = input.slice(2, 4);
      const y = input.slice(4);
      
      const day = parseInt(d, 10);
      const month = parseInt(m, 10);
      const year = parseInt(y, 10);

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
        onChange(`${y}-${m}-${d}`);
      } else {
        onChange(''); // Invalid date
      }
    } else {
      onChange(''); // Not complete yet
    }
  };

  return (
    <input
      type="text"
      placeholder="dd/mm/yyyy"
      className={className}
      value={displayValue}
      onChange={handleChange}
      disabled={disabled}
      maxLength={10}
    />
  );
};

export default DateInput;
