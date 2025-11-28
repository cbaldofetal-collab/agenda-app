-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    language VARCHAR(10) DEFAULT 'pt-BR',
    notification_settings JSONB DEFAULT '{"email": true, "push": true, "voice": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    relationship VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_name ON contacts(name);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Locations table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    type VARCHAR(50) DEFAULT 'other',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_locations_user_id ON locations(user_id);

-- Recurring patterns table
CREATE TABLE recurring_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    frequency VARCHAR(20) NOT NULL,
    interval INTEGER DEFAULT 1,
    days_of_week JSONB DEFAULT '[]',
    day_of_month INTEGER,
    month_of_year VARCHAR(20),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    occurrence_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    recurring_pattern_id UUID REFERENCES recurring_patterns(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    priority VARCHAR(20) DEFAULT 'medium',
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Reminders table
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    method VARCHAR(20) DEFAULT 'notification',
    status VARCHAR(20) DEFAULT 'pending',
    message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_reminder_time ON reminders(reminder_time);
CREATE INDEX idx_reminders_status ON reminders(status);

-- Voice logs table
CREATE TABLE voice_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    audio_transcript TEXT NOT NULL,
    nlp_analysis JSONB DEFAULT '{}',
    intent VARCHAR(100),
    entities JSONB DEFAULT '[]',
    confidence_score DECIMAL(3, 2),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_logs_user_id ON voice_logs(user_id);
CREATE INDEX idx_voice_logs_created_at ON voice_logs(created_at);

-- Telegram sessions table
CREATE TABLE telegram_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    telegram_chat_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    session_data JSONB DEFAULT '{}',
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_telegram_sessions_user_id ON telegram_sessions(user_id);
CREATE INDEX idx_telegram_sessions_chat_id ON telegram_sessions(telegram_chat_id);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    default_reminder_minutes INTEGER DEFAULT 30,
    default_view VARCHAR(20) DEFAULT 'week',
    working_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00", "days": [1,2,3,4,5]}',
    blocked_slots JSONB DEFAULT '[]',
    auto_confirm BOOLEAN DEFAULT FALSE,
    voice_speed VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Notification queue table
CREATE TABLE notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_queue_scheduled_for ON notification_queue(scheduled_for);
CREATE INDEX idx_notification_queue_status ON notification_queue(status);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON users FOR ALL USING (auth.uid() = id);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR ALL USING (auth.uid() = user_id);

-- Contacts policies
CREATE POLICY "Users can manage own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Users can manage own categories" ON categories FOR ALL USING (auth.uid() = user_id);

-- Locations policies
CREATE POLICY "Users can manage own locations" ON locations FOR ALL USING (auth.uid() = user_id);

-- Appointments policies
CREATE POLICY "Users can manage own appointments" ON appointments FOR ALL USING (auth.uid() = user_id);

-- Reminders policies
CREATE POLICY "Users can manage own reminders" ON reminders FOR ALL USING (auth.uid() = user_id);

-- Voice logs policies
CREATE POLICY "Users can view own voice logs" ON voice_logs FOR ALL USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
