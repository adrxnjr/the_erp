import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  disabled?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  icon,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  align = 'right',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-4 py-2 bg-white/90 backdrop-blur-md border border-black/[0.08] rounded-2xl text-xs font-semibold text-[#1D1D1F] shadow-xs hover:border-[#0071E3]/40 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/25 transition-all flex items-center justify-between gap-3 min-w-[190px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2 truncate">
          {selectedOption?.icon || icon}
          <div className="text-left truncate">
            <span className="truncate block font-bold text-slate-800">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.subLabel && (
              <span className="text-[10px] text-slate-400 font-medium block truncate -mt-0.5">
                {selectedOption.subLabel}
              </span>
            )}
          </div>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#0071E3]' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute ${
            align === 'left' ? 'left-0' : 'right-0'
          } mt-2 z-50 min-w-[240px] max-h-[340px] overflow-y-auto bg-white/95 backdrop-blur-2xl border border-black/[0.08] rounded-2xl shadow-xl shadow-slate-900/10 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#0071E3] to-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  {option.icon && (
                    <span
                      className={`shrink-0 ${
                        isSelected ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {option.icon}
                    </span>
                  )}
                  <div className="truncate text-left">
                    <div className="truncate font-bold">{option.label}</div>
                    {option.subLabel && (
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-white/80' : 'text-slate-400'
                        }`}
                      >
                        {option.subLabel}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                  {option.badge && (
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {option.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

