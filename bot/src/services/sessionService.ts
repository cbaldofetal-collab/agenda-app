export interface SessionData {
    state: 'IDLE' | 'AWAITING_APPOINTMENT_DETAILS';
    tempData?: any;
}

class SessionService {
    private sessions: Map<number, SessionData>;

    constructor() {
        this.sessions = new Map();
    }

    getSession(userId: number): SessionData {
        if (!this.sessions.has(userId)) {
            this.sessions.set(userId, { state: 'IDLE' });
        }
        return this.sessions.get(userId)!;
    }

    setSession(userId: number, data: SessionData) {
        this.sessions.set(userId, data);
    }

    clearSession(userId: number) {
        this.sessions.set(userId, { state: 'IDLE' });
    }
}

export const sessionService = new SessionService();
