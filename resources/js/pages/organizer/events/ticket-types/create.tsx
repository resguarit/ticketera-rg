import { FormEventHandler, useEffect, useMemo } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TicketTypeForm, TicketTypeFormData } from '@/components/organizers/TicketTypeForm';
import { Event, EventFunction, Sector } from '@/types';
// import PageProps from the correct location or define it if missing
// import { PageProps } from '@/types/ui/ui';

// If PageProps is not available, define a minimal version here:
interface PageProps {
    auth?: unknown;
    errors?: Record<string, string>;
    [key: string]: unknown;
}

interface CreateTicketTypeProps extends PageProps {
    event: Event;
    function: EventFunction;
    sectors: Sector[];
    [key: string]: unknown;
}

export default function CreateTicketType() {
    const { event, function: eventFunction, sectors } = usePage<CreateTicketTypeProps>().props;

    const { data, setData, post, processing, errors } = useForm<TicketTypeFormData>({
        name: '',
        description: '',
        price: 0,
        // Iniciar con la capacidad del primer sector si existe
        quantity: sectors?.[0]?.capacity ?? 0,
        sector_id: sectors?.[0]?.id ?? undefined,
        sales_start_date: '',
        sales_end_date: '',
        is_hidden: false,
    });

    // Lógica para actualizar la cantidad cuando cambia el sector
    useEffect(() => {
        const selectedSector = sectors.find(s => s.id === data.sector_id);
        if (selectedSector) {
            // Actualiza la cantidad al máximo del sector seleccionado
            setData('quantity', selectedSector.capacity);
        }
    }, [data.sector_id]); // Se ejecuta cada vez que data.sector_id cambia

    const maxQuantity = useMemo(() => {
        return sectors.find(s => s.id === data.sector_id)?.capacity;
    }, [data.sector_id, sectors]);

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
                        maxQuantity={maxQuantity}
                    />
                </CardContent>
            </Card>
        </EventManagementLayout>
    );
}