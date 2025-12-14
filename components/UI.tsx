import React from 'react';
import { GiftStatus } from '../types';

// --- Badge ---
export const StatusBadge: React.FC<{ status: GiftStatus }> = ({ status }) => {
  const styles = {
    [GiftStatus.WANT]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    [GiftStatus.RESERVED]: 'bg-amber-100 text-amber-800 border-amber-200',
    [GiftStatus.BOUGHT]: 'bg-emerald-100 text-emerald-800 border-emerald-200 decoration-slate-400',
  };

  const labels = {
    [GiftStatus.WANT]: 'Хочу',
    [GiftStatus.RESERVED]: 'В планах',
    [GiftStatus.BOUGHT]: 'Куплено',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-indigo-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <input
        className={`w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border ${error ? 'border-red-300' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

// --- Modal ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-slate-900/50 transition-opacity" onClick={onClose} />
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-semibold leading-6 text-slate-900 mb-4">{title}</h3>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Empty State ---
export const EmptyState: React.FC<{ title: string; description: string; action?: React.ReactNode }> = ({ title, description, action }) => (
  <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-200">
    <h3 className="mt-2 text-sm font-semibold text-slate-900">{title}</h3>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);