import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { Appointment } from '../../types';

interface AppointmentState {
    appointments: Appointment[];
    loading: boolean;
    toastCallback?: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;

    // Actions
    loadAppointments: () => Promise<void>;
    addAppointment: (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
    deleteAppointment: (id: string) => Promise<void>;
    setToastCallback: (callback: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void) => void;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
    appointments: [],
    loading: false,
    toastCallback: undefined,

    setToastCallback: (callback) => set({ toastCallback: callback }),

    loadAppointments: async () => {
        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*, locations(*)')
                .order('start_time', { ascending: true });

            if (error) throw error;

            set({ appointments: data || [], loading: false });
        } catch (error) {
            console.error('Error loading appointments:', error);
            set({ loading: false });
        }
    },

    addAppointment: async (appointment) => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .insert(appointment)
                .select()
                .single();

            if (error) throw error;

            set((state) => ({
                appointments: [...state.appointments, data].sort(
                    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
                ),
            }));

            get().toastCallback?.('success', 'Compromisso criado com sucesso!');
        } catch (error) {
            get().toastCallback?.('error', 'Erro ao criar compromisso');
            throw error;
        }
    },

    updateAppointment: async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            set((state) => ({
                appointments: state.appointments.map((apt) =>
                    apt.id === id ? data : apt
                ),
            }));

            get().toastCallback?.('info', 'Compromisso atualizado!');
        } catch (error) {
            get().toastCallback?.('error', 'Erro ao atualizar compromisso');
            throw error;
        }
    },

    deleteAppointment: async (id) => {
        try {
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', id);

            if (error) throw error;

            set((state) => ({
                appointments: state.appointments.filter((apt) => apt.id !== id),
            }));

            get().toastCallback?.('warning', 'Compromisso removido');
        } catch (error) {
            get().toastCallback?.('error', 'Erro ao remover compromisso');
            throw error;
        }
    },
}));
