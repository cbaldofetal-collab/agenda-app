import { Telegraf, Context } from 'telegraf';
import dotenv from 'dotenv';
import { supabase } from './supabase';
import { nlpService } from './services/nlp';
import { sessionService } from './services/sessionService';
import { appointmentService } from './services/appointmentService';
import { transcriptionService } from './services/transcriptionService';
import { ReminderService } from './services/reminderService';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import cron from 'node-cron';

dotenv.config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN environment variable');
}

const bot = new Telegraf(botToken);
const reminderService = new ReminderService(bot);

// Agendar verificação de lembretes a cada minuto
cron.schedule('* * * * *', () => {
    reminderService.processReminders();
});

// Middleware para log
bot.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log('Response time: %sms', ms);
});

// Comando /start
bot.start(async (ctx) => {
    const telegramId = ctx.from.id;
    const firstName = ctx.from.first_name;

    try {
        // Verificar se usuário existe
        const { data: user } = await supabase
            .from('telegram_sessions')
            .select('*')
            .eq('telegram_chat_id', telegramId)
            .single();

        if (!user) {
            ctx.reply(`Olá ${firstName}! Bem-vindo ao Agenda App Bot. 
        
Para começar, você precisa vincular sua conta.
Use o comando /login <seu_email> para iniciar o processo.`);
        } else {
            ctx.reply(`Bem-vindo de volta, ${firstName}! O que deseja fazer hoje?`);
        }

    } catch (e) {
        console.error('Erro no start:', e);
        ctx.reply('Ocorreu um erro ao iniciar. Tente novamente mais tarde.');
    }
});

// Comando /login
bot.command('login', async (ctx) => {
    const telegramId = ctx.from.id;
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply('Por favor, forneça seu email. Exemplo: /login seu@email.com');
    }

    const email = args[1];

    try {
        // Buscar usuário na tabela users (assumindo que existe e tem email)
        // Nota: Em produção, idealmente usaríamos auth.admin.listUsers ou similar, 
        // mas vamos tentar query direta na tabela users/profiles se acessível

        // Tentativa 1: Buscar em 'users' (se for tabela pública espelhada)
        let { data: user, error } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (!user) {
            // TEMPORARIAMENTE DESABILITADO PARA EVITAR ERRO DE BUILD
            // const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
            // if (authError) throw authError;
            // const authUser = authUsers?.find((u: any) => u.email === email);
            // if (authUser) {
            //     user = { id: authUser.id };
            // }

            return ctx.reply('Funcionalidade de login temporariamente desabilitada. Use o app web para vincular sua conta.');
        }

        if (!user) {
            return ctx.reply('Email não encontrado. Verifique se você já criou uma conta no app.');
        }

        // Vincular conta
        const { error: upsertError } = await supabase
            .from('telegram_sessions')
            .upsert({
                telegram_chat_id: telegramId,
                user_id: user.id,
                telegram_username: ctx.from.username
            }, { onConflict: 'telegram_chat_id' });

        if (upsertError) throw upsertError;

        ctx.reply('Conta vinculada com sucesso! Agora você pode agendar compromissos.');

    } catch (e) {
        console.error('Erro no login:', e);
        ctx.reply('Erro ao vincular conta. Tente novamente.');
    }
});

// Comando /agenda
bot.command('agenda', async (ctx) => {
    const telegramId = ctx.from.id;

    try {
        // Buscar user_id
        const { data: sessionData } = await supabase
            .from('telegram_sessions')
            .select('user_id')
            .eq('telegram_chat_id', telegramId)
            .single();

        if (!sessionData) {
            return ctx.reply('Você precisa vincular sua conta primeiro. Use /login <seu_email>');
        }

        // Buscar próximos compromissos (próximos 7 dias)
        const now = new Date();
        const weekLater = new Date();
        weekLater.setDate(weekLater.getDate() + 7);

        const { data: appointments, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('user_id', sessionData.user_id)
            .gte('start_time', now.toISOString())
            .lte('start_time', weekLater.toISOString())
            .order('start_time', { ascending: true })
            .limit(10);

        if (error) throw error;

        if (!appointments || appointments.length === 0) {
            return ctx.reply('📅 Você não tem compromissos agendados para os próximos 7 dias.');
        }

        // Formatar resposta
        let message = '📅 *Seus Próximos Compromissos:*\n\n';
        appointments.forEach((apt, index) => {
            const date = new Date(apt.start_time);
            const dateStr = format(date, "dd/MM 'às' HH:mm", { locale: ptBR });
            message += `${index + 1}. *${apt.title}*\n   📆 ${dateStr}\n\n`;
        });

        ctx.reply(message, { parse_mode: 'Markdown' });

    } catch (e) {
        console.error('Erro ao buscar agenda:', e);
        ctx.reply('Erro ao buscar seus compromissos. Tente novamente.');
    }
});

bot.help((ctx) => ctx.reply('Comandos disponíveis:\n/start - Iniciar\n/login - Vincular conta\n/agenda - Ver compromissos'));

// Handler de mensagens de texto
bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    const telegramId = ctx.from.id;

    // Ignorar comandos
    if (text.startsWith('/')) return;

    try {
        const session = sessionService.getSession(telegramId);

        // Fluxo de agendamento
        if (session.state === 'AWAITING_APPOINTMENT_DETAILS') {
            try {
                // Tentar criar agendamento com o texto fornecido
                // O texto deve conter data/hora (ex: "amanhã as 10")
                // O título pegamos do contexto anterior ou usamos um padrão se não tiver?
                // Vamos assumir que o usuário mandou "Título as Hora" ou apenas Hora se já tivermos título?
                // Simplificação: O texto todo é o título + data. O service tenta extrair data.

                // Se quisermos separar título, precisaríamos de mais passos. 
                // Vamos assumir: "Reunião amanhã as 10" -> Título: "Reunião", Data: amanhã 10h

                // Vamos usar o texto todo como input para o service
                const appointment = await appointmentService.createAppointment(telegramId, text, text);

                const dateStr = format(parseISO(appointment.start_time), "dd/MM 'às' HH:mm", { locale: ptBR });
                ctx.reply(`Agendamento confirmado! ✅\n"${appointment.title}" para ${dateStr}.`);

                sessionService.clearSession(telegramId);
            } catch (err: any) {
                ctx.reply(`Não consegui agendar: ${err.message}`);
                // Mantém estado para tentar de novo ou cancela?
                // Vamos manter para o usuário tentar corrigir a data
                ctx.reply('Tente novamente, por exemplo: "Reunião amanhã às 14h" ou digite "cancelar".');
            }
            return;
        }

        // Fluxo normal (NLP)
        if (text.toLowerCase() === 'cancelar') {
            sessionService.clearSession(telegramId);
            ctx.reply('Operação cancelada.');
            return;
        }

        const response = await nlpService.process(text);

        if (response.intent === 'None') {
            ctx.reply('Desculpe, não entendi. Pode reformular?');
            return;
        }

        // Lógica específica baseada na intenção
        if (response.intent === 'appointment.create') {
            sessionService.setSession(telegramId, { state: 'AWAITING_APPOINTMENT_DETAILS' });
            ctx.reply('Claro! Qual o compromisso e o horário? (Ex: "Dentista amanhã às 15h")');
            return;
        }

        if (response.intent === 'appointment.list') {
            // Implementar listagem
            ctx.reply('Funcionalidade de listar agenda em breve!');
            return;
        }

        // Resposta padrão do NLP se houver
        if (response.answer) {
            ctx.reply(response.answer);
        }

    } catch (e) {
        console.error('Erro ao processar mensagem:', e);
        ctx.reply('Ocorreu um erro ao processar sua mensagem.');
    }
});

