import React from 'react';
import styles from './Spinner.module.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'var(--color-primary)' }) => {
  return (
    <div 
      className={`${styles.spinner} ${styles[`size-${size}`]}`} 
      style={{ borderBlockStartColor: color, borderInlineEndColor: color }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
