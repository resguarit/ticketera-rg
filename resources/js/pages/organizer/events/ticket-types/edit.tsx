import { FormEventHandler, useEffect, useMemo } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TicketTypeForm, TicketTypeFormData } from '@/components/organizers/TicketTypeForm';
import { Event, EventFunction, Sector } from '@/types';
import type { TicketType } from '@/types/models/ticketType';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

interface SectorWithAvailability {
    id: number;
    name: string;
    capacity: number;
    used_by_others: number;
    current_ticket_sold: number;
    current_ticket_original: number;
    available_capacity: number;
    original_available_capacity: number;
}

interface EditTicketTypeProps {
    event: Event;
    function: EventFunction;
    ticketType: TicketType;
    sectors: Sector[];
    sectorsWithAvailability: SectorWithAvailability[]; // Agregar esta prop
    flash?: {
        success?: string;
        warning?: string;
        error?: string;
    };
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
    const { event, function: eventFunction, ticketType, sectors, sectorsWithAvailability, flash } = usePage<EditTicketTypeProps>().props;

    // Verificar si hay ventas para bloquear la edición del precio
    const hasSales = ticketType.quantity_sold > 0;

    const { data, setData, processing, errors } = useForm<TicketTypeFormData>({
        name: ticketType.name,
        description: ticketType.description ?? '',
        price: ticketType.price,
        quantity: ticketType.quantity,
        max_purchase_quantity: ticketType.max_purchase_quantity,
        sector_id: ticketType.sector_id,
        sales_start_date: formatDateTimeForInput(ticketType.sales_start_date),
        sales_end_date: formatDateTimeForInput(ticketType.sales_end_date),
        is_hidden: ticketType.is_hidden,
        is_bundle: ticketType.is_bundle || false,
        bundle_quantity: ticketType.bundle_quantity || null,
    });

    // Manejar mensajes flash de Laravel
    useEffect(() => {
        if (flash?.success) {
            toast.success('Entrada actualizada exitosamente', {
                description: flash.success
            });
        }
        
        if (flash?.warning) {
            toast.warning('Entrada actualizada con advertencias', {
                description: flash.warning
            });
        }
        
        if (flash?.error) {
            toast.error('Error al actualizar la entrada', {
                description: flash.error
            });
        }
    }, [flash]);

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

        // Validar que no se reduzca por debajo de las ventas existentes
        if (data.quantity < ticketType.quantity_sold) {
            const bundleText = ticketType.is_bundle ? 'lotes' : 'entradas';
            toast.error('Cantidad insuficiente', {
                description: `No se puede reducir por debajo de los ${bundleText} ya vendidos (${ticketType.quantity_sold})`
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

        return true;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Ejecutar validaciones del frontend
        if (!validateForm()) {
            return;
        }

        router.put(route('organizer.events.functions.ticket-types.update', {
            event: event.id,
            function: eventFunction.id,
            ticketType: ticketType.id,
        }), data, {
            preserveScroll: true,
            onStart: () => {
                toast.loading('Actualizando entrada...', { id: 'update-ticket' });
            },
            onSuccess: () => {
                // El toast de éxito se maneja en el useEffect con flash messages
                toast.dismiss('update-ticket');
            },
            onError: (errors) => {
                // Manejar errores específicos del servidor
                if (errors.name) {
                    toast.error('Error en el nombre', {
                        id: 'update-ticket',
                        description: Array.isArray(errors.name) ? errors.name[0] : errors.name
                    });
                } else if (errors.quantity) {
                    toast.error('Error en la cantidad', {
                        id: 'update-ticket',
                        description: Array.isArray(errors.quantity) ? errors.quantity[0] : errors.quantity
                    });
                } else {
                    const firstError = Object.values(errors)[0];
                    const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                    
                    toast.error('Error al actualizar la entrada', {
                        id: 'update-ticket',
                        description: errorMessage || 'Verifica todos los campos e intenta nuevamente'
                    });
                }
                
                console.error('Form errors:', errors);
            }
        });
    };

    return (
        <EventManagementLayout event={event} activeTab="tickets">
            <Head title={`Editar Entrada: ${ticketType.name}`} />
            <Card>
                <CardHeader>
                    <CardTitle>Editar Tipo de Entrada</CardTitle>
                    <CardDescription>
                        Modifica los datos de la entrada para la función "{eventFunction.name}" de tu evento "{event.name}".
                        {hasSales && (
                            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-amber-800 text-sm">
                                        <p className="font-medium">Limitaciones por ventas existentes:</p>
                                        <ul className="mt-1 list-disc list-inside space-y-1">
                                            <li>El precio no se puede modificar</li>
                                            <li>La cantidad no se puede reducir por debajo de {ticketType.quantity_sold} {ticketType.is_bundle ? 'lotes' : 'entradas'} vendidas</li>
                                            <li>El tipo (individual/lote) no se puede cambiar</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
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
                        sectorsWithAvailability={sectorsWithAvailability} // Pasar la prop
                        submitText="Guardar Cambios"
                        cancelUrl={route('organizer.events.tickets', event.id)}
                        maxQuantity={maxQuantity}
                        hasSales={hasSales}
                        isEditing={true} // Nueva prop para indicar modo edición
                    />
                </CardContent>
            </Card>
        </EventManagementLayout>
    );
}