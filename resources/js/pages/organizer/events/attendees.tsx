import { useState } from 'react';
import { router, Head, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserPlus, MoreHorizontal, Eye, Mail, Trash2, Users, Ticket, CheckCircle, Clock, ShoppingCart, UserCheck, DollarSign, RefreshCw } from 'lucide-react';
import { AttendeeForTable, AttendeeStats, TicketDetails } from '@/types/models/assistant';
import { Event, EventRelations } from '@/types/models/event';
import { EventFunction } from '@/types/models/eventFunction';
import { formatCurrency } from '@/lib/currencyHelpers';
import TicketDetailsModal from '@/components/organizers/modals/TicketDetailsModal';
import { PaginatedResponse } from '@/types/ui/ui';
import ConfirmationModal from '@/components/ConfirmationModal';
import ConfirmDeleteModal from '@/components/ConfirmationModal';

interface EventAttendeeFunction {
    id: number;
    name: string;
    start_time: string;
}

interface EventFunctionDetail extends EventFunction {
    date: string;       
    time: string;       
    formatted_date: string; 
    day_name: string;
}

interface EventWithDetails extends Event, EventRelations {
    functions: EventFunctionDetail[];
}

interface EventAttendeesProps {
    auth: any;
    event: EventWithDetails;
    attendees: PaginatedResponse<AttendeeForTable>;
    functions: EventAttendeeFunction[];
    selectedFunctionId: number | null;
    stats: AttendeeStats;
}

