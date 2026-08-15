import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  padding = 'md',
  hoverable = false,
  clickable = false,
  header,
  footer,
  children,
  className = '',
  onClick,
}) => {
  const Component = clickable ? 'button' : 'div';
  
  return (
    <Component 
      className={`
        ${styles.card} 
        ${hoverable || clickable ? styles.hoverable : ''} 
        ${clickable ? styles.clickable : ''} 
        ${className}
      `}
      onClick={onClick}
    >
      {header && <div className={`${styles.header} ${styles[`padding-${padding}`]}`}>{header}</div>}
      <div className={`${styles.body} ${styles[`padding-${padding}`]}`}>{children}</div>
      {footer && <div className={`${styles.footer} ${styles[`padding-${padding}`]}`}>{footer}</div>}
    </Component>
  );
};
