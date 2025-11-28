import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { User, Profile } from '../../types';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    isAuthenticated: boolean;

    // Actions
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
    loadProfile: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    loading: true,
    isAuthenticated: false,

    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        if (data.user) {
            await get().loadProfile();
        }
    },

    signUp: async (email: string, password: string, name: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
            },
        });

        if (error) throw error;

        if (data.user) {
            // Create profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    user_id: data.user.id,
                    timezone: 'America/Sao_Paulo',
                    language: 'pt-BR',
                });

            if (profileError) throw profileError;

            await get().loadProfile();
        }
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        set({
            user: null,
            profile: null,
            isAuthenticated: false,
        });
    },

    loadProfile: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                set({ loading: false, isAuthenticated: false });
                return;
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            set({
                user: user as any,
                profile: profile || null,
                loading: false,
                isAuthenticated: true,
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            set({ loading: false });
        }
    },

    updateProfile: async (updates: Partial<Profile>) => {
        const { user, profile } = get();
        if (!user) throw new Error('Not authenticated');

        // Se o perfil não existe, criar um novo
        if (!profile) {
            const { data, error } = await supabase
                .from('profiles')
                .insert({
                    user_id: user.id,
                    timezone: updates.timezone || 'America/Sao_Paulo',
                    language: updates.language || 'pt-BR',
                    phone: updates.phone,
                })
                .select()
                .single();

            if (error) throw error;
            set({ profile: data });
            return;
        }

        // Atualizar perfil existente
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;

        set({ profile: data });
    },
}));

// Initialize auth state
supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
        useAuthStore.getState().loadProfile();
    } else {
        useAuthStore.setState({ loading: false });
    }
});

// Listen to auth changes
supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
    if (session) {
        useAuthStore.getState().loadProfile();
    } else {
        useAuthStore.setState({
            user: null,
            profile: null,
            isAuthenticated: false,
        });
    }
});
