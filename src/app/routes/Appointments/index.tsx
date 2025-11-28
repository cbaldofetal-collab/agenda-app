import React, { useEffect, useState } from 'react';
import { useAppointmentStore } from '../../store/appointmentStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { AppointmentForm } from '../../../components/appointments/AppointmentForm';
import { Calendar, Clock, MapPin, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment } from '../../../types';

export const Appointments: React.FC = () => {
    const { appointments, loadAppointments, deleteAppointment } = useAppointmentStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');

    useEffect(() => {
        loadAppointments();
    }, []);

    const handleEdit = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este compromisso?')) {
            try {
                await deleteAppointment(id);
            } catch (error) {
                console.error('Erro ao excluir compromisso:', error);
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    };

    // Filtrar compromissos
    const filteredAppointments = appointments.filter((apt) => {
        // Filtro de busca
        const matchesSearch =
            apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.description?.toLowerCase().includes(searchTerm.toLowerCase());

        // Filtro de status
        const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

        // Filtro de prioridade
        const matchesPriority = priorityFilter === 'all' || apt.priority === priorityFilter;

        // Filtro de data
        let matchesDate = true;
        const aptDate = parseISO(apt.start_time);
        const today = new Date();

        if (dateFilter === 'today') {
            matchesDate = aptDate >= startOfDay(today) && aptDate <= endOfDay(today);
        } else if (dateFilter === 'upcoming') {
            matchesDate = isAfter(aptDate, today);
        } else if (dateFilter === 'past') {
            matchesDate = isBefore(aptDate, today);
        }

        return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-secondary/10 text-secondary border-secondary/20';
            case 'cancelled':
                return 'bg-danger/10 text-danger border-danger/20';
            default:
                return 'bg-primary/10 text-primary border-primary/20';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'border-l-danger';
            case 'medium':
                return 'border-l-accent';
            default:
                return 'border-l-neutral-medium';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'Agendado';
            case 'completed':
                return 'Concluído';
            case 'cancelled':
                return 'Cancelado';
            default:
                return status;
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'Alta';
            case 'medium':
                return 'Média';
            case 'low':
                return 'Baixa';
            default:
                return priority;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-light p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-h2 text-neutral-dark">Compromissos</h1>
                        <p className="text-neutral-medium mt-1">
                            Gerencie todos os seus compromissos
                        </p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-5 h-5 mr-2" />
                        Novo Compromisso
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-medium" />
                                <input
                                    type="text"
                                    placeholder="Buscar compromissos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-md focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border-2 border-border rounded-md focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="scheduled">Agendado</option>
                            <option value="completed">Concluído</option>
                            <option value="cancelled">Cancelado</option>
                        </select>

                        {/* Priority Filter */}
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-4 py-2 border-2 border-border rounded-md focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        >
                            <option value="all">Todas as Prioridades</option>
                            <option value="high">Alta</option>
                            <option value="medium">Média</option>
                            <option value="low">Baixa</option>
                        </select>

                        {/* Date Filter */}
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-2 border-2 border-border rounded-md focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        >
                            <option value="all">Todas as Datas</option>
                            <option value="today">Hoje</option>
                            <option value="upcoming">Próximos</option>
                            <option value="past">Passados</option>
                        </select>
                    </div>
                </Card>

                {/* Results Count */}
                <div className="flex items-center justify-between text-sm text-neutral-medium">
                    <p>
                        Mostrando <span className="font-semibold text-neutral-dark">{filteredAppointments.length}</span> de{' '}
                        <span className="font-semibold text-neutral-dark">{appointments.length}</span> compromissos
                    </p>
                </div>

                {/* Appointments List */}
                <div className="space-y-4">
                    {filteredAppointments.length === 0 ? (
                        <Card className="text-center py-12">
                            <Calendar className="w-16 h-16 text-neutral-medium mx-auto mb-4 opacity-50" />
                            <h3 className="text-h4 text-neutral-dark mb-2">Nenhum compromisso encontrado</h3>
                            <p className="text-neutral-medium">
                                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || dateFilter !== 'all'
                                    ? 'Tente ajustar os filtros'
                                    : 'Comece criando um novo compromisso'}
                            </p>
                        </Card>
                    ) : (
                        filteredAppointments.map((apt) => (
                            <Card
                                key={apt.id}
                                className={`border-l-4 ${getPriorityColor(apt.priority)} hover:shadow-lg transition-shadow`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-h4 text-neutral-dark">{apt.title}</h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                    apt.status
                                                )}`}
                                            >
                                                {getStatusLabel(apt.status)}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-light text-neutral-dark">
                                                {getPriorityLabel(apt.priority)}
                                            </span>
                                        </div>

                                        {apt.description && (
                                            <p className="text-neutral-medium mb-3">{apt.description}</p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {format(parseISO(apt.start_time), "d 'de' MMMM 'de' yyyy", {
                                                    locale: ptBR,
                                                })}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                {format(parseISO(apt.start_time), 'HH:mm')} -{' '}
                                                {format(parseISO(apt.end_time), 'HH:mm')}
                                            </div>
                                            {apt.locations && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {apt.locations.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(apt)}
                                            className="text-primary hover:bg-primary/10"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(apt.id)}
                                            className="text-danger hover:bg-danger/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedAppointment ? 'Editar Compromisso' : 'Novo Compromisso'}
            >
                <AppointmentForm
                    initialData={selectedAppointment}
                    onSuccess={() => {
                        handleCloseModal();
                        loadAppointments();
                    }}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};
