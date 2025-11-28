import { supabase } from '../supabase';
import { addDays, setHours, setMinutes, startOfHour, subHours } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

export class AppointmentService {
    private timeZone = 'America/Sao_Paulo';

    async createAppointment(telegramId: number, title: string, fullText: string) {
        // 1. Identificar usuário
        const { data: sessionData } = await supabase
            .from('telegram_sessions')
            .select('user_id')
            .eq('telegram_chat_id', telegramId)
            .single();

        if (!sessionData) {
            throw new Error('Usuário não vinculado. Use /login para vincular sua conta.');
        }

        // 2. Parse da data
        const date = this.parseDate(fullText);

        if (!date) {
            throw new Error('Não entendi a data. Tente algo como "amanhã às 10:00" ou "25/12 às 14:00".');
        }

        // 3. Extrair e processar local
        const locationId = await this.processLocation(sessionData.user_id, fullText);

        // 4. Criar agendamento
        const { data: appointment, error } = await supabase
            .from('appointments')
            .insert({
                user_id: sessionData.user_id,
                title: title, // Poderíamos limpar o título removendo data/local, mas ok manter full por enquanto
                start_time: date.toISOString(),
                end_time: addDays(date, 0).toISOString(),
                status: 'scheduled',
                priority: 'medium',
                is_recurring: false,
                location_id: locationId // Vincula o local se encontrado
            })
            .select(`
    *,
    locations(
        name
    )
        `)
            .single();

        if (error) throw error;

        // 5. Criar lembrete automático (1 hora antes)
        const reminderTime = subHours(date, 1);
        // Só cria se o lembrete for no futuro
        if (reminderTime > new Date()) {
            await supabase.from('reminders').insert({
                user_id: sessionData.user_id,
                appointment_id: appointment.id,
                reminder_time: reminderTime.toISOString(),
                method: 'telegram',
                status: 'pending',
                message: `Lembrete: ${title} começa em 1 hora.`
            });
        }

        return appointment;
    }

    private async processLocation(userId: string, text: string): Promise<string | null> {
        const lowerText = text.toLowerCase();
        let locationName: string | null = null;

        // Lista de locais conhecidos (hardcoded por enquanto, poderia vir do banco)
        const knownLocations = [
            'são caetano', 'sao caetano',
            'guarulhos',
            'anália franco', 'analia franco',
            'tatuapé', 'tatuape',
            'são paulo', 'sao paulo'
        ];

        // 1. Tentar encontrar locais conhecidos
        for (const loc of knownLocations) {
            if (lowerText.includes(loc)) {
                // Normalizar nome (ex: sao caetano -> São Caetano)
                locationName = this.normalizeLocationName(loc);
                break;
            }
        }

        // 2. Tentar extrair com preposição "em/no/na" se não achou conhecido
        if (!locationName) {
            const prepositionRegex = /(?:em|no|na)\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)/;
            const match = text.match(prepositionRegex);
            if (match) {
                locationName = match[1];
            }
        }

        if (!locationName) return null;

        // 3. Buscar ou criar local no banco
        // Primeiro, verifica se já existe para este usuário
        const { data: existingLocation } = await supabase
            .from('locations')
            .select('id')
            .eq('user_id', userId)
            .ilike('name', locationName)
            .single();

        if (existingLocation) {
            return existingLocation.id;
        }

        // Se não existe, cria
        const { data: newLocation, error } = await supabase
            .from('locations')
            .insert({
                user_id: userId,
                name: locationName,
                type: 'other'
            })
            .select('id')
            .single();

        if (error) {
            console.error('Erro ao criar local:', error);
            return null;
        }

