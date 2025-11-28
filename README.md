# Agenda App

Aplicação completa de gerenciamento de agenda pessoal com integração Telegram e interface web.

## 🚀 Features

- ✅ **Interface Web Moderna**
  - Dashboard com estatísticas
  - Calendário semanal interativo
  - Lista de compromissos com filtros
  - Configurações de perfil
  - Sistema de notificações em tempo real

- ✅ **Bot do Telegram**
  - Criação de compromissos por voz ou texto
  - Processamento de linguagem natural (NLP)
  - Reconhecimento automático de datas e locais
  - Lembretes automáticos
  - Comandos: `/start`, `/agenda`, `/login`

- ✅ **Backend Supabase**
  - Autenticação segura
  - Banco de dados PostgreSQL
  - Row Level Security (RLS)
  - Realtime subscriptions

## 📦 Tecnologias

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- React Router
- Supabase Client

### Backend
- Supabase (PostgreSQL + Auth + Realtime)
- Node.js
- Telegram Bot API
- OpenAI Whisper API
- Chrono-node (NLP para datas)

## 🛠️ Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Bot do Telegram (via @BotFather)
- API Key da OpenAI

### Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/agenda-app.git
cd agenda-app

# Instalar dependências do frontend
npm install

# Instalar dependências do bot
cd bot
npm install
cd ..
```

### Configuração

1. **Criar arquivo `.env` na raiz:**

```env
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

2. **Criar arquivo `bot/.env`:**

```env
TELEGRAM_BOT_TOKEN=seu-bot-token
SUPABASE_URL=sua-url-do-supabase
SUPABASE_KEY=sua-service-role-key
OPENAI_API_KEY=sua-openai-key
```

3. **Configurar Supabase:**

```bash
# Executar schema SQL no Supabase SQL Editor
# Arquivo: supabase/schema.sql
```

### Executar

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Bot
cd bot
npm start
```

Acesse: `http://localhost:5175`

## 📚 Documentação

- [Guia de Deploy](DEPLOY.md) - Instruções completas para produção
- [Documentação do Bot](bot/BOT_DOCUMENTATION.md) - Detalhes do bot do Telegram
- [Schema do Banco](supabase/schema.sql) - Estrutura do banco de dados

## 🎯 Estrutura do Projeto

```
agenda-app/
├── src/
│   ├── app/
│   │   ├── layouts/        # Layouts (Main, Auth)
│   │   ├── routes/         # Páginas (Dashboard, Calendar, etc)
│   │   └── store/          # Zustand stores
│   ├── components/
│   │   ├── ui/             # Componentes UI (Button, Card, etc)
│   │   ├── appointments/   # Componentes de compromissos
│   │   └── notifications/  # Sistema de notificações
│   ├── lib/                # Configurações (Supabase)
│   └── types/              # TypeScript types
├── bot/
│   ├── bot.js              # Bot do Telegram
│   ├── nlp.js              # Processamento de linguagem natural
│   └── reminders.js        # Sistema de lembretes
├── supabase/
│   └── schema.sql          # Schema do banco de dados
└── public/                 # Assets estáticos
```

## 🚀 Deploy

Veja o [Guia de Deploy](DEPLOY.md) para instruções completas.

**Quick Start:**

1. Deploy do Supabase: Executar `schema.sql`
2. Deploy do Frontend: Conectar repositório na Vercel
3. Deploy do Bot: Railway, Render ou VPS

## 📝 Licença

MIT

## 👤 Autor

Carlos Baldo

---

**Status do Projeto:** ✅ Produção Ready

Todas as funcionalidades principais estão implementadas e testadas!
