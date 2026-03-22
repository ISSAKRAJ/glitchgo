import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-brand-blue text-white shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.6)] hover:bg-blue-500 border border-blue-400/30',
  secondary: 'bg-dark-surface text-white border border-white/10 hover:border-white/20 hover:bg-white/5 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,255,255,0.05)]',
  outline: 'bg-transparent border border-brand-blue/50 text-brand-blue hover:text-white hover:border-brand-blue hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-brand-blue/10'
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg font-semibold'
};

const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading,
  ...props 
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center rounded-lg transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
