import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { User, Bell, Globe, MessageSquare } from 'lucide-react';

export const Settings: React.FC = () => {
    const { user, profile, updateProfile } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [timezone, setTimezone] = useState(profile?.timezone || 'America/Sao_Paulo');
    const [language, setLanguage] = useState(profile?.language || 'pt-BR');
    const [emailNotifications, setEmailNotifications] = useState(
        profile?.notification_settings?.email ?? true
    );
    const [pushNotifications, setPushNotifications] = useState(
        profile?.notification_settings?.push ?? true
    );
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            await updateProfile({
                phone,
                timezone,
                language,
            });
            setMessage('Configurações salvas com sucesso!');
        } catch (error: any) {
            console.error('Erro ao salvar configurações:', error);
            setMessage(`Erro ao salvar configurações: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-light p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-h2 text-neutral-dark">Configurações</h1>
                    <p className="text-neutral-medium mt-1">
                        Gerencie suas preferências e informações pessoais
                    </p>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`p-4 rounded-md ${message.includes('sucesso')
                            ? 'bg-secondary/10 text-secondary border border-secondary/20'
                            : 'bg-danger/10 text-danger border border-danger/20'
                            }`}
                    >
                        {message}
                    </div>
                )}

                {/* Perfil */}
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-h3 text-neutral-dark">Perfil</h2>
                            <p className="text-sm text-neutral-medium">
                                Informações pessoais da sua conta
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="Nome"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome completo"
                            disabled
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={user?.email || ''}
                            disabled
                        />
                        <Input
                            label="Telefone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(11) 99999-9999"
                        />
                    </div>
                </Card>

                {/* Preferências */}
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-accent/10 rounded-lg">
                            <Globe className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-h3 text-neutral-dark">Preferências</h2>
                            <p className="text-sm text-neutral-medium">
                                Idioma e fuso horário
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-dark mb-2">
                                Fuso Horário
                            </label>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-border rounded-md focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            >
                                <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                                <option value="America/New_York">Nova York (GMT-5)</option>
                                <option value="Europe/London">Londres (GMT+0)</option>
                                <option value="Asia/Tokyo">Tóquio (GMT+9)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-dark mb-2">
                                Idioma
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-border rounded-md focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            >
                                <option value="pt-BR">Português (Brasil)</option>
                                <option value="en-US">English (US)</option>
                                <option value="es-ES">Español</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Notificações */}
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-secondary/10 rounded-lg">
                            <Bell className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                            <h2 className="text-h3 text-neutral-dark">Notificações</h2>
                            <p className="text-sm text-neutral-medium">
                                Gerencie como você recebe notificações
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-neutral-light rounded-md">
                            <div>
                                <p className="font-medium text-neutral-dark">
                                    Notificações por Email
                                </p>
                                <p className="text-sm text-neutral-medium">
                                    Receba lembretes por email
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={emailNotifications}
                                    onChange={(e) => setEmailNotifications(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-neutral-medium peer-focus:ring-4 peer-focus:ring-primary/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-medium after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-neutral-light rounded-md">
                            <div>
                                <p className="font-medium text-neutral-dark">
                                    Notificações Push
                                </p>
                                <p className="text-sm text-neutral-medium">
                                    Receba notificações no navegador
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={pushNotifications}
                                    onChange={(e) => setPushNotifications(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-neutral-medium peer-focus:ring-4 peer-focus:ring-primary/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-medium after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Integração Telegram */}
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-h3 text-neutral-dark">Integração Telegram</h2>
                            <p className="text-sm text-neutral-medium">
                                Conecte sua conta ao bot do Telegram
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-neutral-light rounded-md">
                        <p className="text-neutral-medium mb-4">
                            Para vincular sua conta ao bot do Telegram, siga os passos:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-neutral-medium mb-4">
                            <li>Abra o Telegram e procure por <strong>@AgendaBot</strong></li>
                            <li>Envie o comando <code className="px-2 py-1 bg-white rounded">/login {user?.email}</code></li>
                            <li>Aguarde a confirmação de vinculação</li>
                        </ol>
                        <p className="text-sm text-neutral-medium italic">
                            Após vincular, você poderá criar compromissos por voz ou texto diretamente no Telegram!
                        </p>
                    </div>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSave} loading={saving} className="px-8">
                        Salvar Configurações
                    </Button>
                </div>
            </div>
        </div>
    );
};
