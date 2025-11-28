declare module 'node-nlp' {
    export class NlpManager {
        constructor(options?: any);
        addDocument(lang: string, utterance: string, intent: string): void;
        addAnswer(lang: string, intent: string, answer: string): void;
        train(): Promise<void>;
        save(fileName?: string): void;
        process(lang: string, utterance: string): Promise<any>;
    }
}
