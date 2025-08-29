import { FormEventHandler } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TicketTypeForm, TicketTypeFormData } from '@/components/organizers/TicketTypeForm';
import { Event, EventFunction, Sector } from '@/types';
import type { TicketType } from '@/types/models/ticketType';

interface EditTicketTypeProps {
    event: Event;
    function: EventFunction;
    ticketType: TicketType;
    sectors: Sector[];
}

export default function EditTicketType() {
    const { event, function: eventFunction, ticketType, sectors } = usePage<EditTicketTypeProps>().props;

    const { data, setData, put, processing, errors } = useForm<TicketTypeFormData>({
        name: ticketType.name,
        description: ticketType.description ?? '',
        price: ticketType.price,
        quantity: ticketType.quantity,
        sector_id: ticketType.sector_id,
        sales_start_date: ticketType.sales_start_date,
        sales_end_date: ticketType.sales_end_date,
        is_hidden: ticketType.is_hidden,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('organizer.events.functions.ticket-types.update', {
            event: event.id,
            function: eventFunction.id,
            ticketType: ticketType.id,
        }));
    };

    return (
        <EventManagementLayout event={event} activeTab="tickets">
            <Head title={`Editar Entrada: ${ticketType.name}`} />
            <Card>
                <CardHeader>
                    <CardTitle>Editar Tipo de Entrada</CardTitle>
                    <CardDescription>
                        Modifica los datos de la entrada para la función "{eventFunction.name}" de tu evento "{event.name}".
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
                        submitText="Guardar Cambios"
                        cancelUrl={route('organizer.events.tickets', event.id)}
                    />
                </CardContent>
            </Card>
        </EventManagementLayout>
    );
}