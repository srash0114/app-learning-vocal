'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ToastContextType {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const show = (msg: string) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 2200);
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '28px',
          left: '50%',
          transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(80px)',
          background: 'var(--surface2)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          padding: '12px 24px',
          borderRadius: '100px',
          fontSize: '14px',
          zIndex: 999,
          transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
