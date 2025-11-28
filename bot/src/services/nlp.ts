import { NlpManager } from 'node-nlp';

class NLPService {
    private manager: any;

    constructor() {
        this.manager = new NlpManager({ languages: ['pt'], forceNER: true });
        this.train();
    }

    private async train() {
        // Intenção: Saudação
        this.manager.addDocument('pt', 'olá', 'greetings.hello');
        this.manager.addDocument('pt', 'oi', 'greetings.hello');
        this.manager.addDocument('pt', 'bom dia', 'greetings.hello');
        this.manager.addDocument('pt', 'boa tarde', 'greetings.hello');
        this.manager.addDocument('pt', 'boa noite', 'greetings.hello');

        // Intenção: Agendar compromisso
        this.manager.addDocument('pt', 'agendar compromisso', 'appointment.create');
        this.manager.addDocument('pt', 'marcar reunião', 'appointment.create');
        this.manager.addDocument('pt', 'novo agendamento', 'appointment.create');
        this.manager.addDocument('pt', 'quero marcar algo', 'appointment.create');
        this.manager.addDocument('pt', 'agendar para amanhã', 'appointment.create');
        this.manager.addDocument('pt', 'consulta dia', 'appointment.create');
        this.manager.addDocument('pt', 'exame dia', 'appointment.create');
        this.manager.addDocument('pt', 'dentista amanhã', 'appointment.create');
        this.manager.addDocument('pt', 'reunião às', 'appointment.create');
        this.manager.addDocument('pt', 'marcar consulta', 'appointment.create');
        this.manager.addDocument('pt', 'agendar exame', 'appointment.create');

        // Intenção: Ver agenda
        this.manager.addDocument('pt', 'ver minha agenda', 'appointment.list');
        this.manager.addDocument('pt', 'quais meus compromissos', 'appointment.list');
        this.manager.addDocument('pt', 'o que tenho para hoje', 'appointment.list');
        this.manager.addDocument('pt', 'listar reuniões', 'appointment.list');

        // Respostas
        this.manager.addAnswer('pt', 'greetings.hello', 'Olá! Como posso ajudar com sua agenda hoje?');
        this.manager.addAnswer('pt', 'appointment.create', 'Claro, qual o título do compromisso e o horário?');
        this.manager.addAnswer('pt', 'appointment.list', 'Vou verificar sua agenda. Um momento...');

        await this.manager.train();
        this.manager.save();
        console.log('NLP Treinado!');
    }

    public async process(text: string) {
        const response = await this.manager.process('pt', text);
        return response;
    }
}

export const nlpService = new NLPService();
