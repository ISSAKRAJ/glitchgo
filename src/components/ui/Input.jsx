import React from 'react';

const Input = React.forwardRef(({ className = '', error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        ref={ref}
        className={`w-full bg-dark-surface border ${error ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-brand-blue'} rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${error ? 'focus:ring-red-500' : 'focus:ring-brand-blue'} transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
