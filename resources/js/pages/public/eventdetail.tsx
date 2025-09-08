import { useState } from 'react';
import { formatPrice, formatPriceWithCurrency } from '@/lib/currencyHelpers';
import { getAvailabilityText } from '@/lib/ticketHelpers';
import { formatCreditCardExpiry } from '@/lib/creditCardHelpers';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Star, Minus, Plus, ShoppingCart, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Header from '@/components/header';
import { Head, Link, router } from '@inertiajs/react';

import {
    Event,
    EventFunction,
    TicketType
} from '@/types/'

interface TicketTypeData extends TicketType {
    available: number; 
    color: string;
}

interface EventFunctionData extends EventFunction {
    date: string;
    time: string;
    day_name: string;
    ticketTypes: TicketTypeData[];
}

interface EventData extends Event {
    location: string;
    city: string;
    province: string | null;
    full_address: string;
    category: string;
    functions: EventFunctionData[];
    date: string;
    time: string;
}

interface EventDetailProps {
    eventData: EventData;
}

export default function EventDetail({ eventData }: EventDetailProps) {
    // Estado para la función seleccionada
    const [selectedFunctionId, setSelectedFunctionId] = useState<number>(
        eventData.functions.length > 0 ? eventData.functions[0].id : 0
    );
    
    const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showEventInfo, setShowEventInfo] = useState(false);

    // Obtener la función seleccionada
    const selectedFunction = eventData.functions.find(f => f.id === selectedFunctionId);
    const currentTicketTypes = selectedFunction?.ticketTypes || [];

    // Limpiar tickets seleccionados cuando cambia la función
    const handleFunctionChange = (functionId: string) => {
        setSelectedFunctionId(parseInt(functionId));
        setSelectedTickets({}); // Limpiar selección de tickets
    };

    const handleQuantityChange = (ticketId: number, change: number) => {
        setSelectedTickets(prev => {
            const current = prev[ticketId] || 0;
            const ticketType = currentTicketTypes.find(t => t.id === ticketId);
            
            if (!ticketType) return prev;
            
            // Para bundles, el límite es max_purchase_quantity (no multiplicado)
            const maxAllowed = ticketType.max_purchase_quantity || 10;
            const newQuantity = Math.max(0, Math.min(maxAllowed, current + change));
            
            if (newQuantity === 0) {
                const { [ticketId]: removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [ticketId]: newQuantity };
        });
    };

    const getTotalPrice = () => {
        return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
            const ticket = currentTicketTypes.find((t) => t.id === Number.parseInt(ticketId));
            return total + (ticket ? ticket.price * quantity : 0);
        }, 0);
    };

    const getTotalTickets = () => {
        return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
            const ticket = currentTicketTypes.find((t) => t.id === Number.parseInt(ticketId));
            if (!ticket) return total;
            
            // Si es bundle, mostrar cantidad real de entradas
            const realQuantity = ticket.is_bundle ? quantity * (ticket.bundle_quantity || 1) : quantity;
            return total + realQuantity;
        }, 0);
    };

    const getRealTicketCount = () => {
        return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
            const ticket = currentTicketTypes.find((t) => t.id === Number.parseInt(ticketId));
            if (!ticket) return total;
            
            return total + (ticket.is_bundle ? quantity * (ticket.bundle_quantity || 1) : quantity);
        }, 0);
    };

    const handlePurchase = () => {
        if (getTotalTickets() === 0) {
            alert('Por favor selecciona al menos una entrada');
            return;
        }

        if (!selectedFunction) {
            alert('Por favor selecciona una función');
            return;
        }

        setIsLoading(true);
        
        // Preparar datos para el checkout
        const selectedTicketsData = Object.entries(selectedTickets)
            .filter(([_, quantity]) => quantity > 0)
            .reduce((acc, [ticketId, quantity]) => {
                acc[ticketId] = quantity;
                return acc;
            }, {} as { [key: string]: number });

        // Redirigir al checkout con los datos
        const queryParams = new URLSearchParams({
            function_id: selectedFunction.id.toString(),
            tickets: JSON.stringify(selectedTicketsData)
        });

        setTimeout(() => {
            setIsLoading(false);
            router.visit(`${route('checkout.confirm', eventData.id)}?${queryParams.toString()}`);
        }, 1000);
    };

    return (
        <>
            <Head title={`${eventData.name} - TicketMax`} />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-background">
                {/* Header */}
                <Header />

                <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
                    {/* Back Button */}
                    <div className="mb-4 sm:mb-6">
                        <Link href={route('events')}>
                            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary text-xs sm:text-sm h-8 sm:h-9">
                                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Volver a Eventos</span>
                                <span className="sm:hidden">Volver</span>
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* DESKTOP LAYOUT - Izquierda (lg y superior) */}
                        <div className="hidden lg:block lg:col-span-2 space-y-4 sm:space-y-6">
                            {/* Hero Image */}
                            <div className="relative h-48 sm:h-64 lg:h-80 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-md sm:shadow-lg">
                                <img 
                                    src={eventData.image_url || '/placeholder.jpg'} 
                                    alt={eventData.name} 
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-3 sm:bottom-4 lg:bottom-6 left-3 sm:left-4 lg:left-6">
                                    <Badge className="mb-1 sm:mb-2 bg-primary text-white border-0 text-xs sm:text-sm">
                                        {eventData.category.toUpperCase()}
                                    </Badge>
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 sm:mb-2 leading-tight">
                                        {eventData.name}
                                    </h1>
                                </div>
                            </div>

                            {/* Functions List (if multiple) - MOVIDO ANTES DE EVENT INFO */}
                            {eventData.functions.length > 1 && (
                                <Card className="bg-white border-gray-200 shadow-md sm:shadow-lg">
                                    <CardHeader className="pb-3 sm:pb-4">
                                        <CardTitle className="text-foreground text-lg sm:text-xl">Funciones Disponibles</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                            {eventData.functions.map((func) => (
                                                <div
                                                    key={func.id}
                                                    onClick={() => setSelectedFunctionId(func.id)}
                                                    className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                        selectedFunctionId === func.id
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <h4 className="font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{func.name}</h4>
                                                    <p className="text-foreground/80 text-xs sm:text-sm mb-1 sm:mb-2">{func.description}</p>
                                                    <div className="flex items-center text-foreground/60 text-xs sm:text-sm">
                                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                        <span>{func.date} • {func.time}</span>
                                                    </div>
                                                    <Badge 
                                                        className={`mt-1 sm:mt-2 text-xs ${
                                                            selectedFunctionId === func.id 
                                                                ? 'bg-primary text-white' 
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        {func.ticketTypes.length} tipos de entrada
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Event Info - MOVIDO DESPUÉS DE FUNCTIONS LIST */}
                            <Card className="bg-white border-gray-200 shadow-md sm:shadow-lg">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="text-foreground text-lg sm:text-xl lg:text-2xl">Información del Evento</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 sm:space-y-4">
                                    <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">{eventData.description}</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="flex items-center space-x-2 sm:space-x-3 text-foreground/80">
                                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-foreground text-sm sm:text-base">Fecha y Hora</p>
                                                {selectedFunction ? (
                                                    <p className="text-xs sm:text-sm">{selectedFunction.date} • {selectedFunction.time}</p>
                                                ) : (
                                                    <p className="text-xs sm:text-sm">Selecciona una función</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 sm:space-x-3 text-foreground/80">
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-foreground text-sm sm:text-base">Ubicación</p>
                                                <p className="text-xs sm:text-sm">{eventData.location}, {eventData.city}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* MOBILE LAYOUT - Completo (menor a lg) */}
                        <div className="lg:hidden space-y-4 sm:space-y-6">
                            {/* Hero Image Mobile */}
                            <div className="relative h-48 sm:h-64 rounded-lg sm:rounded-xl overflow-hidden shadow-md sm:shadow-lg">
                                <img 
                                    src={eventData.image_url || '/placeholder.jpg'} 
                                    alt={eventData.name} 
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                                    <Badge className="mb-1 sm:mb-2 bg-primary text-white border-0 text-xs sm:text-sm">
                                        {eventData.category.toUpperCase()}
                                    </Badge>
                                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 leading-tight">
                                        {eventData.name}
                                    </h1>
                                </div>
                            </div>

                            {/* 1. Functions List Mobile (if multiple) */}
                            {eventData.functions.length > 1 && (
                                <Card className="bg-white border-gray-200 shadow-md sm:shadow-lg lg:py-6 py-4 gap-2 lg:gap-6">
                                    <CardHeader className="pb-2 sm:pb-4">
                                        <CardTitle className="text-foreground text-lg sm:text-xl">Funciones Disponibles</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                            {eventData.functions.map((func) => (
                                                <div
                                                    key={func.id}
                                                    onClick={() => setSelectedFunctionId(func.id)}
                                                    className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                        selectedFunctionId === func.id
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <h4 className="font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{func.name}</h4>
                                                    <p className="text-foreground/80 text-xs sm:text-sm mb-1 sm:mb-2">{func.description}</p>
                                                    <div className="flex items-center text-foreground/60 text-xs sm:text-sm">
                                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                        <span>{func.date} • {func.time}</span>
                                                    </div>
                                                    <Badge 
                                                        className={`mt-1 sm:mt-2 text-xs ${
                                                            selectedFunctionId === func.id 
                                                                ? 'bg-primary text-white' 
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        {func.ticketTypes.length} tipos de entrada
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* 2. Ticket Selection Mobile */}
                            <Card className="bg-white border-gray-200 shadow-md sm:shadow-lg lg:py-6 py-4 gap-2 lg:gap-6">
                                <CardHeader>
                                    <CardTitle className="text-foreground text-lg sm:text-xl">Seleccionar Entradas</CardTitle>
                                    {eventData.functions.length > 1 && (
                                        <div className="mt-3 sm:mt-4">
                                            <label className="text-foreground/80 text-xs sm:text-sm font-medium block mb-1 sm:mb-2">
                                                Función:
                                            </label>
                                            <Select value={selectedFunctionId.toString()} onValueChange={handleFunctionChange}>
                                                <SelectTrigger className="bg-white border-gray-300 text-foreground text-xs h-9 sm:h-10">
                                                    <SelectValue placeholder="Selecciona una función" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-gray-300">
                                                    {eventData.functions.map((func) => (
                                                        <SelectItem key={func.id} value={func.id.toString()}>
                                                            <span className="text-xs sm:text-sm">
                                                                {func.name} - {func.date} {func.time}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-3 sm:space-y-4">
                                    {selectedFunction && currentTicketTypes.length > 0 ? (
                                        <>
                                            {/* Información de la función seleccionada */}
                                            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200">
                                                <h4 className="font-semibold text-foreground text-xs sm:text-sm mb-1">
                                                    {selectedFunction.name}
                                                </h4>
                                                <p className="text-foreground/60 text-xs">
                                                    {selectedFunction.date} • {selectedFunction.time}
                                                </p>
                                            </div>

                                            {currentTicketTypes
                                                .filter(ticket => !ticket.is_hidden && ticket.available > 0)
                                                .map((ticket) => {
                                                    const selectedQuantity = selectedTickets[ticket.id] || 0;
                                                    const isBundle = ticket.is_bundle || false;
                                                    const bundleQuantity = ticket.bundle_quantity || 1;
                                                    
                                                    return (
                                                        <div
                                                            key={ticket.id}
                                                            className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                                                        >
                                                            <div className="flex justify-between items-start mb-2 sm:mb-3">
                                                                <div className="min-w-0 flex-1 mr-2">
                                                                    <h4 className="font-bold text-foreground text-sm sm:text-base lg:text-lg">{ticket.name}</h4>
                                                                    <p className="text-foreground/80 text-xs sm:text-sm">{ticket.description}</p>
                                                                    <p className="text-foreground/60 text-xs mt-1">
                                                                        {getAvailabilityText(ticket.available, ticket.quantity)}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right flex-shrink-0">
                                                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                                                                        {formatPrice(ticket.price)}
                                                                    </p>
                                                                    <p className="text-foreground/60 text-xs sm:text-sm">ARS</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-2 sm:space-x-3">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleQuantityChange(ticket.id, -1)}
                                                                        disabled={selectedQuantity === 0}
                                                                        className="w-8 h-8 p-0"
                                                                    >
                                                                        <Minus className="w-4 h-4" />
                                                                    </Button>
                                                                    <span className="w-8 text-center font-semibold">{selectedQuantity}</span>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleQuantityChange(ticket.id, 1)}
                                                                        disabled={selectedQuantity >= (ticket.max_purchase_quantity || 10)}
                                                                        className="w-8 h-8 p-0"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                                {selectedQuantity > 0 && (
                                                                    <div className="text-sm text-foreground/60 mt-1">
                                                                        {isBundle ? (
                                                                            <div>
                                                                                <div>{selectedQuantity} lotes seleccionados</div>
                                                                                <div className="text-blue-600">
                                                                                    = {selectedQuantity * bundleQuantity} entradas
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div>{selectedQuantity} entradas</div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </>
                                    ) : selectedFunction && currentTicketTypes.length === 0 ? (
                                        <div className="text-center py-6 sm:py-8">
                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">No hay entradas disponibles para esta función</p>
                                            <Badge variant="outline" className="border-orange-300 text-orange-600 text-xs sm:text-sm">
                                                Agotado
                                            </Badge>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 sm:py-8">
                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">Selecciona una función para ver las entradas disponibles</p>
                                            <Badge variant="outline" className="border-blue-300 text-blue-600 text-xs sm:text-sm">
                                                Selecciona función
                                            </Badge>
                                        </div>
                                    )}

                                    {getTotalTickets() > 0 && (
                                        <>
                                            <Separator className="bg-gray-200" />
                                            <div className="space-y-2 sm:space-y-3">
                                                <div className="flex justify-between text-foreground text-sm sm:text-base">
                                                    <span>Total de entradas:</span>
                                                    <span className="font-semibold">{getTotalTickets()}</span>
                                                </div>
                                                <div className="flex justify-between text-foreground text-lg sm:text-xl font-bold">
                                                    <span>Total:</span>
                                                    <span>${getTotalPrice().toLocaleString()} ARS</span>
                                                </div>
                                                <Button
                                                    onClick={handlePurchase}
                                                    disabled={isLoading || !selectedFunction}
                                                    className="w-full bg-primary hover:bg-primary-hover text-white py-2 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold rounded-lg sm:rounded-xl transform hover:scale-105 transition-all duration-200 h-10 sm:h-12"
                                                >
                                                    {isLoading ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            <span>Procesando...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-1 sm:space-x-2">
                                                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                                                            <span className="hidden sm:inline">Comprar Entradas</span>
                                                            <span className="sm:hidden">Comprar</span>
                                                        </div>
                                                    )}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* 3. Event Info Mobile - Collapsible */}
                            <Collapsible open={showEventInfo} onOpenChange={setShowEventInfo}>
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full flex items-center justify-between p-3 sm:p-4 bg-white border-gray-200 hover:bg-gray-50 h-auto text-left"
                                    >
                                        <div className="flex items-center space-x-2 sm:space-x-3">
                                            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                            <span className="font-semibold text-foreground text-sm sm:text-base">Ver más información del evento</span>
                                        </div>
                                        {showEventInfo ? (
                                            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/60 flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/60 flex-shrink-0" />
                                        )}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <Card className="bg-white border-gray-200 shadow-md sm:shadow-lg mt-2 lg:py-6 py-4 gap-2 lg:gap-6">
                                        <CardHeader className="pb-3 sm:pb-4">
                                            <CardTitle className="text-foreground text-lg sm:text-xl">Información del Evento</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 sm:space-y-4">
                                            <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">{eventData.description}</p>

                                            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                                <div className="flex items-center space-x-2 sm:space-x-3 text-foreground/80">
                                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-foreground text-sm sm:text-base">Fecha y Hora</p>
                                                        {selectedFunction ? (
                                                            <p className="text-xs sm:text-sm">{selectedFunction.date} • {selectedFunction.time}</p>
                                                        ) : (
                                                            <p className="text-xs sm:text-sm">Selecciona una función</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2 sm:space-x-3 text-foreground/80">
                                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-foreground text-sm sm:text-base">Ubicación</p>
                                                        <p className="text-xs sm:text-sm">{eventData.location}, {eventData.city}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>

                        {/* DESKTOP - Ticket Selection (lg y superior) */}
                        <div className="hidden lg:block space-y-4 sm:space-y-6">
                            <Card className="bg-white border-gray-200 shadow-md sm:shadow-lg sticky top-20 sm:top-24">
                                <CardHeader>
                                    <CardTitle className="text-foreground text-lg sm:text-xl">Seleccionar Entradas</CardTitle>
                                    {eventData.functions.length > 1 && (
                                        <div className="mt-3 sm:mt-4">
                                            <label className="text-foreground/80 text-xs sm:text-sm font-medium block mb-1 sm:mb-2">
                                                Función:
                                            </label>
                                            <Select value={selectedFunctionId.toString()} onValueChange={handleFunctionChange}>
                                                <SelectTrigger className="bg-white border-gray-300 text-foreground text-xs h-9 sm:h-10">
                                                    <SelectValue placeholder="Selecciona una función" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-gray-300">
                                                    {eventData.functions.map((func) => (
                                                        <SelectItem key={func.id} value={func.id.toString()}>
                                                            <span className="text-xs sm:text-sm">
                                                                {func.name} - {func.date} {func.time}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-3 sm:space-y-4">
                                    {selectedFunction && currentTicketTypes.length > 0 ? (
                                        <>
                                            {/* Información de la función seleccionada */}
                                            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200">
                                                <h4 className="font-semibold text-foreground text-xs sm:text-sm mb-1">
                                                    {selectedFunction.name}
                                                </h4>
                                                <p className="text-foreground/60 text-xs">
                                                    {selectedFunction.date} • {selectedFunction.time}
                                                </p>
                                            </div>

                                            {currentTicketTypes
                                                .filter(ticket => !ticket.is_hidden && ticket.available > 0)
                                                .map((ticket) => {
                                                    const selectedQuantity = selectedTickets[ticket.id] || 0;
                                                    const isBundle = ticket.is_bundle || false;
                                                    const bundleQuantity = ticket.bundle_quantity || 1;
                                                    
                                                    return (
                                                        <div
                                                            key={ticket.id}
                                                            className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                                                        >
                                                            <div className="flex justify-between items-start mb-2 sm:mb-3">
                                                                <div className="min-w-0 flex-1 mr-2">
                                                                    <h4 className="font-bold text-foreground text-sm sm:text-base lg:text-lg">{ticket.name}</h4>
                                                                    <p className="text-foreground/80 text-xs sm:text-sm">{ticket.description}</p>
                                                                    <p className="text-foreground/60 text-xs mt-1">
                                                                        {getAvailabilityText(ticket.available, ticket.quantity)}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right flex-shrink-0">
                                                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                                                                        {formatPrice(ticket.price)}
                                                                    </p>
                                                                    <p className="text-foreground/60 text-xs sm:text-sm">ARS</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-2 sm:space-x-3">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleQuantityChange(ticket.id, -1)}
                                                                        disabled={selectedQuantity === 0}
                                                                        className="w-8 h-8 p-0"
                                                                    >
                                                                        <Minus className="w-4 h-4" />
                                                                    </Button>
                                                                    <span className="w-8 text-center font-semibold">{selectedQuantity}</span>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleQuantityChange(ticket.id, 1)}
                                                                        disabled={selectedQuantity >= (ticket.max_purchase_quantity || 10)}
                                                                        className="w-8 h-8 p-0"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                                {selectedQuantity > 0 && (
                                                                    <div className="text-sm text-foreground/60 mt-1">
                                                                        {isBundle ? (
                                                                            <div>
                                                                                <div>{selectedQuantity} lotes seleccionados</div>
                                                                                <div className="text-blue-600">
                                                                                    = {selectedQuantity * bundleQuantity} entradas
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div>{selectedQuantity} entradas</div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </>
                                    ) : selectedFunction && currentTicketTypes.length === 0 ? (
                                        <div className="text-center py-6 sm:py-8">
                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">No hay entradas disponibles para esta función</p>
                                            <Badge variant="outline" className="border-orange-300 text-orange-600 text-xs sm:text-sm">
                                                Agotado
                                            </Badge>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 sm:py-8">
                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">Selecciona una función para ver las entradas disponibles</p>
                                            <Badge variant="outline" className="border-blue-300 text-blue-600 text-xs sm:text-sm">
                                                Selecciona función
                                            </Badge>
                                        </div>
                                    )}

                                    {getTotalTickets() > 0 && (
                                        <>
                                            <Separator className="bg-gray-200" />
                                            <div className="space-y-2 sm:space-y-3">
                                                <div className="flex justify-between text-foreground text-sm sm:text-base">
                                                    <span>Total de entradas:</span>
                                                    <span className="font-semibold">{getTotalTickets()}</span>
                                                </div>
                                                <div className="flex justify-between text-foreground text-lg sm:text-xl font-bold">
                                                    <span>Total:</span>
                                                    <span>${getTotalPrice().toLocaleString()} ARS</span>
                                                </div>
                                                <Button
                                                    onClick={handlePurchase}
                                                    disabled={isLoading || !selectedFunction}
                                                    className="w-full bg-primary hover:bg-primary-hover text-white py-2 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold rounded-lg sm:rounded-xl transform hover:scale-105 transition-all duration-200 h-10 sm:h-12"
                                                >
                                                    {isLoading ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            <span>Procesando...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-1 sm:space-x-2">
                                                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                                                            <span className="hidden sm:inline">Comprar Entradas</span>
                                                            <span className="sm:hidden">Comprar</span>
                                                        </div>
                                                    )}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}