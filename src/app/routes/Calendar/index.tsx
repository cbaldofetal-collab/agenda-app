import React, { useState, useEffect } from 'react';
import { useAppointmentStore } from '../../store/appointmentStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { AppointmentForm } from '../../../components/appointments/AppointmentForm';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import {
    format,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
    addWeeks,
    subWeeks,
    parseISO,
    isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment } from '../../../types';

export const CalendarView: React.FC = () => {
    const { appointments, loadAppointments } = useAppointmentStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadAppointments();
    }, []);

    const weekStart = startOfWeek(currentDate, { locale: ptBR });
    const weekEnd = endOfWeek(currentDate, { locale: ptBR });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 to 20:00

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const handleToday = () => setCurrentDate(new Date());

    const getAppointmentsForDayAndHour = (day: Date, hour: number) => {
        return appointments.filter((apt: Appointment) => {
            const aptDate = parseISO(apt.start_time);
            return isSameDay(aptDate, day) && aptDate.getHours() === hour;
        });
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-h2 text-neutral-dark">Calendário</h1>
                    <p className="text-neutral-medium">
                        {format(weekStart, "d 'de' MMMM", { locale: ptBR })} -{' '}
                        {format(weekEnd, "d 'de' MMMM, yyyy", { locale: ptBR })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={handleToday}>
                        Hoje
                    </Button>
                    <div className="flex items-center bg-white rounded-md border border-border">
                        <button
                            onClick={handlePrevWeek}
                            className="p-2 hover:bg-neutral-light rounded-l-md"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="w-px h-6 bg-border" />
                        <button
                            onClick={handleNextWeek}
                            className="p-2 hover:bg-neutral-light rounded-r-md"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-5 h-5 mr-2" />
                        Novo
                    </Button>
                </div>
            </div>

            <Card className="flex-1 overflow-auto p-0">
                <div className="min-w-[800px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-white z-10">
                        <div className="p-4 border-r border-border bg-neutral-light/30">
                            <ClockIcon />
                        </div>
                        {days.map((day) => (
                            <div
                                key={day.toString()}
                                className={`p-4 text-center border-r border-border last:border-r-0 ${isToday(day) ? 'bg-primary/5' : ''
                                    }`}
                            >
                                <p className="text-xs font-medium text-neutral-medium uppercase">
                                    {format(day, 'EEE', { locale: ptBR })}
                                </p>
                                <p className={`text-lg font-bold mt-1 ${isToday(day) ? 'text-primary' : 'text-neutral-dark'
                                    }`}>
                                    {format(day, 'd')}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Time Grid */}
                    <div className="divide-y divide-border">
                        {hours.map((hour) => (
                            <div key={hour} className="grid grid-cols-8 min-h-[80px]">
                                <div className="p-2 text-xs text-neutral-medium text-right border-r border-border bg-neutral-light/10">
                                    {hour}:00
                                </div>
                                {days.map((day) => {
                                    const dayAppointments = getAppointmentsForDayAndHour(day, hour);
                                    return (
                                        <div
                                            key={day.toString()}
                                            className="border-r border-border last:border-r-0 p-1 relative group hover:bg-neutral-light/20 transition-colors"
                                            onClick={() => {
                                                // Optional: Click slot to add appointment
                                            }}
                                        >
                                            {dayAppointments.map((apt) => (
                                                <div
                                                    key={apt.id}
                                                    className={`
                            p-2 rounded text-xs mb-1 cursor-pointer hover:opacity-90 transition-opacity truncate
                            ${apt.priority === 'high' ? 'bg-danger/10 text-danger border border-danger/20' :
                                                            apt.priority === 'medium' ? 'bg-primary/10 text-primary border border-primary/20' :
                                                                'bg-secondary/10 text-secondary border border-secondary/20'}
                          `}
                                                    title={apt.title}
                                                >
                                                    <span className="font-semibold">
                                                        {format(parseISO(apt.start_time), 'HH:mm')}
                                                    </span>{' '}
                                                    {apt.title}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Compromisso"
            >
                <AppointmentForm
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

const ClockIcon = () => (
    <svg
        className="w-5 h-5 text-neutral-medium mx-auto"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
