import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    UserPlus, 
    Minus, 
    Plus, 
    Ticket, 
    User, 
    Mail, 
    Phone, 
    MapPin,
    CreditCard,
    Trash2,
    Calendar,
    Clock,
    IdCard
} from 'lucide-react';
import { Event, EventRelations } from '@/types/models/event';
import { EventFunction } from '@/types/models/eventFunction';
import { TicketType } from '@/types/models/ticketType';
import { formatCurrency } from '@/lib/currencyHelpers';
import BackButton from '@/components/Backbutton';

interface TicketTypeWithAvailability extends TicketType {
    available: number;
    sold: number;
}

interface EventFunctionWithTickets extends EventFunction {
    ticketTypes: TicketTypeWithAvailability[];
    date: string;
    time: string;
    formatted_date: string;
    day_name: string;
}

interface EventWithDetails extends Event, EventRelations {
    functions: EventFunctionWithTickets[];
}

interface PersonData {
    name: string;
    last_name: string;
    dni: string;
    email: string;
    phone: string;
    address: string;
}

interface TicketRequest {
    event_function_id: number;
    ticket_type_id: number;
    quantity: number;
}

interface InviteAttendeeProps {
    auth: any;
    event: EventWithDetails;
    eventFunctions: EventFunctionWithTickets[];
}

