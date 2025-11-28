import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppointmentStore } from '../../store/appointmentStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { AppointmentForm } from '../../../components/appointments/AppointmentForm';
import { Calendar, Clock, TrendingUp, AlertCircle, Plus, MapPin } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
    const { user } = useAuthStore();
    const { appointments, loadAppointments, loading } = useAppointmentStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadAppointments();
    }, []);

    const todayAppointments = appointments.filter((apt) =>
        isToday(parseISO(apt.start_time))
    );

    const upcomingAppointments = appointments
        .filter((apt) => new Date(apt.start_time) > new Date())
        .slice(0, 5);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-secondary bg-secondary/10';
            case 'cancelled':
                return 'text-danger bg-danger/10';
            default:
                return 'text-primary bg-primary/10';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'border-danger';
            case 'medium':
                return 'border-accent';
            default:
                return 'border-neutral-medium';
        }
    };

    return (
        <div className="min-h-screen bg-neutral-light p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-h1 text-neutral-dark">
                            Olá, {user?.name || 'Usuário'}! 👋
                        </h1>
                        <p className="text-neutral-medium mt-1">
                            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
                        </p>
                    </div>
                    <Button variant="primary" className="gap-2" onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-5 h-5" />
                        Novo Compromisso
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card padding="md" className="border-l-4 border-primary">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-body-sm text-neutral-medium">Hoje</p>
                                <p className="text-h3 text-neutral-dark">{todayAppointments.length}</p>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md" className="border-l-4 border-secondary">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-secondary/10 rounded-lg">
                                <Clock className="w-6 h-6 text-secondary" />
                            </div>
                            <div>
                                <p className="text-body-sm text-neutral-medium">Próximos</p>
                                <p className="text-h3 text-neutral-dark">{upcomingAppointments.length}</p>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md" className="border-l-4 border-accent">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-accent/10 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <p className="text-body-sm text-neutral-medium">Este Mês</p>
                                <p className="text-h3 text-neutral-dark">{appointments.length}</p>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md" className="border-l-4 border-danger">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-danger/10 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-danger" />
                            </div>
                            <div>
                                <p className="text-body-sm text-neutral-medium">Atrasados</p>
                                <p className="text-h3 text-neutral-dark">0</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Today's Appointments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h2 className="text-h3 text-neutral-dark mb-4">Compromissos de Hoje</h2>
                        {loading ? (
                            <p className="text-neutral-medium text-center py-8">Carregando...</p>
                        ) : todayAppointments.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-neutral-medium mx-auto mb-3 opacity-50" />
                                <p className="text-neutral-medium">Nenhum compromisso para hoje</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {todayAppointments.map((apt) => (
                                    <div
                                        key={apt.id}
                                        className={`p-4 border-l-4 ${getPriorityColor(apt.priority)} bg-white rounded-md hover:shadow-md transition-shadow`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-neutral-dark">{apt.title}</h4>
                                                {apt.description && (
                                                    <p className="text-sm text-neutral-medium mt-1">{apt.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2 text-sm text-neutral-medium">
                                                    <Clock className="w-4 h-4" />
                                                    {format(parseISO(apt.start_time), 'HH:mm')} -{' '}
                                                    {format(parseISO(apt.end_time), 'HH:mm')}

                                                    {apt.locations && (
                                                        <>
                                                            <span className="mx-1">•</span>
                                                            <MapPin className="w-4 h-4" />
                                                            {apt.locations.name}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Upcoming Appointments */}
                    <Card>
                        <h2 className="text-h3 text-neutral-dark mb-4">Próximos Compromissos</h2>
                        {upcomingAppointments.length === 0 ? (
                            <div className="text-center py-8">
                                <TrendingUp className="w-12 h-12 text-neutral-medium mx-auto mb-3 opacity-50" />
                                <p className="text-neutral-medium">Nenhum compromisso agendado</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingAppointments.map((apt) => (
                                    <div
                                        key={apt.id}
                                        className="p-4 bg-white border border-border rounded-md hover:shadow-md transition-shadow"
                                    >
                                        <h4 className="font-semibold text-neutral-dark">{apt.title}</h4>
                                        <p className="text-sm text-neutral-medium mt-1">
                                            {format(parseISO(apt.start_time), "d 'de' MMMM 'às' HH:mm", {
                                                locale: ptBR,
                                            })}
                                        </p>
                                        {apt.locations && (
                                            <div className="flex items-center gap-1 mt-1 text-sm text-neutral-medium">
                                                <MapPin className="w-3 h-3" />
                                                {apt.locations.name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Compromisso"
            >
                <AppointmentForm
                    onSuccess={() => {
                        setIsModalOpen(false);
                        loadAppointments();
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};
