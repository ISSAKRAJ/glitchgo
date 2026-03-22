import React from 'react';
import { motion } from 'framer-motion';

const Card = React.forwardRef(({ className = '', children, hover = true, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
      className={`glass border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)] relative group overflow-hidden ${className}`}
      {...props}
    >
      {/* Subtle top gradient line that reveals on hover */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Subtle radial glow appearing behind content on hover */}
      <div className="absolute -inset-24 bg-gradient-to-tr from-brand-blue/5 to-brand-orange/5 opacity-0 group-hover:opacity-100 rounded-full blur-3xl transition-opacity duration-700 -z-10 pointer-events-none transform group-hover:scale-150"></div>
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
});

Card.displayName = 'Card';

export default Card;
