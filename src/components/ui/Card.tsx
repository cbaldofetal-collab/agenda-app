import React, { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    padding?: 'sm' | 'md' | 'lg';
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    padding = 'md',
    hover = true,
    className = '',
    ...props
}) => {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={`card ${paddingClasses[padding]} ${hover ? 'hover:shadow-card-hover' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
