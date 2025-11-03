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
                <FunctionForm event={event} functionData={functionData} isEditing />
            </div>
        </EventManagementLayout>
    );
}