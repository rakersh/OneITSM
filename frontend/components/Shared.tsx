import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm", className)}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral' }) => {
  const variants = {
    default: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    neutral: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant])}>
      {children}
    </span>
  );
};

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className, 
  disabled,
  isLoading
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; 
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-500",
    outline: "border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700 focus:ring-slate-500",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-500",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], className)}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export const AIResponseBox = ({ content, title = "Gemini Insights" }: { content: string; title?: string }) => {
  if (!content) return null;
  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg">
      <div className="flex items-center gap-2 mb-2 text-indigo-800 font-semibold">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {title}
      </div>
      <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
};

export const MultiSelect = ({ 
  label, 
  icon: Icon, 
  options, 
  selectedIds, 
  onSelect, 
  onRemove 
}: { 
  label: string, 
  icon: any, 
  options: { id: string, label: string }[], 
  selectedIds: string[], 
  onSelect: (id: string) => void, 
  onRemove: (id: string) => void 
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-500" /> {label}
      </label>
      
      <select 
        className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-3 text-sm focus:ring-2 focus:ring-blue-500"
        onChange={(e) => {
          if (e.target.value) {
            onSelect(e.target.value);
            e.target.value = ''; // Reset select
          }
        }}
        defaultValue=""
      >
        <option value="" disabled>Select to add...</option>
        {options.filter(opt => !selectedIds.includes(opt.id)).map(opt => (
          <option key={opt.id} value={opt.id}>{opt.label}</option>
        ))}
      </select>

      <div className="flex flex-wrap gap-2">
        {selectedIds.map(id => {
          const option = options.find(o => o.id === id);
          return (
            <span key={id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {option?.label || id}
              <button 
                type="button"
                onClick={() => onRemove(id)}
                className="ml-1.5 text-slate-400 hover:text-red-500 focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
        {selectedIds.length === 0 && (
          <span className="text-xs text-slate-400 italic">No items linked</span>
        )}
      </div>
    </div>
  );
};
