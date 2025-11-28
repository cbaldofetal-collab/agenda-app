import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAppointmentStore } from '../../app/store/appointmentStore';
import { useAuthStore } from '../../app/store/authStore';
import { useToast } from '../ui/Toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface NotificationContextType {
    // Pode ser expandido no futuro
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuthStore();
    const { loadAppointments, setToastCallback } = useAppointmentStore();
    const { showToast } = useToast();

    // Conectar toast ao store
    useEffect(() => {
        setToastCallback(showToast);
    }, [showToast, setToastCallback]);

    useEffect(() => {
        if (!user) return;

        let channel: RealtimeChannel;

        const setupRealtimeSubscription = async () => {
            // Inscrever-se em mudanças na tabela appointments
            channel = supabase
                .channel('appointments-changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*', // INSERT, UPDATE, DELETE
                        schema: 'public',
                        table: 'appointments',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        console.log('Realtime event:', payload);

                        switch (payload.eventType) {
                            case 'INSERT':
                                showToast('success', 'Novo compromisso adicionado!');
                                loadAppointments();
                                break;
                            case 'UPDATE':
                                showToast('info', 'Compromisso atualizado!');
                                loadAppointments();
                                break;
                            case 'DELETE':
                                showToast('warning', 'Compromisso removido!');
                                loadAppointments();
                                break;
                        }
                    }
                )
                .subscribe((status) => {
                    console.log('Realtime subscription status:', status);
                });
        };

        setupRealtimeSubscription();

        // Cleanup
        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [user, loadAppointments, showToast]);

    return (
        <NotificationContext.Provider value={{}}>
            {children}
        </NotificationContext.Provider>
    );
};
