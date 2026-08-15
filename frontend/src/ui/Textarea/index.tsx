import React, { forwardRef } from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  autoGrow?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = false,
      autoGrow = false,
      maxLength,
      required,
      className = '',
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const hintId = `${textareaId}-hint`;
    const errorId = `${textareaId}-error`;
    
    const ariaDescribedBy = [
      error ? errorId : undefined,
      hint ? hintId : undefined
    ].filter(Boolean).join(' ') || undefined;

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoGrow) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      if (onChange) onChange(e);
    };

    return (
      <div className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ''} ${className}`}>
        {label && (
          <div className={styles.labelWrapper}>
            <label htmlFor={textareaId} className={styles.label}>
              {label}
              {required && <span className={styles.asterisk} aria-hidden="true">*</span>}
            </label>
            {maxLength && (
              <span className={styles.characterCount}>
                {String(value || '').length}/{maxLength}
              </span>
            )}
          </div>
        )}
        
        <div className={styles.textareaContainer}>
          <textarea
            ref={ref}
            id={textareaId}
            className={`${styles.textarea} ${error ? styles.hasError : ''} ${autoGrow ? styles.autoGrow : ''}`}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy}
            required={required}
            maxLength={maxLength}
            value={value}
            onChange={handleInput}
            {...props}
          />
        </div>

        {error && (
          <p id={errorId} className={styles.errorText} role="alert">
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p id={hintId} className={styles.hintText}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
