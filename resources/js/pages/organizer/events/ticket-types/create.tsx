import { FormEventHandler } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TicketTypeForm, TicketTypeFormData } from '@/components/organizers/ticketTypeForm';
import { Event, EventFunction, Sector } from '@/types';
import { PageProps } from '@/types/ui/ui';

interface CreateTicketTypeProps extends PageProps {
    event: Event;
    function: EventFunction;
    sectors: Sector[];
}

export default function CreateTicketType() {
    const { event, function: eventFunction, sectors } = usePage<CreateTicketTypeProps>().props;

    const { data, setData, post, processing, errors } = useForm<TicketTypeFormData>({
        name: '',
        description: '',
        price: '',
        quantity: '',
        sector_id: sectors?.[0]?.id || '',
        sales_start_date: '',
        sales_end_date: '',
        is_hidden: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('organizer.events.functions.ticket-types.store', { event: event.id, function: eventFunction.id }));
    };

    return (
        <EventManagementLayout event={event} activeTab="tickets">
            <Head title={`Crear Entrada para ${event.name}`} />
            <Card>
                <CardHeader>
                    <CardTitle>Crear Nuevo Tipo de Entrada</CardTitle>
                    <CardDescription>
                        Configura una nueva entrada para la función "{eventFunction.name}" de tu evento "{event.name}".
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TicketTypeForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={submit}
                        sectors={sectors}
                        submitText="Crear Entrada"
                        cancelUrl={route('organizer.events.tickets', event.id)}
                    />
                </CardContent>
            </Card>
        </EventManagementLayout>
    );
}