// Handler de mensagens de voz
bot.on('voice', async (ctx) => {
    const telegramId = ctx.from.id;

    try {
        ctx.reply('🎤 Recebi seu áudio! Transcrevendo...');

        // Obter informações do arquivo de voz
        const voice = ctx.message.voice;
        const fileId = voice.file_id;

        // Buscar o link do arquivo
        const file = await ctx.telegram.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;

        // Transcrever o áudio
        const transcription = await transcriptionService.transcribeAudio(fileUrl);

        console.log('Transcrição:', transcription);
        ctx.reply(`📝 Você disse: "${transcription}"`);

        // Processar a transcrição como se fosse uma mensagem de texto
        const session = sessionService.getSession(telegramId);

        // Fluxo de agendamento
        if (session.state === 'AWAITING_APPOINTMENT_DETAILS') {
            try {
                const appointment = await appointmentService.createAppointment(telegramId, transcription, transcription);

                const dateStr = format(parseISO(appointment.start_time), "dd/MM 'às' HH:mm", { locale: ptBR });

                let msg = `Agendamento confirmado! ✅\n"${appointment.title}" para ${dateStr}.`;
                if (appointment.locations) {
                    msg += `\n📍 Local: ${appointment.locations.name}`;
                }

                ctx.reply(msg);

                sessionService.clearSession(telegramId);
            } catch (err: any) {
                ctx.reply(`Não consegui agendar: ${err.message}`);
                ctx.reply('Tente novamente, por exemplo: "Reunião amanhã às 14h" ou digite "cancelar".');
            }
            return;
        }

        // Fluxo normal (NLP)
        if (transcription.toLowerCase() === 'cancelar') {
            sessionService.clearSession(telegramId);
            ctx.reply('Operação cancelada.');
            return;
        }

        const response = await nlpService.process(transcription);

        if (response.intent === 'None') {
            // Fallback: Tentar agendar diretamente se tiver data válida
            try {
                const appointment = await appointmentService.createAppointment(telegramId, transcription, transcription);
                const dateStr = format(parseISO(appointment.start_time), "dd/MM 'às' HH:mm", { locale: ptBR });

                let msg = `Agendamento confirmado! ✅\n"${appointment.title}" para ${dateStr}.`;

                if (appointment.locations) {
                    msg += `\n📍 Local: ${appointment.locations.name}`;
                }

                ctx.reply(msg);
                return;
            } catch (e) {
                // Se falhar o agendamento direto, aí sim dizemos que não entendemos
                ctx.reply('Desculpe, não entendi. Pode reformular?');
                return;
            }
        }

        // Lógica específica baseada na intenção
        if (response.intent === 'appointment.create') {
            sessionService.setSession(telegramId, { state: 'AWAITING_APPOINTMENT_DETAILS' });
            ctx.reply('Claro! Qual o compromisso e o horário? (Ex: "Dentista amanhã às 15h")');
            return;
        }

        if (response.intent === 'appointment.list') {
            ctx.reply('Funcionalidade de listar agenda em breve!');
            return;
        }

        // Resposta padrão do NLP se houver
        if (response.answer) {
            ctx.reply(response.answer);
        }

    } catch (e) {
        console.error('Erro ao processar áudio:', e);
        ctx.reply('Erro ao processar áudio. Verifique se você configurou a OPENAI_API_KEY no .env');
    }
});

bot.launch().then(() => {
    console.log('Bot is running!');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
