import EventManagementLayout from '@/layouts/event-management-layout';
import { Head, Link } from '@inertiajs/react';
import { Event, EventFunction } from '@/types';
import FunctionForm from '@/components/organizers/FunctionForm';
import { ChevronLeft } from 'lucide-react';

interface EditFunctionProps {
    event: Event;
    function: EventFunction;
}

export default function EditFunctionPage({ event, function: functionData }: EditFunctionProps) {
    return (
        <EventManagementLayout event={event} activeTab="functions">
            <Head title={`Editar Función - ${functionData.name}`} />
            <div className="space-y-4">
                <Link
                    href={route('organizer.events.functions', event.id)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Volver a Funciones
                </Link>
                <FunctionForm event={event} functionData={functionData} isEditing />
            </div>
        </EventManagementLayout>
    );
}