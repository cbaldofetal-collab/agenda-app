import { supabase } from '../supabase';
import { Telegraf } from 'telegraf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

export class ReminderService {
    private bot: Telegraf;
    private timeZone = 'America/Sao_Paulo';

    constructor(bot: Telegraf) {
        this.bot = bot;
    }

    async processReminders() {
        console.log('Verificando lembretes...');
        const now = new Date().toISOString();

        // Buscar lembretes pendentes que já passaram do horário
        const { data: reminders, error } = await supabase
            .from('reminders')
            .select(`
                *,
                appointments (
                    title,
                    start_time,
                    location_id,
                    locations (name)
                ),
                telegram_sessions (
                    telegram_chat_id
                )
            `)
            .eq('status', 'pending')
            .lte('reminder_time', now);

        if (error) {
            console.error('Erro ao buscar lembretes:', error);
            return;
        }

        if (!reminders || reminders.length === 0) return;

        console.log(`Encontrados ${reminders.length} lembretes para enviar.`);

        for (const reminder of reminders) {
            try {
                // Verificar se temos o chat_id
                // A query acima tenta buscar via user_id -> telegram_sessions, mas a relação pode não estar direta no supabase-js
                // Vamos buscar o chat_id separadamente se não vier

                let chatId = reminder.telegram_sessions?.telegram_chat_id;

                if (!chatId) {
                    const { data: session } = await supabase
                        .from('telegram_sessions')
                        .select('telegram_chat_id')
                        .eq('user_id', reminder.user_id)
                        .single();

                    if (session) chatId = session.telegram_chat_id;
                }

                if (chatId) {
                    const appt = reminder.appointments;
                    const startTime = new Date(appt.start_time);
                    const timeStr = format(toZonedTime(startTime, this.timeZone), "HH:mm", { locale: ptBR });

                    let msg = `🔔 *Lembrete de Compromisso*\n\n`;
                    msg += `📌 *${appt.title}*\n`;
                    msg += `🕒 Hoje às ${timeStr}\n`;

                    if (appt.locations?.name) {
                        msg += `📍 ${appt.locations.name}\n`;
                    }

                    await this.bot.telegram.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

                    // Atualizar status para sent
                    await supabase
                        .from('reminders')
                        .update({ status: 'sent', sent_at: new Date().toISOString() })
                        .eq('id', reminder.id);

                    console.log(`Lembrete enviado para ${chatId}`);
                }
            } catch (e) {
                console.error(`Erro ao processar lembrete ${reminder.id}:`, e);
                // Marcar como falha para não tentar infinitamente? Ou manter pending?
                // Vamos manter pending mas logar erro
            }
        }
    }
}
