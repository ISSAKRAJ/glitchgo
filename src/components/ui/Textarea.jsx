import React from 'react';

const Textarea = React.forwardRef(({ className = '', error, ...props }, ref) => {
  return (
    <div className="w-full">
      <textarea
        ref={ref}
        className={`w-full bg-dark-surface border ${error ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-brand-blue'} rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${error ? 'focus:ring-red-500' : 'focus:ring-brand-blue'} transition-colors resize-y min-h-[120px] ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
