import React from 'react';
import { createPortal } from 'react-dom';
import { useToast, ToastMessage } from './useToast';
import styles from './Toast.module.css';

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const isError = toast.type === 'error';

  return (
    <div 
      className={`${styles.toast} ${styles[`type-${toast.type || 'info'}`]}`}
      role={isError ? 'alert' : 'status'}
      aria-live="polite"
    >
      <div className={styles.content}>
        <div className={styles.title}>{toast.title}</div>
        {toast.description && <div className={styles.description}>{toast.description}</div>}
      </div>
      <button 
        className={styles.closeBtn} 
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss toast"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

export const ToastProvider: React.FC = () => {
  const { toasts, dismiss } = useToast();

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>,
    document.body
  );
};
