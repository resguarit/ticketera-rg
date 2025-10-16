import EventManagementLayout from '@/layouts/event-management-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Event } from '@/types';
import FunctionForm from '@/components/organizers/FunctionForm';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

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
                <Link
                    href={route('organizer.events.functions', event.id)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Volver a Funciones
                </Link>
                <FunctionForm event={event} />
            </div>
        </EventManagementLayout>
    );
}