        return newLocation.id;
    }

    private normalizeLocationName(raw: string): string {
        const map: { [key: string]: string } = {
            'sao caetano': 'São Caetano',
            'são caetano': 'São Caetano',
            'guarulhos': 'Guarulhos',
            'analia franco': 'Anália Franco',
            'anália franco': 'Anália Franco',
            'tatuape': 'Tatuapé',
            'tatuapé': 'Tatuapé',
            'sao paulo': 'São Paulo',
            'são paulo': 'São Paulo'
        };
        return map[raw] || raw.charAt(0).toUpperCase() + raw.slice(1);
    }

    private parseDate(text: string): Date | null {
        // Trabalhar diretamente com horário local (Brasília)
        const now = new Date();
        const lowerText = text.toLowerCase();

        let targetDate = new Date(now);
        let hasDate = false;

        // Mapa de meses em português
        const monthMap: { [key: string]: number } = {
            'janeiro': 0, 'fevereiro': 1, 'março': 2, 'marco': 2,
            'abril': 3, 'maio': 4, 'junho': 5,
            'julho': 6, 'agosto': 7, 'setembro': 8,
            'outubro': 9, 'novembro': 10, 'dezembro': 11
        };

        // 1. Detectar datas absolutas (aceita 'de' ou 'do', ignora 'h' após o dia)
        const absoluteDateRegex = /(?:dia\s+)?(\d{1,2})h?\s*[,]?\s*d[eo]\s+(\w+)/i;
        const absoluteMatch = lowerText.match(absoluteDateRegex);

        if (absoluteMatch) {
            const day = parseInt(absoluteMatch[1]);
            const monthName = absoluteMatch[2].toLowerCase();

            // Tentar como nome de mês primeiro
            let month = monthMap[monthName];

            // Se não for nome, tentar como número (ex: "15 de 12")
            if (month === undefined) {
                const monthNum = parseInt(monthName);
                if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
                    month = monthNum - 1; // 0-indexed
                }
            }

            if (month !== undefined && day >= 1 && day <= 31) {
                const year = now.getFullYear();
                targetDate = new Date(year, month, day);

                if (targetDate < now) {
                    targetDate = new Date(year + 1, month, day);
                }
                hasDate = true;
            }
        }

        // 2. Detectar formato DD/MM (25/12, 15/01)
        if (!hasDate) {
            const slashDateRegex = /(\d{1,2})\/(\d{1,2})/;
            const slashMatch = lowerText.match(slashDateRegex);

            if (slashMatch) {
                const day = parseInt(slashMatch[1]);
                const month = parseInt(slashMatch[2]) - 1; // Mês é 0-indexed

                if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
                    const year = now.getFullYear();
                    targetDate = new Date(year, month, day);

                    if (targetDate < now) {
                        targetDate = new Date(year + 1, month, day);
                    }
                    hasDate = true;
                }
            }
        }

        // 3. Detectar "hoje" e "amanhã"
        if (!hasDate) {
            if (lowerText.includes('amanhã') || lowerText.includes('amanha')) {
                targetDate = addDays(now, 1);
                hasDate = true;
            } else if (lowerText.includes('hoje')) {
                targetDate = now;
                hasDate = true;
            }
        }

        // 4. Detectar hora - aceita vários formatos: "10h", "10 horas", "às 10", "as 14"
        const timeRegex = /(?:às|as|ate|até)?\s*(\d{1,2})\s*(?:h(?:oras?)?|:00|\s+horas?)?/i;
        const timeMatch = lowerText.match(timeRegex);

        // Validar se realmente parece ser hora (não pegar números soltos como dias)
        const seemsLikeTime = lowerText.match(/(?:às|as|hora|h\b)/i);

        if (timeMatch && seemsLikeTime) {
            const hour = parseInt(timeMatch[1]);

            if (hour >= 0 && hour <= 23) {
                // Definir a hora no horário local
                targetDate.setHours(hour, 0, 0, 0);

                // targetDate já está em UTC porque new Date() cria em UTC
                // Mas setHours define no horário local do servidor
                // Retornar direto
                return targetDate;
            }
        }

        // Se temos data mas não hora, retornar null para forçar nova entrada
        if (hasDate && !seemsLikeTime) {
            return null;
        }

        return hasDate || (timeMatch && seemsLikeTime) ? targetDate : null;
    }
}

export const appointmentService = new AppointmentService();
