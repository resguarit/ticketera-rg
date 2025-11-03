import EventManagementLayout from '@/layouts/event-management-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Event } from '@/types';
import FunctionForm from '@/components/organizers/FunctionForm';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import BackButton from '@/components/Backbutton';

interface CreateFunctionProps {
    event: Event;
}

export default function CreateFunctionPage({ event }: CreateFunctionProps) {
    const { flash } = usePage().props as any;
    
    // Manejar mensajes flash de Laravel
    useEffect(() => {
        if (flash.error) {
            toast.error('Error al crear la función', {
                description: flash.error
            });
        }
    }, [flash]);

    return (
        <EventManagementLayout event={event} activeTab="functions">
            <Head title={`Crear Función para ${event.name}`} />
                <div className="flex items-center mb-6 gap-2">
                    <BackButton href={route('organizer.events.functions', event.id)} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Crear Función</h1>
                        <p className="text-gray-600 mt-1">
                            Complete el formulario para crear una nueva función.
                        </p>
                    </div>
                </div>
            <div className="space-y-4">
                <FunctionForm event={event} />
            </div>
        </EventManagementLayout>
    );
}