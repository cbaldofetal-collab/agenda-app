import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string, duration = 3000) => {
        const id = Math.random().toString(36).substring(7);
        const toast: Toast = { id, type, message, duration };

        setToasts((prev) => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({
    toasts,
    removeToast,
}) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
    const getToastStyles = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-secondary text-white border-secondary';
            case 'error':
                return 'bg-danger text-white border-danger';
            case 'warning':
                return 'bg-accent text-white border-accent';
            case 'info':
            default:
                return 'bg-primary text-white border-primary';
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
            default:
                return 'ℹ';
        }
    };

    return (
        <div
            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4
                ${getToastStyles()}
                animate-slide-in-right
                min-w-[300px] max-w-[500px]
            `}
        >
            <span className="text-xl font-bold">{getIcon()}</span>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={onClose}
                className="text-white hover:opacity-75 transition-opacity"
                aria-label="Fechar"
            >
                ✕
            </button>
        </div>
    );
};
