export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
    updated_at: string;
    last_login?: string;
    is_active: boolean;
}

export interface Profile {
    id: string;
    user_id: string;
    phone?: string;
    timezone: string;
    language: string;
    notification_settings: NotificationSettings;
    created_at: string;
    updated_at: string;
}

export interface NotificationSettings {
    email: boolean;
    push: boolean;
    voice: boolean;
}

export interface Location {
    id: string;
    user_id: string;
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    type?: string;
    created_at?: string;
}

export interface Appointment {
    id: string;
    user_id: string;
    contact_id?: string;
    category_id?: string;
    location_id?: string;
    recurring_pattern_id?: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    is_recurring: boolean;
    created_at: string;
    updated_at: string;
    locations?: Location; // Join com a tabela locations
}

export interface Contact {
    id: string;
    user_id: string;
    name: string;
    email?: string;
    phone?: string;
    relationship?: string;
    custom_fields?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    user_id: string;
    name: string;
    color: string;
    icon?: string;
    sort_order: number;
    created_at: string;
}

export interface Reminder {
    id: string;
    user_id: string;
    appointment_id: string;
    reminder_time: string;
    method: 'notification' | 'email' | 'telegram';
    status: 'pending' | 'sent' | 'failed';
    message?: string;
    sent_at?: string;
    created_at: string;
}
