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
            <div className="space-y-4">
                <FunctionForm event={event} />
            </div>
        </EventManagementLayout>
    );
}