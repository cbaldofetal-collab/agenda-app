import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    Clock,
    Settings,
    LogOut,
    Menu,
    X,
    User
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const MainLayout: React.FC = () => {
    const { isAuthenticated, loading, signOut, user } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-light">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Calendário', href: '/calendar', icon: CalendarIcon },
        { name: 'Compromissos', href: '/appointments', icon: Clock },
        { name: 'Configurações', href: '/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-neutral-light flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-border">
                        <CalendarIcon className="w-8 h-8 text-primary mr-3" />
                        <span className="text-xl font-bold text-neutral-dark">Agenda App</span>
                        <button
                            className="ml-auto lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="w-6 h-6 text-neutral-medium" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b border-border bg-neutral-light/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {user?.name?.charAt(0) || <User className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-dark truncate">
                                    {user?.name || 'Usuário'}
                                </p>
                                <p className="text-xs text-neutral-medium truncate">
                                    {useAuthStore.getState().user?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors
                    ${isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-neutral-medium hover:bg-neutral-light hover:text-neutral-dark'}
                  `}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : 'text-neutral-medium'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-border">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-danger hover:bg-danger/10 hover:text-danger"
                            onClick={() => signOut()}
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Sair
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white border-b border-border flex items-center px-4 justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-neutral-medium hover:text-neutral-dark"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="text-lg font-bold text-neutral-dark">Agenda App</span>
                    <div className="w-8" /> {/* Spacer for centering */}
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
