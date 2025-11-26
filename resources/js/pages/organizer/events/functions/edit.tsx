import EventManagementLayout from '@/layouts/event-management-layout';
import { Head } from '@inertiajs/react';
import { Event, EventFunction } from '@/types';
import FunctionForm from '@/components/organizers/FunctionForm';
import BackButton from '@/components/Backbutton';

interface EventFunctionWithStatus extends EventFunction {
    status: string;
    status_label: string;
    status_color: string;
}

interface EventStatus {
    value: string;
    label: string;
    color: string;
}

interface EditFunctionProps {
    event: Event;
    function: EventFunctionWithStatus;
    statuses: EventStatus[];
}

export default function EditFunctionPage({ event, function: functionData, statuses }: EditFunctionProps) {
    return (
        <EventManagementLayout event={event} activeTab="functions">
            <Head title={`Editar Función - ${functionData.name}`} />
            <div className="flex items-center mb-6 gap-2">
                <BackButton href={route('organizer.events.functions', event.id)} />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Editar Función</h1>
                    <p className="text-gray-600 mt-1">
                        Modifica los detalles de la función, incluyendo su estado.
                    </p>
                </div>
            </div>
            <div className="space-y-4">
                <FunctionForm 
                    event={event} 
                    functionData={functionData} 
                    statuses={statuses}
                    isEditing 
                />
            </div>
        </EventManagementLayout>
    );
}