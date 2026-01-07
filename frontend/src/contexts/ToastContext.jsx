import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircleIcon, AlertCircleIcon, InfoIcon } from '../components/Icons';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null); // { type: 'success'|'error'|'info', message: string }
  const [timerId, setTimerId] = useState(null);

  const hide = useCallback(() => {
    setToast(null);
    if (timerId) {
      clearTimeout(timerId);
    }
  }, [timerId]);

  const show = useCallback((type, message, duration = 2500) => {
    if (timerId) clearTimeout(timerId);
    setToast({ type, message });
    const id = setTimeout(() => setToast(null), duration);
    setTimerId(id);
  }, [timerId]);

  const success = useCallback((message, duration) => show('success', message, duration), [show]);
  const error = useCallback((message, duration) => show('error', message, duration), [show]);
  const info = useCallback((message, duration) => show('info', message, duration), [show]);

  const value = useMemo(() => ({ show, success, error, info, hide }), [show, success, error, info, hide]);

  const variant = toast?.type || 'info';
  const styles = {
    base: 'px-4 py-2 rounded-xl shadow-lg border bg-white/95 backdrop-blur-md flex items-center gap-2 text-sm',
    success: 'border-emerald-200 text-emerald-800',
    error: 'border-rose-200 text-rose-800',
    info: 'border-amber-200 text-amber-800',
  };

  const renderIcon = () => {
    if (variant === 'success') return <CheckCircleIcon size={20} />;
    if (variant === 'error') return <AlertCircleIcon size={20} />;
    return <InfoIcon size={20} />;
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none" style={{ willChange: 'transform, opacity' }}>
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`${styles.base} ${styles[variant]}`}
              style={{ willChange: 'transform, opacity' }}
            >
              {renderIcon()}
              <span className="font-medium">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
