import { FormEventHandler, useEffect, useMemo } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TicketTypeForm, TicketTypeFormData } from '@/components/organizers/TicketTypeForm';
import { Event, EventFunction, Sector } from '@/types';

interface SectorWithAvailability {
    id: number;
    name: string;
    capacity: number;
    used_capacity: number;
    available_capacity: number;
}

interface PageProps {
    auth?: unknown;
    errors?: Record<string, string>;
    [key: string]: unknown;
}

interface CreateTicketTypeProps extends PageProps {
    event: Event;
    function: EventFunction;
    sectors: Sector[];
    sectorsWithAvailability: SectorWithAvailability[];
    [key: string]: unknown;
}

export default function CreateTicketType() {
    const { event, function: eventFunction, sectors, sectorsWithAvailability } = usePage<CreateTicketTypeProps>().props;

    const { data, setData, post, processing, errors } = useForm<TicketTypeFormData>({
        name: '',
        description: '',
        price: 0,
        quantity: sectorsWithAvailability?.[0]?.available_capacity ?? 0,
        max_purchase_quantity: 10, // Valor por defecto
        sector_id: sectorsWithAvailability?.[0]?.id ?? undefined,
        sales_start_date: '',
        sales_end_date: '',
        is_hidden: false,
        is_bundle: false,           // ← NUEVO
        bundle_quantity: undefined, // ← NUEVO
    });

    useEffect(() => {
        const selectedSectorAvailability = sectorsWithAvailability.find(s => s.id === data.sector_id);
        if (selectedSectorAvailability) {
            setData('quantity', selectedSectorAvailability.available_capacity ?? undefined);
        }
    }, [data.sector_id]);

    const maxQuantity = useMemo(() => {
        const sectorAvailability = sectorsWithAvailability.find(s => s.id === data.sector_id);
        return sectorAvailability?.available_capacity;
    }, [data.sector_id, sectorsWithAvailability]);

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
                        sectorsWithAvailability={sectorsWithAvailability}
                        submitText="Crear Entrada"
                        cancelUrl={route('organizer.events.tickets', event.id)}
                        maxQuantity={maxQuantity}
                    />
                </CardContent>
            </Card>
        </EventManagementLayout>
    );
}