import { FormEventHandler, useEffect, useMemo } from 'react';
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

/**
 * Formatea una cadena de fecha ISO a 'YYYY-MM-DDTHH:mm' para el input datetime-local.
 * @param dateString La cadena de fecha del backend.
 * @returns La cadena de fecha formateada o una cadena vacía.
 */
const formatDateTimeForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    // Crea un objeto Date y extrae los primeros 16 caracteres del formato ISO (YYYY-MM-DDTHH:mm)
    return new Date(dateString).toISOString().slice(0, 16);
};

export default function EditTicketType() {
    const { event, function: eventFunction, ticketType, sectors } = usePage<EditTicketTypeProps>().props;

    const { data, setData, put, processing, errors } = useForm<TicketTypeFormData>({
        name: ticketType.name,
        description: ticketType.description ?? '',
        price: ticketType.price,
        quantity: ticketType.quantity,
        max_purchase_quantity: ticketType.max_purchase_quantity,
        sector_id: ticketType.sector_id,
        sales_start_date: formatDateTimeForInput(ticketType.sales_start_date),
        sales_end_date: formatDateTimeForInput(ticketType.sales_end_date),
        is_hidden: ticketType.is_hidden,
        is_bundle: ticketType.is_bundle || false,           // ← NUEVO
        bundle_quantity: ticketType.bundle_quantity || null, // ← NUEVO
    });

    // Lógica para actualizar la cantidad si el usuario cambia de sector
    useEffect(() => {
        const selectedSector = sectors.find(s => s.id === data.sector_id);
        // Solo actualiza si el sector cambia a uno diferente del original
        if (selectedSector && selectedSector.id !== ticketType.sector_id) {
            setData('quantity', selectedSector.capacity ?? undefined);
        }
    }, [data.sector_id]);

    const maxQuantity = useMemo(() => {
        return sectors.find(s => s.id === data.sector_id)?.capacity;
    }, [data.sector_id, sectors]);

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
                        maxQuantity={maxQuantity}
                    />
                </CardContent>
            </Card>
        </EventManagementLayout>
    );
}