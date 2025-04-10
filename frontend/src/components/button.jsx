import React from 'react';
import classNames from 'classnames';

const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    default: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
    outline: 'border border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
  };

  return (
    <button
      className={classNames(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
