import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-neutral-dark mb-2">
                        {label}
                        {props.required && <span className="text-danger ml-1">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`input w-full ${error ? 'border-danger focus:border-danger focus:ring-danger/10' : ''} ${className}`}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-danger">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-neutral-medium">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
