import { useState } from 'react';
import { router } from '@inertiajs/react';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Ticket, DollarSign, Users, Eye, Calendar } from 'lucide-react';
import { TicketTypeCard } from '@/components/organizers/TicketTypeCard';
import { Event, EventRelations } from '@/types/models/event';
import { EventFunction, EventFunctionRelations } from '@/types/models/eventFunction';
import { TicketType } from '@/types/models/ticketType';
import { formatCurrency, formatNumber } from '@/lib/currencyHelpers';
import ConfirmationModal from '@/components/ConfirmationModal';

interface EventFunctionDetail extends EventFunction, EventFunctionRelations {
    date: string;
    time: string;
    formatted_date: string;
    day_name: string;
    ticketTypes: TicketType[];
}

interface EventWithDetails extends Event, EventRelations {
    functions: EventFunctionDetail[];
}

interface EventTicketsDashboardProps {
    auth: any;
    event: EventWithDetails;
}

export default function EventTicketsDashboard({ auth, event }: EventTicketsDashboardProps) {
    const [selectedFunction, setSelectedFunction] = useState<string>(
        event.functions?.[0]?.id.toString() || '1'
    );

    // Estados para el modal de confirmación
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState<TicketType | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleTicketVisibility = async (ticketId: number) => {
        const func = event.functions.find(f => f.id.toString() === selectedFunction);
        if (!func) return;

        router.patch(
            route('organizer.events.functions.ticket-types.toggleVisibility', {
                event: event.id,
                function: func.id,
                ticketType: ticketId,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Opcional: puedes mostrar un toast o refrescar la lista si no se actualiza automáticamente
                },
            }
        );
    };

    const handleEditTicket = (ticketId: number) => {
        const func = event.functions.find(f => f.id.toString() === selectedFunction);
        if (!func) return;
        router.get(route('organizer.events.functions.ticket-types.edit', {
            event: event.id,
            function: func.id,
            ticketType: ticketId,
        }));
    };

    const handleCreateTicket = (functionId: number) => {
        router.get(route('organizer.events.functions.ticket-types.create', { event: event.id, function: functionId }));
    };

    const handleDuplicateTicketAll = (ticket: TicketType, functionIds: number[]) => {
        const func = event.functions.find(f => f.id.toString() === selectedFunction);
        if (!func) return;
        
        router.post(
            route('organizer.events.functions.ticket-types.duplicateAll', {
                event: event.id,
                function: func.id,
                ticketType: ticket.id,
            }),
            { functions: functionIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Opcional: mostrar toast o refrescar
                },
            }
        );
    };

    // Nueva función para abrir el modal de confirmación
    const handleDeleteTicketClick = (ticket: TicketType) => {
        setTicketToDelete(ticket);
        setIsConfirmModalOpen(true);
    };

    // Nueva función para confirmar la eliminación
    const handleConfirmDeleteTicket = () => {
        if (!ticketToDelete) return;

        const func = event.functions.find(f => f.id.toString() === selectedFunction);
        if (!func) return;

        setIsLoading(true);
        router.delete(
            route('organizer.events.functions.ticket-types.destroy', {
                event: event.id,
                function: func.id,
                ticketType: ticketToDelete.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsConfirmModalOpen(false);
                    setTicketToDelete(null);
                },
                onError: (errors) => {
                    console.error('Error eliminando ticket:', errors);
                },
                onFinish: () => setIsLoading(false)
            }
        );
    };

    const handleDuplicateTicketSelected = (ticket: TicketType, functionIds: number[]) => {
        router.post(
            route('organizer.events.functions.ticket-types.duplicateAll', {
                event: event.id,
                function: selectedFunction,
                ticketType: ticket.id,
            }),
            { functions: functionIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Opcional: mostrar toast o refrescar
                },
            }
        );
    };

    return (
        <>
            <EventManagementLayout event={event} activeTab="tickets">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-gray-800 flex items-center">
                                    Gestión de Entradas
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    Configura y administra los tipos de entradas para cada función de tu evento
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contenido con tabs por función */}
                    {event.functions && event.functions.length > 0 ? (
                        <Tabs value={selectedFunction} onValueChange={setSelectedFunction} className="w-full">
                            <div className="mb-6">
                                <TabsList className="h-11">
                                    {event.functions.map((func) => (
                                        <TabsTrigger 
                                            key={func.id} 
                                            value={func.id.toString()} 
                                            className="flex items-center hover:cursor-pointer gap-2 px-4 py-2 text-sm font-medium"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            <span>{func.name}</span>
                                            <Badge variant="default" className="ml-1 text-xs">
                                                {func.date}
                                            </Badge>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            {event.functions.map((func) => {
                                const stats = func.stats;
                                
                                return (
                                    <TabsContent key={func.id} value={func.id.toString()} className="space-y-6">
                                        {/* Estadísticas de la función */}
                                        <div className="bg-card rounded-lg border p-4">
                                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Resumen de {func.name}</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                                        <div className="bg-muted p-1.5 rounded-full">
                                                            <Ticket className="h-3 w-3 text-primary" />
                                                        </div>
                                                        <span className="text-xs font-medium">Total</span>
                                                    </div>
                                                    <div className="text-lg font-bold text-foreground">{formatNumber(stats?.totalTickets || 0)}</div>
                                                    <div className="text-xs text-muted-foreground">{stats?.totalTypes || 0} tipos</div>
                                                </div>
                                                
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                                        <div className="bg-muted p-1.5 rounded-full">
                                                            <Users className="h-3 w-3 text-primary" />
                                                        </div>
                                                        <span className="text-xs font-medium">Vendidas</span>
                                                    </div>
                                                    <div className="text-lg font-bold text-primary">{formatNumber(stats?.soldTickets || 0)}</div>
                                                    <div className="text-xs text-muted-foreground">{formatNumber(stats?.availableTickets || 0)} disponibles</div>
                                                </div>
                                                
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                                        <div className="bg-muted p-1.5 rounded-full">
                                                            <DollarSign className="h-3 w-3 text-secondary" />
                                                        </div>
                                                        <span className="text-xs font-medium">Ingresos</span>
                                                    </div>
                                                    <div className="text-lg font-bold text-secondary">
                                                        {formatCurrency(stats?.totalRevenue || 0)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">ARS</div>
                                                </div>
                                                
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                                        <div className="bg-muted p-1.5 rounded-full">
                                                            <Eye className="h-3 w-3 text-accent-foreground" />
                                                        </div>
                                                        <span className="text-xs font-medium">Visibles</span>
                                                    </div>
                                                    <div className="text-lg font-bold text-accent-foreground">{stats?.visibleTickets || 0}</div>
                                                    <div className="text-xs text-muted-foreground">de {stats?.totalTypes || 0}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botón crear entrada y título */}
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    Tipos de Entradas
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Gestiona los tipos de entradas para {func.name}
                                                </p>
                                            </div>
                                            <Button 
                                                onClick={() => handleCreateTicket(func.id)}
                                                className="flex items-center gap-2 shrink-0 hover:bg-primary-hover"
                                                size="lg"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Crear Entrada
                                            </Button>
                                        </div>

                                        {/* Lista de tipos de entradas */}
                                        <div className="flex flex-wrap gap-4 justify-start">
                                            {func.ticketTypes && func.ticketTypes.length > 0 ? (
                                                func.ticketTypes.map((ticket) => (
                                                    <TicketTypeCard
                                                        key={ticket.id}
                                                        ticket={ticket}
                                                        onToggleVisibility={handleToggleTicketVisibility}
                                                        onEdit={() => handleEditTicket(ticket.id)}
                                                        onDuplicateAll={handleDuplicateTicketAll}
                                                        onDelete={() => handleDeleteTicketClick(ticket)}
                                                        allFunctions={event.functions.map(f => ({ id: f.id, name: f.name }))}
                                                        functionsWithTicket={event.functions
                                                            .filter(f => f.ticketTypes.some(t => t.name === ticket.name && t.sector_id === ticket.sector_id))
                                                            .map(f => f.id)
                                                        }
                                                    />
                                                ))
                                            ) : (
                                                <div className="w-full">
                                                    <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/30">
                                                        <CardContent className="flex flex-col items-center justify-center py-12">
                                                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                                                <Ticket className="w-8 h-8 text-muted-foreground" />
                                                            </div>
                                                            <h4 className="text-lg font-medium text-foreground mb-2">
                                                                No hay tipos de entradas configurados
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                                                                Crea el primer tipo de entrada para <strong>{func.name}</strong> y comienza a vender tickets para tu evento
                                                            </p>
                                                            <Button 
                                                                onClick={() => handleCreateTicket(func.id)}
                                                                className="flex items-center gap-2"
                                                                size="lg"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                Crear Primera Entrada
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                );
                            })}
                        </Tabs>
                    ) : (
                        <div className="bg-card rounded-lg border p-12">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Calendar className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-3">
                                    No hay funciones configuradas
                                </h3>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                    Para poder configurar entradas, primero necesitas crear al menos una función para tu evento. 
                                    Las funciones definen cuándo y cómo se realizará tu evento.
                                </p>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Ir a Gestión de Funciones
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </EventManagementLayout>

            {/* Modal de confirmación */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false);
                    setTicketToDelete(null);
                }}
                onConfirm={handleConfirmDeleteTicket}
                accionTitulo="Eliminación"
                accion="Eliminar"
                pronombre="este"
                entidad="tipo de entrada"
                accionando="eliminando"
                nombreElemento={ticketToDelete?.name}
                advertencia="Todos los datos asociados al tipo de entrada también serán eliminados."
                confirmVariant='destructive'
                isLoading={isLoading}
            />
        </>
    );
}
