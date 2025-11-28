import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

export const AuthLayout: React.FC = () => {
    const { isAuthenticated, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-light">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
