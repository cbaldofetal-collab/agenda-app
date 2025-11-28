import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Calendar } from 'lucide-react';

export const Login: React.FC = () => {
    const { signIn, signUp } = useAuthStore();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                await signUp(email, password, name);
            } else {
                await signIn(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao autenticar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
            <Card className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <Calendar className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-h2 text-neutral-dark mb-2">Agenda App</h1>
                    <p className="text-neutral-medium">
                        {isRegistering ? 'Crie sua conta' : 'Bem-vindo de volta'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                        <Input
                            label="Nome"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome completo"
                            required
                        />
                    )}

                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                    />

                    <Input
                        label="Senha"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    {error && (
                        <div className="p-3 bg-danger/10 border border-danger rounded-md text-danger text-sm">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        loading={loading}
                    >
                        {isRegistering ? 'Criar Conta' : 'Entrar'}
                    </Button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError('');
                            }}
                            className="text-sm text-primary hover:underline"
                        >
                            {isRegistering
                                ? 'Já tem uma conta? Faça login'
                                : 'Não tem conta? Cadastre-se'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