export default function EventAttendees({ 
    auth, 
    event, 
    attendees, 
    functions,
    selectedFunctionId,
    stats 
}: EventAttendeesProps) {
    const [filterFunction, setFilterFunction] = useState<string>(
        selectedFunctionId?.toString() || 'all'
    );
    
    // Estados para el modal de detalles
    const [ticketDetailsModal, setTicketDetailsModal] = useState({
        isOpen: false,
        loading: false,
        data: null as TicketDetails | null,
    });

    const [confirmResendModal, setConfirmResendModal] = useState(false);
    const [selectedAttendee, setSelectedAttendee] = useState<AttendeeForTable | null>(null);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [eliminatedAttendee, setEliminatedAttendee] = useState<AttendeeForTable | null>(null);

    const handleFunctionFilter = (value: string) => {
        setFilterFunction(value);
        const params = value === 'all' ? {} : { function_id: value };
        
        router.get(
            route('organizer.events.attendees', event.id),
            params,
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleRefresh = () => {
        // Usar visit en lugar de reload para mantener mejor control
        router.visit(
            route('organizer.events.attendees', event.id), 
            { 
                preserveState: true,
                preserveScroll: true,
                only: ['attendees', 'stats'],
                data: {
                    function_id: filterFunction !== 'all' ? filterFunction : undefined
                }
            }
        );
    };

    const handleInviteAssistant = () => {
        router.visit(route('organizer.events.attendees.invite', event.id));
    };

    const handleViewTickets = async (attendee: AttendeeForTable) => {
        setTicketDetailsModal({
            isOpen: true,
            loading: true,
            data: null,
        });

        try {
            let response;
            let url;
            
            if (attendee.type === 'buyer') {
                url = route('organizer.events.attendees.order.details', {
                    event: event.id,
                    order: attendee.order_id
                });
                response = await fetch(url);
            } else {
                url = route('organizer.events.attendees.assistant.details', {
                    event: event.id,
                    assistant: attendee.assistant_id
                });
                response = await fetch(url);
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText || 'Error al cargar los detalles'}`);
            }

            const data = await response.json();
            
            setTicketDetailsModal({
                isOpen: true,
                loading: false,
                data: data,
            });
        } catch (error) {
            setTicketDetailsModal({
                isOpen: false,
                loading: false,
                data: null,
            });
        }
    };

    const closeTicketDetailsModal = () => {
        setTicketDetailsModal({
            isOpen: false,
            loading: false,
            data: null,
        });
    };

    const handleResendInvitation = async (attendeeId: number, attendeeType: 'invited' | 'buyer') => {
        try {
            if (attendeeType === 'invited') {
                // Lógica para asistentes invitados
                // Primero obtenemos los detalles del asistente para conseguir los IDs de los tickets
                const response = await fetch(route('organizer.events.attendees.assistant.details', {
                    event: event.id,
                    assistant: attendeeId
                }));

                if (!response.ok) {
                    throw new Error('Error al obtener los detalles del asistente');
                }

                const assistantDetails = await response.json();
                
                // Extraemos los IDs de todos los tickets disponibles y usados del asistente
                const ticketIds: number[] = [];
                if (assistantDetails.per_type && Array.isArray(assistantDetails.per_type)) {
                    assistantDetails.per_type.forEach((ticketType: any) => {
                        if (ticketType.ticket_ids && Array.isArray(ticketType.ticket_ids)) {
                            ticketIds.push(...ticketType.ticket_ids);
                        }
                    });
                }

                if (ticketIds.length === 0) {
                    throw new Error('No se encontraron tickets para reenviar');
                }

                // Ahora enviamos los IDs de los tickets al controller
                router.patch(
                    route('organizer.events.assistants.resendInvitation', {
                        event: event.id,
                        assistant: attendeeId
                    }),
                    {
                        ticket_ids: ticketIds
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            // TODO: mostrar toast de éxito
                            console.log(`Invitación reenviada exitosamente para ${ticketIds.length} tickets`);
                        },
                        onError: (errors) => {
                            console.error('Error al reenviar invitación:', errors);
                            // TODO: mostrar toast de error
                        }
                    }
                );

            } else if (attendeeType === 'buyer') {
                // Lógica para compradores - reenviar orden completa
                // Para compradores, attendeeId es realmente el order_id
                router.patch(
                    route('organizer.events.assistants.resendPurchase', {
                        event: event.id,
                        order: attendeeId // attendeeId es el order_id para compradores
                    }),
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            // TODO: mostrar toast de éxito
                            console.log('Tickets de compra reenviados exitosamente');
                        },
                        onError: (errors) => {
                            console.error('Error al reenviar tickets de compra:', errors);
                            // TODO: mostrar toast de error
                        }
                    }
                );
            }

        } catch (error) {
            console.error('Error en handleResendInvitation:', error);
            // TODO: mostrar toast de error
            alert('Error al reenviar. Por favor, inténtalo de nuevo.');
        }
    };

    const confirmResendInvitation = (attendee: AttendeeForTable) => {
        setConfirmResendModal(true);
        setSelectedAttendee(attendee);
    };

    const handleConfirmDeleteAttendee = (attendee: AttendeeForTable) => {
        setConfirmDeleteModal(true);
        setEliminatedAttendee(attendee);
    }

    const handleDeleteAttendee = (attendeeId: number, attendeeType: 'invited' | 'buyer') => {
        if (attendeeType === 'buyer') {
            toast.error('No se puede eliminar', {
                description: 'Los compradores no pueden ser eliminados desde esta sección. Las compras deben ser gestionadas desde el sistema de órdenes.',
                duration: 5000
            });
            return;
        }
        
        if (attendeeType === 'invited') {
            router.delete(
                route('organizer.events.assistants.destroy', {
                    event: event.id,
                    assistant: attendeeId
                }),
                {
                    preserveScroll: true,
                    onStart: () => {
                        toast.loading('Eliminando asistente...', { id: 'delete-attendee' });
                    },
                    onSuccess: () => {
                        toast.success('Asistente eliminado exitosamente', {
                            id: 'delete-attendee',
                            description: 'El asistente invitado ha sido eliminado del evento'
                        });
                    },
                    onError: (errors) => {
                        const errorMessage = Object.values(errors)[0] as string;
                        toast.error('Error al eliminar el asistente', {
                            id: 'delete-attendee',
                            description: errorMessage || 'No se pudo eliminar el asistente'
                        });
                    }
                }
            );
        }
    };

    const getStatusBadge = (attendee: AttendeeForTable) => {
        if (attendee.tickets_used > 0) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Usado</Badge>;
        }
        if (attendee.tickets_count > 0 && attendee.order_status !== 'cancelled') {
            return <Badge variant="default">Con tickets</Badge>;
        }
        if (attendee.tickets_count > 0 && attendee.order_status === 'cancelled') {
            return <Badge variant="default">Tickets no disponibles</Badge>;
        }
        if (attendee.type === 'invited' && attendee.sended_at) {
            return <Badge variant="outline">Invitado</Badge>;
        }
        return <Badge variant="destructive">Pendiente</Badge>;
    };

    const getTypeBadge = (attendee: AttendeeForTable) => {
        if (attendee.type === 'invited') {
            return <Badge variant="outline" className="bg-blue-50 text-blue-700"><UserCheck className="w-3 h-3 mr-1" />Invitado</Badge>;
        }
        if (attendee.order_status === 'cancelled') {
            return <Badge variant="outline" className="bg-red-50 text-red-700"><ShoppingCart className="w-3 h-3 mr-1" />Comprador</Badge>;  
        }
        return <Badge variant="outline" className="bg-green-50 text-green-700"><ShoppingCart className="w-3 h-3 mr-1" />Comprador</Badge>;
    };

    return (
        <EventManagementLayout 
            event={event}
            activeTab="attendees"
        >
            <Head title={`Asistentes - ${event.name}`} />
            
            <div className="space-y-6">

                {/* Tabla de asistentes */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className='flex flex-col'>
                                <CardTitle className='text-xl'>Gestión de Asistentes</CardTitle>
                                <CardDescription>
                                    Administra y controla los asistentes de tu evento, tanto invitados como compradores
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Botón de actualización */}
                                <Button 
                                    variant="outline" 
                                    onClick={handleRefresh} 
                                    title="Actualizar lista"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Actualizar
                                </Button>
                                
                                {/* Filtro por función */}
                                <Select value={filterFunction} onValueChange={handleFunctionFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filtrar por función" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las funciones</SelectItem>
                                        {functions.map((func) => (
                                            <SelectItem key={func.id} value={func.id.toString()}>
                                                {func.name} - {func.start_time}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                
                                <Button onClick={handleInviteAssistant}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Invitar asistente
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {(!attendees.data || attendees.data.length === 0) ? (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No hay asistentes invitados
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Comienza invitando a tu primer asistente al evento.
                                </p>
                                <Button onClick={handleInviteAssistant}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Invitar asistente
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>DNI</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Función</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Tickets</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.isArray(attendees.data) && attendees.data.map((attendee: AttendeeForTable) => (
                                        <TableRow key={`${attendee.type}-${attendee.type === 'invited' ? attendee.assistant_id : attendee.order_id}`}>
                                            <TableCell>
                                                {getTypeBadge(attendee)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {attendee.full_name}
                                            </TableCell>
                                            <TableCell>
                                                {attendee.dni || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {attendee.email || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{attendee.function_name}</div>
                                                    <div className="text-sm text-gray-500">{attendee.function_date}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(attendee)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>{attendee.tickets_count} tickets</div>
                                                    <div className="text-gray-500">
                                                        {attendee.tickets_used} usados
                                                    </div>
                                                    {attendee.type === 'buyer' && (
                                                        <div 
                                                        className={`font-semibold ${
                                                            attendee.order_status === 'cancelled' 
                                                            ? 'text-red-600 line-through' 
                                                            : 'text-green-600'
                                                        }`}>
                                                            {formatCurrency(attendee.total_amount)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {attendee.type === 'invited' ? (
                                                        <>
                                                            <div>Invitado: {attendee.invited_at}</div>
                                                            {attendee.sended_at && (
                                                                <div className="text-gray-500">
                                                                    Enviado: {attendee.sended_at}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div>Comprado: {attendee.purchased_at}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewTickets(attendee)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver tickets
                                                        </DropdownMenuItem>
                                                        {attendee.type === 'invited' && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => confirmResendInvitation(attendee)}>
                                                                    <Mail className="mr-2 h-4 w-4" />
                                                                    Reenviar invitación
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleConfirmDeleteAttendee(attendee)}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Eliminar
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {attendee.type === 'buyer' && (
                                                            <DropdownMenuItem onClick={() => handleResendInvitation(attendee.order_id, attendee.type)}>
                                                                <Mail className="mr-2 h-4 w-4" />
                                                                Reenviar tickets
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        
                        {/* Pagination */}
                        {attendees.links && Array.isArray(attendees.links) && attendees.links.length > 0 && (
                            <div className="mt-6 flex justify-center">
                                <div className="flex items-center space-x-2">
                                    {attendees.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 text-sm rounded-md ${
                                                link.active
                                                    ? 'bg-black text-white'
                                                    : link.url
                                                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal de detalles de tickets */}
            <TicketDetailsModal
                key={ticketDetailsModal.isOpen ? 'open' : 'closed'}
                isOpen={ticketDetailsModal.isOpen}
                onClose={closeTicketDetailsModal}
                loading={ticketDetailsModal.loading}
                data={ticketDetailsModal.data}
            />

            <ConfirmationModal
                isOpen={confirmResendModal}
                onClose={() => setConfirmResendModal(false)}
                onConfirm={() => {
                    if (selectedAttendee) {
                        const id = selectedAttendee.type === 'invited' ? (selectedAttendee.assistant_id as number) : (selectedAttendee.order_id as number);
                        handleResendInvitation(id, selectedAttendee.type);
                    }
                    setConfirmResendModal(false);
                }}
                accionTitulo="Reenvío de invitación"
                accion="Reenviar"
                pronombre="esta"
                entidad="invitación"
                accionando="reenviando"
                confirmVariant='destructive'
            />

            <ConfirmDeleteModal
                isOpen={confirmDeleteModal}
                onClose={() => setConfirmDeleteModal(false)}
                onConfirm={() => {
                    if (eliminatedAttendee?.type === 'invited') {
                        handleDeleteAttendee(eliminatedAttendee.assistant_id as number, eliminatedAttendee.type);
                    }
                    setConfirmDeleteModal(false);
                }}
                accionTitulo="Eliminación de asistente"
                accion="Eliminar"
                pronombre="este"
                entidad="asistente"
                accionando="eliminando"
                nombreElemento={eliminatedAttendee?.full_name}
                advertencia="Todos los datos asociados a este asistente también serán eliminados."
                confirmVariant='destructive'
            />
        </EventManagementLayout>
    );
}