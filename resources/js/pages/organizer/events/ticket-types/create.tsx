import { FormEventHandler, useEffect, useMemo } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TicketTypeForm, TicketTypeFormData } from '@/components/organizers/TicketTypeForm';
import { Event, EventFunction, Sector } from '@/types';
import { toast } from 'sonner';

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
    const { event, function: eventFunction, sectors, sectorsWithAvailability, flash } = usePage<CreateTicketTypeProps>().props;

    const { data, setData, processing, errors } = useForm<TicketTypeFormData>({
        name: '',
        description: '',
        price: '',
        quantity: 0,
        max_purchase_quantity: '',
        sector_id: '',
        sales_start_date: '',
        sales_end_date: '',
        is_hidden: false,
        is_bundle: false,
        bundle_quantity: null,
        create_stages: false,
        stages_count: 2,
        price_increment: 10,
        stage_names: undefined, // Nuevo campo
    });

    // Manejar mensajes flash de Laravel
    useEffect(() => {
        if (flash?.success) {
            toast.success('Entrada creada exitosamente', {
                description: flash.success
            });
        }
        
        if (flash?.warning) {
            toast.warning('Entrada creada con advertencias', {
                description: flash.warning
            });
        }
        
        if (flash?.error) {
            toast.error('Error al crear la entrada', {
                description: flash.error
            });
        }
    }, [flash]);

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

    const validateForm = (): boolean => {
        // Validar nombre
        if (!data.name?.trim()) {
            toast.error('Nombre requerido', {
                description: 'El nombre de la entrada es obligatorio'
            });
            return false;
        }

        // Validar precio
        if (!data.price || data.price <= 0) {
            toast.error('Precio inválido', {
                description: 'El precio debe ser mayor a 0'
            });
            return false;
        }

        // Validar sector
        if (!data.sector_id) {
            toast.error('Sector requerido', {
                description: 'Debe seleccionar un sector'
            });
            return false;
        }

        // Validar cantidad
        if (!data.quantity || data.quantity <= 0) {
            toast.error('Cantidad inválida', {
                description: 'La cantidad debe ser mayor a 0'
            });
            return false;
        }

        // Validar fecha de inicio de venta
        if (!data.sales_start_date) {
            toast.error('Fecha de inicio requerida', {
                description: 'La fecha de inicio de venta es obligatoria'
            });
            return false;
        }

        // Validar bundle si está marcado
        if (data.is_bundle && (!data.bundle_quantity || data.bundle_quantity < 2)) {
            toast.error('Cantidad de lote inválida', {
                description: 'Un lote debe incluir al menos 2 entradas'
            });
            return false;
        }

        // Validar tandas si están marcadas
        if (data.create_stages) {
            if (!data.stages_count || data.stages_count < 2) {
                toast.error('Número de tandas inválido', {
                    description: 'Debe crear al menos 2 tandas'
                });
                return false;
            }

            // Validar nombres de tandas
            if (!data.stage_names || data.stage_names.length !== data.stages_count) {
                toast.error('Nombres de tandas incompletos', {
                    description: 'Debe completar los nombres de todas las tandas'
                });
                return false;
            }

            // Validar que ningún nombre esté vacío
            const emptyNames = data.stage_names.some(name => !name.trim());
            if (emptyNames) {
                toast.error('Nombres de tandas vacíos', {
                    description: 'Todos los nombres de tandas deben estar completos'
                });
                return false;
            }
        }

        return true;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Ejecutar validaciones del frontend
        if (!validateForm()) {
            return;
        }

        router.post(route('organizer.events.functions.ticket-types.store', { 
            event: event.id, 
            function: eventFunction.id 
        }), data, {
            preserveScroll: true,
            onStart: () => {
                const message = data.create_stages ? 'Creando tandas...' : 'Creando entrada...';
                toast.loading(message, { id: 'create-ticket' });
            },
            onSuccess: () => {
                // El toast de éxito se maneja en el useEffect con flash messages
                toast.dismiss('create-ticket');
            },
            onError: (errors) => {
                // Manejar errores específicos del servidor
                if (errors.name) {
                    toast.error('Error en el nombre', {
                        id: 'create-ticket',
                        description: Array.isArray(errors.name) ? errors.name[0] : errors.name
                    });
                } else if (errors.price) {
                    toast.error('Error en el precio', {
                        id: 'create-ticket',
                        description: Array.isArray(errors.price) ? errors.price[0] : errors.price
                    });
                } else if (errors.quantity) {
                    toast.error('Error en la cantidad', {
                        id: 'create-ticket',
                        description: Array.isArray(errors.quantity) ? errors.quantity[0] : errors.quantity
                    });
                } else {
                    const firstError = Object.values(errors)[0];
                    const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                    
                    toast.error('Error al crear la entrada', {
                        id: 'create-ticket',
                        description: errorMessage || 'Verifica todos los campos e intenta nuevamente'
                    });
                }
                
                console.error('Form errors:', errors);
            }
        });
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