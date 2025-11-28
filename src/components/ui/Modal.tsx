import React, { useEffect } from 'react';
import { X } from 'lucide-react';


interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-2xl',
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div
                className={`modal-content ${sizeClasses[size]} animate-scale-in`}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-h3">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md hover:bg-neutral-light transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};
