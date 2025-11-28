# 🤖 Agenda Bot - Documentação

Este é um bot de agendamento inteligente para Telegram, integrado com Supabase e OpenAI Whisper.

## 🌟 Funcionalidades

### 1. 🗣️ Agendamento por Voz
- Envie áudios naturais para agendar compromissos.
- **Exemplo:** *"Marcar dentista dia 15 de dezembro às 14h em São Caetano"*
- **Tecnologia:** Usa OpenAI Whisper para transcrição de alta precisão.

### 2. 📅 Processamento de Linguagem Natural (NLP)
- Entende datas e horários complexos:
  - "Amanhã às 10h"
  - "Dia 25/12"
  - "15 de dezembro"
  - "Próxima segunda-feira"
- Reconhece locais automaticamente (ex: "no Anália Franco", "em Guarulhos").

### 3. 🔔 Lembretes Automáticos
- Envia uma notificação no Telegram **1 hora antes** do compromisso.
- Funciona automaticamente em background.

### 4. 🔗 Integração Completa
- Sincronizado com o banco de dados Supabase.
- Os agendamentos aparecem instantaneamente no painel web.
- Autenticação segura vinculada ao e-mail do usuário.

## 🚀 Como Usar

### Comandos Básicos
| Comando | Descrição |
|---------|-----------|
| `/start` | Inicia o bot e mostra mensagem de boas-vindas |
| `/login <email>` | Vincula sua conta do Telegram ao seu usuário do sistema |
| `/agenda` | Lista seus próximos compromissos agendados |
| `/help` | Mostra ajuda e exemplos de uso |

### Exemplos de Áudio/Texto
Você pode digitar ou falar:
- *"Reunião de projeto amanhã às 9 da manhã"*
- *"Consulta médica dia 20/11 às 15h30"*
- *"Jantar no Tatuapé sexta-feira às 20h"*

## 🛠️ Configuração e Instalação

### Pré-requisitos
- Node.js instalado
- Conta no Supabase
- Token do Bot do Telegram (via @BotFather)
- Chave de API da OpenAI (para transcrição de voz)

### Variáveis de Ambiente (.env)
```env
TELEGRAM_BOT_TOKEN=seu_token_aqui
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_anonima
OPENAI_API_KEY=sua_chave_openai
```

### Rodando o Bot
```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Rodar em produção
npm start
```

## 🐛 Solução de Problemas comum

**O bot não responde:**
- Verifique se o processo `npm run dev` está rodando.
- Verifique se o token do Telegram está correto no `.env`.

**Erro na transcrição de áudio:**
- Verifique se a chave da OpenAI é válida e tem créditos.
- O arquivo de áudio deve ter menos de 20MB.

**Horário errado:**
- O bot está configurado para o fuso horário `America/Sao_Paulo`.
- Certifique-se de falar claramente o horário (ex: "14 horas" em vez de apenas "14").
