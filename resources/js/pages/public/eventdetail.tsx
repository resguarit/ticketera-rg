import { useState, useEffect, useCallback } from 'react';
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
import { formatCurrency } from '@/lib/currencyHelpers';
import HtmlContent from '@/components/ui/rich-text/HtmlContent';

import {
    Event,
    EventFunction,
    TicketType
} from '@/types/'
import Footer from '@/components/footer';

interface TicketTypeData extends TicketType {
    available: number;
    locked_quantity?: number;
    is_sold_out?: boolean; // NUEVO
    color: string;
}

interface VenueData {
    id: number;
    name: string;
    address: string;
    coordinates?: string | null;
    google_maps_url?: string | null; // NUEVO
    full_address: string;
}

interface EventFunctionData extends EventFunction {
    date: string;
    time: string;
    day_name: string;
    status: string;
    status_label: string;
    status_color: string;
    should_show_tickets: boolean; // NUEVO
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
    hero_image_url: string | null;
    venue: VenueData; // Agregar información completa del venue
}

interface EventDetailProps {
    eventData: EventData;
}

// Crear un componente mejorado para el mapa de Google
const GoogleMapEmbed = ({
    coordinates,
    googleMapsUrl,
    venueName,
    venueAddress
}: {
    coordinates?: string | null,
    googleMapsUrl?: string | null,
    venueName: string,
    venueAddress: string
}) => {
    // PRIORIDAD 1: Si existe google_maps_url, extraer coordenadas o usar directamente
    if (googleMapsUrl) {
        // Si ya es una URL de embed, usarla directamente
        if (googleMapsUrl.includes('/maps/embed')) {
            return (
                <div className="relative group">
                    <iframe
                        src={googleMapsUrl}
                        width="100%"
                        height="400px"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="rounded-lg"
                    />
                    <div
                        className="absolute inset-0 bg-transparent cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-lg"
                        onClick={() => window.open(googleMapsUrl.replace('/maps/embed', '/maps'), '_blank')}
                    >
                        <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg">
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">Abrir en Google Maps</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Si es URL normal, intentar extraer coordenadas
        const coordMatch = googleMapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch) {
            const lat = coordMatch[1];
            const lng = coordMatch[2];
            const embedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyD0LnecjX6lkqf5pr7j8GLqiPS6ETeaeSs&q=${lat},${lng}&zoom=15`;

            return (
                <div className="relative group">
                    <iframe
                        src={embedUrl}
                        width="100%"
                        height="400px"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="rounded-lg"
                    />
                    <div
                        className="absolute inset-0 bg-transparent cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-lg"
                        onClick={() => window.open(googleMapsUrl, '_blank')}
                    >
                        <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg">
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">Abrir en Google Maps</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Si no se pueden extraer coordenadas, mostrar botón para abrir
        return (
            <div className="h-[400px] rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-200">
                <div className="text-center">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">{venueName}</p>
                    <p className="text-sm text-gray-600 mb-4">{venueAddress}</p>
                    <Button
                        onClick={() => window.open(googleMapsUrl, '_blank')}
                        className="bg-blue-500 hover:bg-blue-600"
                    >
                        <MapPin className="w-4 h-4 mr-2" />
                        Ver en Google Maps
                    </Button>
                </div>
            </div>
        );
    }

    // PRIORIDAD 2: Si no hay URL pero hay coordenadas, usar coordenadas
    if (coordinates) {
        const [lat, lng] = coordinates.split(',');
        const embedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyD0LnecjX6lkqf5pr7j8GLqiPS6ETeaeSs&q=${lat},${lng}&zoom=15&maptype=roadmap`;
        const openUrl = `https://www.google.com/maps?q=${lat},${lng}`;

        return (
            <div className="relative group">
                <iframe
                    src={embedUrl}
                    width="100%"
                    height="400px"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                />
                <div
                    className="absolute inset-0 bg-transparent cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-lg"
                    onClick={() => window.open(openUrl, '_blank')}
                >
                    <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg">
                        <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Abrir en Google Maps</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // FALLBACK: Si no hay ni URL ni coordenadas
    return (
        <div className="h-[400px] rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
            <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Ubicación no disponible</p>
                <p className="text-xs mt-1">{venueAddress}</p>
            </div>
        </div>
    );
};

export default function EventDetail({ eventData }: EventDetailProps) {
    // Estado para la función seleccionada
    const [selectedFunctionId, setSelectedFunctionId] = useState<number>(
        eventData.functions.length > 0 ? eventData.functions[0].id : 0
    );

    const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showEventInfo, setShowEventInfo] = useState(true);

    // NUEVO: Estado para la disponibilidad actualizada
    const [realTimeAvailability, setRealTimeAvailability] = useState<{ [key: number]: number }>({});
    const [isRefreshingAvailability, setIsRefreshingAvailability] = useState(false);

    // Obtener la función seleccionada
    const selectedFunction = eventData.functions.find(f => f.id === selectedFunctionId);
    const currentTicketTypes = selectedFunction?.ticketTypes || [];

    // Limpiar tickets seleccionados cuando cambia la función
    const handleFunctionChange = (functionId: string) => {
        setSelectedFunctionId(parseInt(functionId));
        setSelectedTickets({}); // Limpiar selección de tickets
    };

    // NUEVO: Función para actualizar disponibilidad en tiempo real
    const updateAvailability = useCallback(async () => {
        if (!selectedFunction || isRefreshingAvailability) return;

        try {
            setIsRefreshingAvailability(true);
            const response = await fetch(`/events/${eventData.id}/availability?function_id=${selectedFunction.id}`);
            const data = await response.json();

            if (data.ticket_types) {
                const availabilityMap: { [key: number]: number } = {};
                data.ticket_types.forEach((ticket: any) => {
                    availabilityMap[ticket.id] = ticket.available;
                });
                setRealTimeAvailability(availabilityMap);
            }
        } catch (error) {
            console.warn('Error updating availability:', error);
        } finally {
            setIsRefreshingAvailability(false);
        }
    }, [eventData.id, selectedFunction, isRefreshingAvailability]);

    // NUEVO: Actualizar disponibilidad automáticamente
    useEffect(() => {
        if (selectedFunction) {
            // Actualizar solo una vez al cargar
            updateAvailability();
        }
    }, [selectedFunction?.id]); // Solo depender del ID de la función, sin updateAvailability

    // NUEVO: Función para obtener la disponibilidad real de un ticket
    const getRealAvailability = (ticket: TicketTypeData): number => {
        return realTimeAvailability[ticket.id] !== undefined
            ? realTimeAvailability[ticket.id]
            : ticket.available;
    };

    // NUEVO: Función para verificar si un ticket está agotado
    const isTicketSoldOut = (ticket: TicketTypeData): boolean => {
        return getRealAvailability(ticket) <= 0;
    };

    // ACTUALIZAR: Función handleQuantityChange para usar disponibilidad real
    const handleQuantityChange = (ticketId: number, change: number) => {
        setSelectedTickets(prev => {
            const current = prev[ticketId] || 0;
            const ticketType = currentTicketTypes.find(t => t.id === ticketId);

            if (!ticketType) return prev;

            // Usar disponibilidad en tiempo real
            const availableQuantity = getRealAvailability(ticketType);
            const maxPurchaseQuantity = ticketType.max_purchase_quantity || 10;
            const maxAllowed = Math.min(availableQuantity, maxPurchaseQuantity);

            // Calcular nueva cantidad con validaciones
            const newQuantity = Math.max(0, Math.min(maxAllowed, current + change));

            if (newQuantity === 0) {
                const { [ticketId]: removed, ...rest } = prev;
                return rest;
            }

            // Actualizar disponibilidad después del cambio
            setTimeout(() => updateAvailability(), 1000);

            return { ...prev, [ticketId]: newQuantity };
        });
    };

    const getAvailabilityStatus = (ticket: TicketTypeData) => {
        const realAvailable = getRealAvailability(ticket);
        const originalAvailable = ticket.available;

        if (realAvailable < originalAvailable) {
            const lockedQuantity = originalAvailable - realAvailable;
            return {
                showLocked: true,
                lockedQuantity,
                realAvailable
            };
        }

        return {
            showLocked: false,
            lockedQuantity: 0,
            realAvailable
        };
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

        const payload = {
            function_id: selectedFunction.id.toString(),
            tickets: selectedTicketsData
        }

        const encoded = btoa(JSON.stringify(payload));

        setTimeout(() => {
            setIsLoading(false);
            router.visit(`${route('checkout.confirm', eventData.id)}?data=${encoded}`);
        }, 1000);
    };

    // Función para obtener badge de estado
    const getStatusBadge = (status: string, status_label: string, status_color: string) => {
        const colorMap: Record<string, string> = {
            'green': 'bg-green-500 hover:bg-green-600',
            'blue': 'bg-blue-500 hover:bg-blue-600',
            'red': 'bg-red-500 hover:bg-red-600',
            'gray': 'bg-gray-500 hover:bg-gray-600',
            'yellow': 'bg-yellow-500 hover:bg-yellow-600',
            'orange': 'bg-orange-500 hover:bg-orange-600',
        };

        const badgeColor = colorMap[status_color] || 'bg-gray-500 hover:bg-gray-600';

        return (
            <Badge className={`${badgeColor} text-white border-0 text-xs`}>
                {status_label}
            </Badge>
        );
    };

    useEffect(() => {

        console.log("Session storage: ", sessionStorage);
        const params = new URLSearchParams(window.location.search);
        const refCode = params.get('ref');
        if (refCode) {
            sessionStorage.setItem('referral_code', refCode);
            console.log("Codigo vendedor detectado: ", refCode);
            console.log("Session storage: ", sessionStorage);
        }

    }, []);

    return (
        <>
            <Head title={`${eventData.name}`} />

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
                            {/* Hero Image - Usar hero_image_url primero, luego image_url */}
                            <div>
                                <div className="mb-2 relative h-48 sm:h-64 lg:h-72 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-md sm:shadow-lg">
                                    <img
                                        src={eventData.hero_image_url || eventData.image_url || '/placeholder.jpg'}
                                        alt={eventData.name}
                                        className="w-full h-full object-cover"
                                    />

                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-black  leading-tight">
                                        {eventData.name}
                                    </h1>
                                </div>
                            </div>
                            {/* Functions List (if multiple) - MOVIDO ANTES DE EVENT INFO */}
                            {eventData.functions.length > 1 && (
                                <Card className=" bg-white border-gray-200 shadow-md sm:shadow-lg">
                                    <CardHeader className="pb-3 sm:pb-4">
                                        <CardTitle className="text-foreground text-lg sm:text-xl">Funciones Disponibles</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                            {eventData.functions.map((func) => (
                                                <div
                                                    key={func.id}
                                                    onClick={() => setSelectedFunctionId(func.id)}
                                                    className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedFunctionId === func.id
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
                                                    <div className="flex items-center justify-between mt-2">
                                                        <Badge
                                                            className={`text-xs ${selectedFunctionId === func.id
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 text-gray-600'
                                                                }`}
                                                        >
                                                            {func.ticketTypes.length} tipos de entrada
                                                        </Badge>
                                                        {getStatusBadge(func.status, func.status_label, func.status_color)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Event Info - MOVIDO DESPUÉS DE FUNCTIONS LIST */}
                            <Card className="bg-white border-gray-200 shadow-md sm:shadow-lg gap-2">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="text-foreground text-lg sm:text-xl lg:text-2xl">Información del Evento</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 sm:space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                        <div className="flex items-center space-x-2 sm:space-x-3 text-foreground/80">
                                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                            <div>
                                                <p className="text-xs sm:text-sm">Fecha y Hora</p>
                                                {selectedFunction ? (
                                                    <p className=" font-semibold text-foreground text-sm ">{selectedFunction.date} • {selectedFunction.time}</p>
                                                ) : (
                                                    <p className="text-xs sm:text-sm">Selecciona una función</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 sm:space-x-3 text-foreground/80">
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                                            <div>
                                                <p className="text-xs sm:text-sm">Ubicación</p>
                                                <p className="font-semibold text-foreground text-sm ">{eventData.location}, {eventData.city}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <HtmlContent content={eventData.description || ''} className="text-foreground/80 leading-relaxed text-sm sm:text-base" />



                                </CardContent>
                            </Card>

                            {/* Venue Map Desktop - ACTUALIZADO */}
                            {(eventData.venue.google_maps_url || eventData.venue.coordinates) && (
                                <div>
                                    {/* Mapa con Google Maps Embed */}
                                    <div className="h-64 sm:h-80 rounded-lg overflow-hidden border border-gray-200">
                                        <GoogleMapEmbed
                                            coordinates={eventData.venue.coordinates}
                                            googleMapsUrl={eventData.venue.google_maps_url}
                                            venueName={eventData.venue.name}
                                            venueAddress={eventData.venue.full_address}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* MOBILE LAYOUT - Completo (menor a lg) */}
                        <div className="lg:hidden space-y-4 sm:space-y-6">
                            {/* Hero Image Mobile - Usar hero_image_url primero, luego image_url */}
                            <div>
                                <div className="relative h-48 sm:h-64 rounded-lg sm:rounded-xl overflow-hidden shadow-md sm:shadow-lg mb-2">
                                    <img
                                        src={eventData.hero_image_url || eventData.image_url || '/placeholder.jpg'}
                                        alt={eventData.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-black leading-tight">
                                        {eventData.name}
                                    </h1>
                                </div>
                            </div>

                            {/* 1. Functions List Mobile (if multiple) */}
                            {eventData.functions.length > 1 && (
                                <Card className="hidden lg:block bg-white border-gray-200 shadow-md sm:shadow-lg lg:py-6 py-4 gap-2 lg:gap-6">
                                    <CardHeader className="pb-2 sm:pb-4">
                                        <CardTitle className="text-foreground text-lg sm:text-xl">Funciones Disponibles</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                            {eventData.functions.map((func) => (
                                                <div
                                                    key={func.id}
                                                    onClick={() => setSelectedFunctionId(func.id)}
                                                    className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedFunctionId === func.id
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
                                                    <div className="flex items-center justify-between mt-2">
                                                        <Badge
                                                            className={`text-xs ${selectedFunctionId === func.id
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 text-gray-600'
                                                                }`}
                                                        >
                                                            {func.ticketTypes.length} tipos de entrada
                                                        </Badge>
                                                        {getStatusBadge(func.status, func.status_label, func.status_color)}
                                                    </div>
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
                                {/* MOBILE - Sección de selección de tickets */}
                                <CardContent className="space-y-3 sm:space-y-4">
                                    {selectedFunction ? (
                                        selectedFunction.should_show_tickets ? (
                                            currentTicketTypes.length > 0 ? (
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

                                                    {/* ACTUALIZADO: Mostrar TODOS los tickets, incluidos agotados */}
                                                    {currentTicketTypes
                                                        .filter(ticket => !ticket.is_hidden)
                                                        .map((ticket) => {
                                                            const selectedQuantity = selectedTickets[ticket.id] || 0;
                                                            const isBundle = ticket.is_bundle || false;
                                                            const bundleQuantity = ticket.bundle_quantity || 1;

                                                            const availabilityStatus = getAvailabilityStatus(ticket);
                                                            const realAvailable = availabilityStatus.realAvailable;
                                                            const maxPurchaseQuantity = ticket.max_purchase_quantity || 10;
                                                            const maxAllowed = Math.min(realAvailable, maxPurchaseQuantity);
                                                            const isSoldOut = isTicketSoldOut(ticket);

                                                            return (
                                                                <div
                                                                    key={ticket.id}
                                                                    className={`relative p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-colors overflow-hidden ${
                                                                        isSoldOut
                                                                            ? 'bg-gray-100 border-gray-300 opacity-60'
                                                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    {/* Banner diagonal "AGOTADO" */}
                                                                    {isSoldOut && (
                                                                        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-10">
                                                                            <div className="absolute top-4 -right-8 bg-red-600 text-white text-[10px] font-bold py-1 px-8 transform rotate-45 shadow-lg">
                                                                                AGOTADO
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                                                                        <div className="min-w-0 flex-1 mr-2">
                                                                            <div className="flex items-center space-x-2 mb-1">
                                                                                <h4 className={`font-semibold text-sm sm:text-base lg:text-lg ${
                                                                                    isSoldOut ? 'text-gray-500' : 'text-foreground'
                                                                                }`}>
                                                                                    {ticket.name}
                                                                                </h4>
                                                                                {isRefreshingAvailability && !isSoldOut && (
                                                                                    <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                                                                                )}
                                                                            </div>
                                                                            <p className={`text-xs sm:text-sm ${
                                                                                isSoldOut ? 'text-gray-500' : 'text-foreground/80'
                                                                            }`}>
                                                                                {ticket.description}
                                                                            </p>
                                                                            {!isSoldOut && realAvailable <= 5 && realAvailable > 0 && (
                                                                                <p className="text-red-600 text-xs font-medium mt-1">
                                                                                    ¡Solo quedan {realAvailable} disponibles!
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-right flex-shrink-0">
                                                                            {!isSoldOut ? (
                                                                                <>
                                                                                    <p className={`text-lg sm:text-xl lg:text-2xl font-bold text-foreground`}>
                                                                                        {formatPrice(ticket.price)}
                                                                                    </p>
                                                                                    <p className="text-foreground/60 text-xs sm:text-sm">ARS</p>
                                                                                </>
                                                                            ) : (
                                                                                <div className="text-sm text-gray-500 font-medium">
                                                                                    No disponible
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-2 sm:space-x-3">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => handleQuantityChange(ticket.id, -1)}
                                                                                disabled={selectedQuantity === 0 || isSoldOut}
                                                                                className={`w-8 h-8 p-0 ${isSoldOut ? 'cursor-not-allowed' : ''}`}
                                                                            >
                                                                                <Minus className="w-4 h-4" />
                                                                            </Button>
                                                                            <span className={`w-8 text-center font-semibold ${
                                                                                isSoldOut ? 'text-gray-500' : ''
                                                                            }`}>
                                                                                {selectedQuantity}
                                                                            </span>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => handleQuantityChange(ticket.id, 1)}
                                                                                disabled={selectedQuantity >= maxAllowed || isSoldOut}
                                                                                className={`w-8 h-8 p-0 ${isSoldOut ? 'cursor-not-allowed' : ''}`}
                                                                                title={
                                                                                    isSoldOut
                                                                                        ? 'Agotado'
                                                                                        : selectedQuantity >= maxAllowed
                                                                                        ? `Límite alcanzado (${maxAllowed})`
                                                                                        : `Agregar (máx. ${maxAllowed})`
                                                                                }
                                                                            >
                                                                                <Plus className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                        {selectedQuantity > 0 && !isSoldOut && (
                                                                            <div className="text-sm text-foreground/60 mt-1">
                                                                                {isBundle ? (
                                                                                    <div>
                                                                                        <div>{selectedQuantity} lote{selectedQuantity > 1 ? 's' : ''} seleccionado{selectedQuantity > 1 ? 's' : ''}</div>
                                                                                        <div className="text-blue-600">
                                                                                            = {selectedQuantity * bundleQuantity} entradas
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div>{selectedQuantity} entrada{selectedQuantity > 1 ? 's' : ''}</div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </>
                                            ) : (
                                                <div className="text-center py-6 sm:py-8">
                                                    {selectedFunction.status === 'sold_out' ? (
                                                        <>
                                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                                Las entradas para esta función están agotadas
                                                            </p>
                                                            <Badge variant="outline" className="border-red-300 text-red-600 text-xs sm:text-sm">
                                                                Agotado
                                                            </Badge>
                                                        </>
                                                    ) : selectedFunction.status === 'upcoming' ? (
                                                        <>
                                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                                Las entradas para esta función estarán disponibles próximamente
                                                            </p>
                                                            <Badge variant="outline" className="border-blue-300 text-blue-600 text-xs sm:text-sm">
                                                                Próximamente
                                                            </Badge>
                                                        </>
                                                    ) : selectedFunction.status === 'finished' ? (
                                                        <>
                                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                                Esta función ya ha finalizado
                                                            </p>
                                                            <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs sm:text-sm">
                                                                Finalizada
                                                            </Badge>
                                                        </>
                                                    ) : selectedFunction.status === 'cancelled' ? (
                                                        <>
                                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                                Esta función ha sido cancelada
                                                            </p>
                                                            <Badge variant="outline" className="border-red-300 text-red-600 text-xs sm:text-sm">
                                                                Cancelada
                                                            </Badge>
                                                        </>
                                                    ) : selectedFunction.status === 'reprogrammed' ? (
                                                        <>
                                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                                Esta función ha sido reprogramada
                                                            </p>
                                                            <Badge variant="outline" className="border-orange-300 text-orange-600 text-xs sm:text-sm">
                                                                Reprogramada
                                                            </Badge>
                                                        </>
                                                    ) : selectedFunction.status === 'inactive' ? (
                                                        <>
                                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                                Esta función no está disponible
                                                            </p>
                                                            <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs sm:text-sm">
                                                                No disponible
                                                            </Badge>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                                No hay entradas disponibles para esta función
                                                            </p>
                                                            <Badge variant="outline" className="border-orange-300 text-orange-600 text-xs sm:text-sm">
                                                                Sin disponibilidad
                                                            </Badge>
                                                        </>
                                                    )}
                                                </div>
                                            )
                                        ) : (
                                            // El estado NO permite mostrar tickets (CANCELLED, FINISHED, UPCOMING, INACTIVE)
                                            <div className="text-center py-6 sm:py-8">
                                                {selectedFunction.status === 'cancelled' ? (
                                                    <>
                                                        <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                            Esta función ha sido cancelada
                                                        </p>
                                                        <Badge variant="outline" className="border-red-300 text-red-600 text-xs sm:text-sm">
                                                            Cancelada
                                                        </Badge>
                                                    </>
                                                ) : selectedFunction.status === 'finished' ? (
                                                    <>
                                                        <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                            Esta función ya ha finalizado
                                                        </p>
                                                        <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs sm:text-sm">
                                                            Finalizada
                                                        </Badge>
                                                    </>
                                                ) : selectedFunction.status === 'upcoming' ? (
                                                    <>
                                                        <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                            Las entradas para esta función estarán disponibles próximamente
                                                        </p>
                                                        <Badge variant="outline" className="border-blue-300 text-blue-600 text-xs sm:text-sm">
                                                            Próximamente
                                                        </Badge>
                                                    </>
                                                ) : selectedFunction.status === 'inactive' ? (
                                                    <>
                                                        <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                            Esta función no está disponible en este momento
                                                        </p>
                                                        <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs sm:text-sm">
                                                            No disponible
                                                        </Badge>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                            Esta función no está disponible
                                                        </p>
                                                        <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs sm:text-sm">
                                                            No disponible
                                                        </Badge>
                                                    </>
                                                )}
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center py-6 sm:py-8">
                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                Selecciona una función para ver las entradas disponibles
                                            </p>
                                            <Badge variant="outline" className="border-blue-300 text-blue-600 text-xs sm:text-sm">
                                                Selecciona función
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Total y botón de compra - Solo mostrar si hay tickets seleccionados */}
                                    {getTotalTickets() > 0 && selectedFunction?.should_show_tickets && (
                                        <>
                                            <Separator className="bg-gray-200" />
                                            <div className="space-y-2 sm:space-y-3">
                                                <div className="flex justify-between text-foreground text-sm sm:text-base">
                                                    <span>Total de entradas:</span>
                                                    <span className="font-semibold">{getTotalTickets()}</span>
                                                </div>
                                                <div className="flex justify-between text-foreground text-lg sm:text-xl font-bold">
                                                    <span>Total:</span>
                                                    <span>{formatCurrency(getTotalPrice())}</span>
                                                </div>
                                                <Button
                                                    onClick={handlePurchase}
                                                    disabled={isLoading}
                                                    className="w-full bg-primary hover:bg-primary/90 text-white h-10 sm:h-12 text-sm sm:text-base"
                                                >
                                                    {isLoading ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            <span className="hidden sm:inline">Procesando...</span>
                                                            <span className="sm:hidden">...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-2">
                                                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                                                            <span className="hidden sm:inline">Continuar con la compra</span>
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
                                    <Card className="bg-white border-gray-200 shadow-md sm:shadow-lg mt-2 lg:py-6 py-4 gap-2 ">
                                        <CardHeader className="pb-3 ">
                                            <CardTitle className="text-foreground text-lg sm:text-xl">Información del Evento</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 sm:space-y-4">

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
                                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-foreground text-sm sm:text-base">Ubicación</p>
                                                        <p className="text-xs sm:text-sm">{eventData.location}, {eventData.city}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <HtmlContent content={eventData.description || ''} className="text-foreground/80 leading-relaxed text-sm sm:text-base" />

                                        </CardContent>
                                    </Card>
                                </CollapsibleContent>
                            </Collapsible>

                            {/* Venue Map Mobile */}
                            {(eventData.venue.google_maps_url || eventData.venue.coordinates) && (
                                <div>
                                    {/* Mapa Mobile */}
                                    <div className="h-48 sm:h-64 rounded-lg overflow-hidden border border-gray-200">
                                        <GoogleMapEmbed
                                            coordinates={eventData.venue.coordinates}
                                            googleMapsUrl={eventData.venue.google_maps_url}
                                            venueName={eventData.venue.name}
                                            venueAddress={eventData.venue.full_address}
                                        />
                                    </div>
                                </div>
                            )}
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
                                    {selectedFunction ? (
                                        selectedFunction.should_show_tickets ? (
                                            currentTicketTypes.length > 0 ? (
                                                <>
                                                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200">
                                                        <h4 className="font-semibold text-foreground text-xs sm:text-sm mb-1">
                                                            {selectedFunction.name}
                                                        </h4>
                                                        <p className="text-foreground/60 text-xs">
                                                            {selectedFunction.date} • {selectedFunction.time}
                                                        </p>
                                                    </div>

                                                    {/* ACTUALIZADO: Mostrar TODOS los tickets, incluidos agotados */}
                                                    {currentTicketTypes
                                                        .filter(ticket => !ticket.is_hidden)
                                                        .map((ticket) => {
                                                            const selectedQuantity = selectedTickets[ticket.id] || 0;
                                                            const isBundle = ticket.is_bundle || false;
                                                            const bundleQuantity = ticket.bundle_quantity || 1;

                                                            const availabilityStatus = getAvailabilityStatus(ticket);
                                                            const realAvailable = availabilityStatus.realAvailable;
                                                            const maxPurchaseQuantity = ticket.max_purchase_quantity || 10;
                                                            const maxAllowed = Math.min(realAvailable, maxPurchaseQuantity);
                                                            const isSoldOut = isTicketSoldOut(ticket);

                                                            return (
                                                                <div
                                                                    key={ticket.id}
                                                                    className={`relative p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-colors overflow-hidden ${
                                                                        isSoldOut
                                                                            ? 'bg-gray-100 border-gray-300 opacity-60'
                                                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    {/* Banner diagonal "AGOTADO" */}
                                                                    {isSoldOut && (
                                                                        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-10">
                                                                            <div className="absolute top-4 -right-8 bg-red-600 text-white text-[10px] font-bold py-1 px-8 transform rotate-45 shadow-lg">
                                                                                AGOTADO
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                                                                        <div className="min-w-0 flex-1 mr-2">
                                                                            <div className="flex items-center space-x-2 mb-1">
                                                                                <h4 className={`font-semibold text-sm sm:text-base lg:text-lg ${
                                                                                    isSoldOut ? 'text-gray-500' : 'text-foreground'
                                                                                }`}>
                                                                                    {ticket.name}
                                                                                </h4>
                                                                                {isRefreshingAvailability && !isSoldOut && (
                                                                                    <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                                                                                )}
                                                                            </div>
                                                                            <p className={`text-xs sm:text-sm ${
                                                                                isSoldOut ? 'text-gray-500' : 'text-foreground/80'
                                                                            }`}>
                                                                                {ticket.description}
                                                                            </p>
                                                                            {!isSoldOut && realAvailable <= 5 && realAvailable > 0 && (
                                                                                <p className="text-red-600 text-xs font-medium mt-1">
                                                                                    ¡Solo quedan {realAvailable} disponibles!
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-right flex-shrink-0">
                                                                            {!isSoldOut ? (
                                                                                <>
                                                                                    <p className={`text-lg sm:text-xl lg:text-2xl font-bold text-foreground`}>
                                                                                        {formatPrice(ticket.price)}
                                                                                    </p>
                                                                                    <p className="text-foreground/60 text-xs sm:text-sm">ARS</p>
                                                                                </>
                                                                            ) : (
                                                                                <div className="text-sm text-gray-500 font-medium">
                                                                                    No disponible
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-2 sm:space-x-3">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => handleQuantityChange(ticket.id, -1)}
                                                                                disabled={selectedQuantity === 0 || isSoldOut}
                                                                                className={`w-8 h-8 p-0 ${isSoldOut ? 'cursor-not-allowed' : ''}`}
                                                                            >
                                                                                <Minus className="w-4 h-4" />
                                                                            </Button>
                                                                            <span className={`w-8 text-center font-semibold ${
                                                                                isSoldOut ? 'text-gray-500' : ''
                                                                            }`}>
                                                                                {selectedQuantity}
                                                                            </span>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => handleQuantityChange(ticket.id, 1)}
                                                                                disabled={selectedQuantity >= maxAllowed || isSoldOut}
                                                                                className={`w-8 h-8 p-0 ${isSoldOut ? 'cursor-not-allowed' : ''}`}
                                                                                title={
                                                                                    isSoldOut
                                                                                        ? 'Agotado'
                                                                                        : selectedQuantity >= maxAllowed
                                                                                        ? `Límite alcanzado (${maxAllowed})`
                                                                                        : `Agregar (máx. ${maxAllowed})`
                                                                                }
                                                                            >
                                                                                <Plus className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                        {selectedQuantity > 0 && !isSoldOut && (
                                                                            <div className="text-sm text-foreground/60 mt-1">
                                                                                {isBundle ? (
                                                                                    <div>
                                                                                        <div>{selectedQuantity} lote{selectedQuantity > 1 ? 's' : ''} seleccionado{selectedQuantity > 1 ? 's' : ''}</div>
                                                                                        <div className="text-blue-600">
                                                                                            = {selectedQuantity * bundleQuantity} entradas
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div>{selectedQuantity} entrada{selectedQuantity > 1 ? 's' : ''}</div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </>
                                            ) : (
                                                <div className="text-center py-6 sm:py-8">
                                                    {selectedFunction.status === 'sold_out' ? (
                                                        <>
                                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                                Las entradas para esta función están agotadas
                                                            </p>
                                                            <Badge variant="outline" className="border-red-300 text-red-600 text-xs sm:text-sm">
                                                                Agotado
                                                            </Badge>
                                                        </>
                                                    ) : selectedFunction.status === 'upcoming' ? (
                                                        <>
                                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                                Las entradas para esta función estarán disponibles próximamente
                                                            </p>
                                                            <Badge variant="outline" className="border-blue-300 text-blue-600 text-xs sm:text-sm">
                                                                Próximamente
                                                            </Badge>
                                                        </>
                                                    ) : selectedFunction.status === 'finished' ? (
                                                        <>
                                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                                Esta función ya ha finalizado
                                                            </p>
                                                            <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs sm:text-sm">
                                                                Finalizada
                                                            </Badge>
                                                        </>
                                                    ) : selectedFunction.status === 'cancelled' ? (
                                                        <>
                                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                                Esta función ha sido cancelada
                                                            </p>
                                                            <Badge variant="outline" className="border-red-300 text-red-600 text-xs sm:text-sm">
                                                                Cancelada
                                                            </Badge>
                                                        </>
                                                    ) : selectedFunction.status === 'reprogrammed' ? (
                                                        <>
                                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                                Esta función ha sido reprogramada
                                                            </p>
                                                            <Badge variant="outline" className="border-orange-300 text-orange-600 text-xs sm:text-sm">
                                                                Reprogramada
                                                            </Badge>
                                                        </>
                                                    ) : selectedFunction.status === 'inactive' ? (
                                                        <>
                                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                                Esta función no está disponible
                                                            </p>
                                                            <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs sm:text-sm">
                                                                No disponible
                                                            </Badge>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                                No hay entradas disponibles para esta función
                                                            </p>
                                                            <Badge variant="outline" className="border-orange-300 text-orange-600 text-xs sm:text-sm">
                                                                Sin disponibilidad
                                                            </Badge>
                                                        </>
                                                    )}
                                                </div>
                                            )
                                        ) : (
                                            // El estado NO permite mostrar tickets (CANCELLED, FINISHED, UPCOMING, INACTIVE)
                                            <div className="text-center py-6 sm:py-8">
                                                {selectedFunction.status === 'cancelled' ? (
                                                    <>
                                                        <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                            Esta función ha sido cancelada
                                                        </p>
                                                        <Badge variant="outline" className="border-red-300 text-red-600 text-xs sm:text-sm">
                                                            Cancelada
                                                        </Badge>
                                                    </>
                                                ) : selectedFunction.status === 'finished' ? (
                                                    <>
                                                        <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                            Esta función ya ha finalizado
                                                        </p>
                                                        <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs sm:text-sm">
                                                            Finalizada
                                                        </Badge>
                                                    </>
                                                ) : selectedFunction.status === 'upcoming' ? (
                                                    <>
                                                        <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                            Las entradas para esta función estarán disponibles próximamente
                                                        </p>
                                                        <Badge variant="outline" className="border-blue-300 text-blue-600 text-xs sm:text-sm">
                                                            Próximamente
                                                        </Badge>
                                                    </>
                                                ) : selectedFunction.status === 'inactive' ? (
                                                    <>
                                                        <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                            Esta función no está disponible en este momento
                                                        </p>
                                                        <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs sm:text-sm">
                                                            No disponible
                                                        </Badge>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                            Esta función no está disponible
                                                        </p>
                                                        <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs sm:text-sm">
                                                            No disponible
                                                        </Badge>
                                                    </>
                                                )}
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center py-6 sm:py-8">
                                            <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">
                                                Selecciona una función para ver las entradas disponibles
                                            </p>
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
                                                    <span>{formatCurrency(getTotalPrice())}</span>
                                                </div>
                                                <Button
                                                    onClick={handlePurchase}
                                                    disabled={isLoading}
                                                    className="w-full bg-primary hover:bg-primary/90 text-white h-10 sm:h-12 text-sm sm:text-base"
                                                >
                                                    {isLoading ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            <span className="hidden sm:inline">Procesando...</span>
                                                            <span className="sm:hidden">...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-2">
                                                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                                                            <span className="hidden sm:inline">Continuar con la compra</span>
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
                <Footer />
            </div>
        </>
    );
}