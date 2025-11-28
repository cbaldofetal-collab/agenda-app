import OpenAI from 'openai';
import axios from 'axios';
import { createWriteStream, createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import { pipeline } from 'stream/promises';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export class TranscriptionService {
    async transcribeAudio(fileUrl: string): Promise<string> {
        const tempFilePath = `/tmp/voice_${Date.now()}.ogg`;

        try {
            // 1. Baixar o arquivo de áudio
            const response = await axios({
                url: fileUrl,
                method: 'GET',
                responseType: 'stream',
            });

            // 2. Salvar temporariamente
            await pipeline(response.data, createWriteStream(tempFilePath));

            // 3. Transcrever com Whisper
            const transcription = await openai.audio.transcriptions.create({
                file: createReadStream(tempFilePath),
                model: 'whisper-1',
                language: 'pt', // Português
            });

            // 4. Limpar arquivo temporário
            await unlink(tempFilePath);

            return transcription.text;

        } catch (error) {
            // Garantir limpeza em caso de erro
            try {
                await unlink(tempFilePath);
            } catch { }

            throw new Error('Erro ao transcrever áudio: ' + (error as Error).message);
        }
    }
}

export const transcriptionService = new TranscriptionService();