export default function InviteAttendee({ auth, event, eventFunctions }: InviteAttendeeProps) {
    const { flash } = usePage().props as any;
    const [tickets, setTickets] = useState<TicketRequest[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    
    const [personData, setPersonData] = useState<PersonData>({
        name: '',
        last_name: '',
        dni: '',
        email: '',
        phone: '',
        address: '',
    });

    // Manejar mensajes flash
    useEffect(() => {
        if (flash?.success) {
            toast.success('Asistente invitado exitosamente', {
                description: flash.success
            });
        }
        
        if (flash?.error) {
            toast.error('Error al invitar asistente', {
                description: flash.error
            });
        }
    }, [flash]);

    // Actualizar tickets cuando cambia el estado local
    useEffect(() => {
        // Calcular total
        let total = 0;
        tickets.forEach(ticket => {
            const eventFunction = eventFunctions?.find(f => f.id === ticket.event_function_id);
            const ticketType = eventFunction?.ticketTypes?.find(t => t.id === ticket.ticket_type_id);
            if (ticketType) {
                total += ticketType.price * ticket.quantity;
            }
        });
        setTotalAmount(total);
    }, [tickets, eventFunctions]);

    // Obtener tipos de tickets para una función específica
    const getTicketTypesForFunction = (functionId: number): TicketTypeWithAvailability[] => {
        const selectedFunction = eventFunctions?.find(f => f.id === functionId);
        return selectedFunction?.ticketTypes || [];
    };

    const addTicket = () => {
        setTickets([...tickets, {
            event_function_id: 0,
            ticket_type_id: 0,
            quantity: 1,
        }]);
    };

    const removeTicket = (index: number) => {
        const newTickets = tickets.filter((_, i) => i !== index);
        setTickets(newTickets);
    };

    const updateTicket = (index: number, field: keyof TicketRequest, value: number) => {
        const newTickets = [...tickets];
        newTickets[index] = { ...newTickets[index], [field]: value };
        
        // Si cambia la función, resetear el tipo de ticket
        if (field === 'event_function_id') {
            newTickets[index].ticket_type_id = 0;
        }
        
        setTickets(newTickets);
    };

    const validateForm = (): boolean => {
        // Validar datos personales
        if (!personData.name.trim()) {
            toast.error('Nombre requerido', {
                description: 'El nombre del asistente es obligatorio'
            });
            return false;
        }

        if (!personData.last_name.trim()) {
            toast.error('Apellido requerido', {
                description: 'El apellido del asistente es obligatorio'
            });
            return false;
        }

        if (!personData.email.trim()) {
            toast.error('Email requerido', {
                description: 'El email del asistente es obligatorio'
            });
            return false;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(personData.email)) {
            toast.error('Email inválido', {
                description: 'Por favor ingresa un email válido'
            });
            return false;
        }

        // Validar tickets
        if (tickets.length === 0) {
            toast.error('Entradas requeridas', {
                description: 'Debe agregar al menos una entrada'
            });
            return false;
        }

        // Validar que todos los tickets estén completos
        for (let i = 0; i < tickets.length; i++) {
            const ticket = tickets[i];
            if (!ticket.event_function_id) {
                toast.error(`Función requerida`, {
                    description: `Selecciona una función para la entrada #${i + 1}`
                });
                return false;
            }

            if (!ticket.ticket_type_id) {
                toast.error(`Tipo de entrada requerido`, {
                    description: `Selecciona un tipo de entrada para la entrada #${i + 1}`
                });
                return false;
            }

            if (!ticket.quantity || ticket.quantity < 1) {
                toast.error(`Cantidad inválida`, {
                    description: `La cantidad debe ser mayor a 0 para la entrada #${i + 1}`
                });
                return false;
            }
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Ejecutar validaciones del frontend
        if (!validateForm()) {
            return;
        }

        setProcessing(true);
        setErrors({});
        
        router.post(route('organizer.events.attendees.invite.store', event.id), {
            person: personData,
            tickets: tickets,
        } as any, {
            preserveScroll: true,
            onStart: () => {
                toast.loading('Invitando asistente...', { id: 'invite-attendee' });
            },
            onSuccess: () => {
                toast.success('Asistente invitado exitosamente', {
                    id: 'invite-attendee',
                    description: 'Se ha enviado la invitación por email'
                });
                
                // Limpiar formulario
                setPersonData({
                    name: '',
                    last_name: '',
                    dni: '',
                    email: '',
                    phone: '',
                    address: '',
                });
                setTickets([]);
                setProcessing(false);
            },
            onError: (errors: any) => {
                // Manejar errores específicos del servidor
                if (errors['person.name']) {
                    toast.error('Error en el nombre', {
                        id: 'invite-attendee',
                        description: errors['person.name']
                    });
                } else if (errors['person.email']) {
                    toast.error('Error en el email', {
                        id: 'invite-attendee',
                        description: errors['person.email']
                    });
                } else if (errors.tickets) {
                    toast.error('Error en las entradas', {
                        id: 'invite-attendee',
                        description: errors.tickets
                    });
                } else if (errors.general) {
                    toast.error('Error al invitar asistente', {
                        id: 'invite-attendee',
                        description: errors.general
                    });
                } else {
                    toast.error('Error al invitar asistente', {
                        id: 'invite-attendee',
                        description: 'Verifica todos los campos e intenta nuevamente'
                    });
                }
                
                setErrors(errors);
                setProcessing(false);
            }
        });
    };

    const getSelectedFunction = (functionId: number) => {
        return eventFunctions.find(f => f.id === functionId);
    };

    const getSelectedTicketType = (functionId: number, ticketTypeId: number) => {
        const functionTicketTypes = getTicketTypesForFunction(functionId);
        return functionTicketTypes.find(t => t.id === ticketTypeId);
    };

    return (
        <EventManagementLayout event={event} activeTab="attendees">
            <Head title={`Invitar Asistente - ${event.name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-2">
                                        <BackButton
                        href={route('organizer.events.attendees', event.id)}
                    />
                    <div>
                        <h1 className=" font-bold text-gray-900">Invitar Asistente</h1>
                        <p className="text-gray-600 text-sm">Agrega nuevos asistentes al evento {event.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Datos Personales */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Datos Personales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={personData.name}
                                            onChange={(e) => setPersonData({...personData, name: e.target.value})}
                                            className={errors['person.name'] ? 'border-red-500' : ''}
                                        />
                                        {errors['person.name'] && (
                                            <p className="text-sm text-red-600 mt-1">{errors['person.name']}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="last_name">Apellido <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="last_name"
                                            type="text"
                                            value={personData.last_name}
                                            onChange={(e) => setPersonData({...personData, last_name: e.target.value})}
                                            className={errors['person.last_name'] ? 'border-red-500' : ''}
                                        />
                                        {errors['person.last_name'] && (
                                            <p className="text-sm text-red-600 mt-1">{errors['person.last_name']}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="email" className="flex items-center gap-1">
                                        <Mail className="w-4 h-4" />
                                        Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={personData.email}
                                        onChange={(e) => setPersonData({...personData, email: e.target.value})}
                                        className={errors['person.email'] ? 'border-red-500' : ''}
                                    />
                                    {errors['person.email'] && (
                                        <p className="text-sm text-red-600 mt-1">{errors['person.email']}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="dni" className="flex items-center gap-1">
                                        <IdCard className="w-4 h-4" />
                                        DNI (opcional)</Label>
                                    <Input
                                        id="dni"
                                        type="text"
                                        value={personData.dni}
                                        onChange={(e) => setPersonData({...personData, dni: e.target.value})}
                                        className={errors['person.dni'] ? 'border-red-500' : ''}
                                        placeholder="Sin espacios ni puntos"
                                    />
                                    {errors['person.dni'] && (
                                        <p className="text-sm text-red-600 mt-1">{errors['person.dni']}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="phone" className="flex items-center gap-1">
                                        <Phone className="w-4 h-4" />
                                        Teléfono (opcional)
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={personData.phone}
                                        onChange={(e) => setPersonData({...personData, phone: e.target.value})}
                                        className={errors['person.phone'] ? 'border-red-500' : ''}
                                    />
                                    {errors['person.phone'] && (
                                        <p className="text-sm text-red-600 mt-1">{errors['person.phone']}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="address" className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        Dirección (opcional)
                                    </Label>
                                    <Textarea
                                        id="address"
                                        value={personData.address}
                                        onChange={(e) => setPersonData({...personData, address: e.target.value})}
                                        className={errors['person.address'] ? 'border-red-500' : ''}
                                        rows={2}
                                    />
                                    {errors['person.address'] && (
                                        <p className="text-sm text-red-600 mt-1">{errors['person.address']}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Selección de Tickets */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Ticket className="w-5 h-5" />
                                    Entradas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {tickets.map((ticket, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Entrada #{index + 1}</h4>
                                            {tickets.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeTicket(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div>
                                            <Label>Función <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={ticket.event_function_id.toString()}
                                                onValueChange={(value) => updateTicket(index, 'event_function_id', parseInt(value))}
                                            >
                                                <SelectTrigger className='text-start'>
                                                    <SelectValue placeholder="Selecciona una función" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(eventFunctions || []).map((func) => {
                                                        const funcion = func;
                                                        console.log('Funcion:',funcion);
                                                        return (
                                                        <SelectItem key={func.id} value={func.id.toString()} >
                                                            <div className="flex items-center gap-2">
                                                                <div>
                                                                    <p className="font-medium">{func.name}</p>
                                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar className="w-3 h-3" />
                                                                            {func.date}
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            {func.time}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    )})}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {ticket.event_function_id > 0 && (
                                            <div>
                                                <Label>Tipo de Entrada <span className="text-red-500">*</span></Label>
                                                <Select
                                                    value={ticket.ticket_type_id.toString()}
                                                    onValueChange={(value) => updateTicket(index, 'ticket_type_id', parseInt(value))}
                                                >
                                                    <SelectTrigger className='text-start'>
                                                        <SelectValue placeholder="Selecciona un tipo de entrada" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getTicketTypesForFunction(ticket.event_function_id).map((ticketType) => (
                                                            <SelectItem 
                                                                key={ticketType.id} 
                                                                value={ticketType.id.toString()}
                                                                disabled={ticketType.available === 0}
                                                            >
                                                                <div className="flex items-center gap-6 justify-between w-full">
                                                                    <div>
                                                                        <p className="font-medium">{ticketType.name}</p>
                                                                        <p className="text-sm text-gray-600">
                                                                            {formatCurrency(ticketType.price)}
                                                                        </p>
                                                                    </div>
                                                                    <Badge variant={ticketType.available > 0 ? "secondary" : "destructive"}>
                                                                        {ticketType.available > 0 ? 
                                                                            `${ticketType.available} disponibles` : 
                                                                            'Agotado'
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {ticket.ticket_type_id > 0 && (
                                            <div>
                                                <Label>Cantidad <span className="text-red-500">*</span></Label>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => updateTicket(index, 'quantity', Math.max(1, ticket.quantity - 1))}
                                                        disabled={ticket.quantity <= 1}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max={getSelectedTicketType(ticket.event_function_id, ticket.ticket_type_id)?.available || 1}
                                                        value={ticket.quantity}
                                                        onChange={(e) => updateTicket(index, 'quantity', parseInt(e.target.value) || 1)}
                                                        className="w-20 text-center"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const available = getSelectedTicketType(ticket.event_function_id, ticket.ticket_type_id)?.available || 1;
                                                            updateTicket(index, 'quantity', Math.min(available, ticket.quantity + 1));
                                                        }}
                                                        disabled={ticket.quantity >= (getSelectedTicketType(ticket.event_function_id, ticket.ticket_type_id)?.available || 1)}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {errors.tickets && (
                                    <p className="text-sm text-red-600">{errors.tickets}</p>
                                )}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addTicket}
                                    className="w-full"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agregar Entrada
                                </Button>

                                {totalAmount > 0 && (
                                    <>
                                        <Separator />
                                        <div className="flex items-center justify-between font-semibold text-lg">
                                            <span className="flex items-center gap-2">
                                                <CreditCard className="w-5 h-5" />
                                                Total
                                            </span>
                                            <span>{formatCurrency(totalAmount)}</span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Errores generales */}
                    {(errors as any).general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-700">{(errors as any).general}</p>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex items-center justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(route('organizer.events.attendees', event.id))}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || tickets.length === 0}
                            className="flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            {processing ? 'Invitando...' : 'Invitar Asistente'}
                        </Button>
                    </div>
                </form>
            </div>
        </EventManagementLayout>
    );
}
