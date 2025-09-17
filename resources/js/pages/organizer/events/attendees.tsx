import { useState } from 'react';
import { router, Head, Link } from '@inertiajs/react';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    const handleResendInvitation = (attendeeId: number, attendeeType: 'invited' | 'buyer') => {
        if (attendeeType !== 'invited') {
            return;
        }
        
        router.patch(
            route('organizer.events.assistants.resendInvitation', {
                event: event.id,
                assistant: attendeeId
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // TODO: mostrar toast de éxito
                }
            }
        );
    };

    const handleDeleteAttendee = (attendeeId: number, attendeeType: 'invited' | 'buyer') => {
        if (attendeeType === 'buyer') {
            return;
        }
        
        if (confirm('¿Estás seguro de que quieres eliminar este asistente?')) {
            router.delete(
                route('organizer.events.assistants.destroy', {
                    event: event.id,
                    assistant: attendeeId
                }),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // TODO: mostrar toast de éxito
                    }
                }
            );
        }
    };

    const getStatusBadge = (attendee: AttendeeForTable) => {
        if (attendee.tickets_used > 0) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Usado</Badge>;
        }
        if (attendee.tickets_count > 0) {
            return <Badge variant="default">Con tickets</Badge>;
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
        return <Badge variant="outline" className="bg-green-50 text-green-700"><ShoppingCart className="w-3 h-3 mr-1" />Comprador</Badge>;
    };

    return (
        <EventManagementLayout 
            event={event}
            activeTab="attendees"
        >
            <Head title={`Asistentes - ${event.name}`} />
            
            <div className="space-y-6">
                {/* Estadísticas */}

                {/*
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Users className="h-4 w-4 text-blue-600" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-gray-600">Total Asistentes</p>
                                    <p className="text-2xl font-bold">{stats.total_attendees}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <UserCheck className="h-4 w-4 text-blue-600" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-gray-600">Invitados</p>
                                    <p className="text-2xl font-bold">{stats.invited_attendees}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <ShoppingCart className="h-4 w-4 text-green-600" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-gray-600">Compradores</p>
                                    <p className="text-2xl font-bold">{stats.buyer_attendees}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Ticket className="h-4 w-4 text-green-600" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                                    <p className="text-2xl font-bold">{stats.total_tickets}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-gray-600">Tickets Usados</p>
                                    <p className="text-2xl font-bold">{stats.tickets_used}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-gray-600">Ingresos</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                */}

                {/* Tabla de asistentes */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Asistentes</CardTitle>
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
                                                        <div className="text-green-600 font-semibold">
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
                                                                <DropdownMenuItem onClick={() => handleResendInvitation(attendee.assistant_id, attendee.type)}>
                                                                    <Mail className="mr-2 h-4 w-4" />
                                                                    Reenviar invitación
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleDeleteAttendee(attendee.assistant_id, attendee.type)}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Eliminar
                                                                </DropdownMenuItem>
                                                            </>
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
        </EventManagementLayout>
    );
}