import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAppointmentStore } from '../../app/store/appointmentStore';
import { supabase } from '../../lib/supabase';

const appointmentSchema = z.object({
    title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
    description: z.string().optional(),
    date: z.string().min(1, 'Data é obrigatória'),
    startTime: z.string().min(1, 'Horário de início é obrigatório'),
    endTime: z.string().min(1, 'Horário de término é obrigatório'),
    priority: z.enum(['low', 'medium', 'high']),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialData?: any;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
    onSuccess,
    onCancel,
    initialData,
}) => {
    const { addAppointment, updateAppointment } = useAppointmentStore();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: initialData || {
            priority: 'medium',
            date: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '10:00',
        },
    });

    const onSubmit = async (data: AppointmentFormData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            const startDateTime = new Date(`${data.date}T${data.startTime}`);
            const endDateTime = new Date(`${data.date}T${data.endTime}`);

            const appointmentData = {
                title: data.title,
                description: data.description,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                priority: data.priority,
                status: 'scheduled' as const,
                is_recurring: false,
                user_id: user.id,
            };

            if (initialData?.id) {
                await updateAppointment(initialData.id, appointmentData);
            } else {
                await addAppointment(appointmentData);
            }

            onSuccess?.();
        } catch (error) {
            console.error('Error saving appointment:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Título"
                {...register('title')}
                error={errors.title?.message}
                placeholder="Ex: Reunião de Projeto"
            />

            <div>
                <label className="block text-sm font-medium text-neutral-dark mb-2">
                    Descrição
                </label>
                <textarea
                    {...register('description')}
                    className="w-full p-3 border-2 border-border rounded-md focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all min-h-[100px]"
                    placeholder="Detalhes do compromisso..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    type="date"
                    label="Data"
                    {...register('date')}
                    error={errors.date?.message}
                />
                <Input
                    type="time"
                    label="Início"
                    {...register('startTime')}
                    error={errors.startTime?.message}
                />
                <Input
                    type="time"
                    label="Término"
                    {...register('endTime')}
                    error={errors.endTime?.message}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-dark mb-2">
                    Prioridade
                </label>
                <div className="flex gap-4">
                    {['low', 'medium', 'high'].map((p) => (
                        <label key={p} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value={p}
                                {...register('priority')}
                                className="text-primary focus:ring-primary"
                            />
                            <span className="capitalize">
                                {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" loading={isSubmitting}>
                    Salvar
                </Button>
            </div>
        </form>
    );
};
