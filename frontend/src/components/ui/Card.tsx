import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  glass = false,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const classes = `
    card
    ${hover ? 'card-hover' : ''}
    ${glass ? 'glass' : ''}
    ${paddingClasses[padding]}
    ${className}
  `.trim();

  return (
    <div className={classes}>
      {children}
    </div>
  );
};