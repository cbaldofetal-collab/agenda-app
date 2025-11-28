import React, { type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    children,
    className = '',
    ...props
}) => {
    const baseClasses = 'btn inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active',
        secondary: 'bg-transparent text-primary border-2 border-primary hover:bg-primary/10',
        ghost: 'bg-transparent text-neutral-medium hover:bg-neutral-light',
        danger: 'bg-danger text-white hover:bg-danger-hover active:bg-danger-active',
    };

    const sizeClasses = {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-12 px-8 text-lg',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} rounded-md`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
};
