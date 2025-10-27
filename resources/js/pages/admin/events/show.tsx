import { useState } from 'react';
import { router } from '@inertiajs/react';
import { formatNumber } from '@/lib/currencyHelpers';
import { calculateTotalRevenue, calculateSalesPercentage } from '@/lib/ticketHelpers';
import { getVenueCompleteAddress } from '@/lib/venueHelpers';
import { 
    ArrowLeft,
    Calendar, 
    MapPin, 
    Users, 
    DollarSign,
    Clock,
    Star,
    Eye,
    Settings,
    TrendingUp,
    Activity,
    CheckCircle,
    XCircle,
    AlertTriangle,
    MoreVertical,
    Download,
    Edit,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/dateHelpers';
import BackButton from '@/components/Backbutton';

// Interfaces
interface EventFunction {
    id: number;
    name: string;
    description: string;
    start_time: string;
    start_date: string;
    start_time_only: string;
    end_time: string;
    end_date: string;
    end_time_only: string;
    is_active: boolean;
    total_tickets: number;
    function_revenue: number;
    ticket_types: TicketType[];
}

interface TicketType {
    id: number;
    name: string;
    price: number;
    quantity: number;
    quantity_sold: number;
    ticket_revenue: number;
    available: number;
}

interface EventData {
    id: number;
    name: string;
    description: string;
    image_url: string;
    featured: boolean;
    total_revenue: number;
    organizer: {
        id: number;
        name: string;
        email: string;
    };
    category: {
        id: number;
        name: string;
    };
    venue: {
        id: number;
        name: string;
        address: string;
        city: string;
        province?: string; // NUEVO: agregar provincia
        full_address?: string; 
    };
    functions: EventFunction[];
    created_at: string;
    updated_at: string;
}

interface PageProps {
    event: EventData;
    [key: string]: any;
}

export default function Show({ auth }: any) {
    const { event } = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState('overview');

    // Calcular estadísticas del evento
    const totalTickets = event.functions.reduce((sum, func) => 
        sum + func.ticket_types.reduce((funcSum, ticket) => funcSum + ticket.quantity, 0), 0
    );

    const soldTickets = event.functions.reduce((sum, func) => 
        sum + func.ticket_types.reduce((funcSum, ticket) => funcSum + ticket.quantity_sold, 0), 0
    );

    //const totalRevenue = calculateTotalRevenue(event.functions);
    const totalRevenue = event.total_revenue;

    const salesProgress = calculateSalesPercentage(soldTickets, totalTickets);

    // Determinar estado del evento
    const getEventStatus = () => {
        if (event.functions.length === 0) return { label: 'Borrador', color: 'bg-red-500', icon: AlertTriangle };
        
        const now = new Date();
        const hasActiveFuture = event.functions.some(func => 
            func.is_active && new Date(func.start_time) > now
        );
        const hasInactive = event.functions.some(func => !func.is_active);
        const allFinished = event.functions.every(func => new Date(func.start_time) < now);

        if (hasActiveFuture) return { label: 'Activo', color: 'bg-green-500', icon: CheckCircle };
        if (hasInactive && !allFinished) return { label: 'Inactivo', color: 'bg-yellow-500', icon: Clock };
        if (allFinished) return { label: 'Finalizado', color: 'bg-gray-500', icon: XCircle };
        return { label: 'Borrador', color: 'bg-red-500', icon: AlertTriangle };
    };

    const status = getEventStatus();
    const StatusIcon = status.icon;

    const handleToggleFeatured = () => {
        router.patch(route('admin.events.toggle-featured', event.id), {}, {
            preserveScroll: true,
        });
    };

    const handleToggleFunction = (functionId: number) => {
        router.patch(route('admin.events.functions.toggle', functionId), {}, {
            preserveScroll: true,
        });
    };

    const handleViewPublic = () => {
        router.visit(route('event.detail', event.id));
    };

    return (
        <>
            <Head title={`Evento: ${event.name}`} />
            
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-8">
                    {/* Header con navegación */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <BackButton 
                                href={route('admin.events.index')}
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-black">{event.name}</h1>
                                <p className="text-gray-600">
                                    Organizador: {event.organizer.name} • Categoría: {event.category.name}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Button 
                                onClick={handleToggleFeatured}
                                variant={event.featured ? "default" : "outline"}
                                size="sm"
                                className={event.featured 
                                    ? "bg-primary text-white" 
                                    : "border-gray-300"
                                }
                            >
                                <Star className="w-4 h-4 mr-2" />
                                {event.featured ? 'Destacado' : 'Destacar'}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="border-gray-300">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white">
                                        <DropdownMenuItem className="text-gray-700 hover:bg-gray-50" onClick={handleViewPublic}>
                                            <Eye className="w-4 h-4 mr-2" />
                                            Ver como público
                                        </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Estado y estadísticas rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        {/* Estado */}
                        <Card className="bg-white border-gray-200">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 ${status.color} rounded-lg flex items-center justify-center`}>
                                        <StatusIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Estado</p>
                                        <p className="font-semibold text-black">{status.label}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tickets vendidos */}
                        <Card className="bg-white border-gray-200">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-chart-2 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tickets</p>
                                        <p className="font-semibold text-black">{soldTickets}/{totalTickets}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ingresos */}
                        <Card className="bg-white border-gray-200">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-chart-3 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Ingresos</p>
                                        <p className="font-semibold text-black">{formatNumber(totalRevenue)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Progreso de ventas */}
                        <Card className="bg-white border-gray-200">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-chart-4 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Progreso</p>
                                        <p className="font-semibold text-black">{Math.round(salesProgress)}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Funciones */}
                        <Card className="bg-white border-gray-200">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Funciones</p>
                                        <p className="font-semibold text-black">{event.functions.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contenido principal con tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="bg-gray-100 p-1">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-white">
                                Resumen
                            </TabsTrigger>
                            <TabsTrigger value="functions" className="data-[state=active]:bg-white">
                                Funciones
                            </TabsTrigger>
                            <TabsTrigger value="tickets" className="data-[state=active]:bg-white">
                                Tickets
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="data-[state=active]:bg-white">
                                Análisis
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab: Resumen */}
                        <TabsContent value="overview">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Información del evento */}
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="bg-white border-gray-200">
                                        <CardHeader>
                                            <CardTitle className="text-black">Información del Evento</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Banner del evento */}
                                            {event.image_url && (
                                                <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                                                    <img 
                                                        src={event.image_url}
                                                        alt={event.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            
                                            <div>
                                                <h3 className="font-semibold text-black mb-2">Descripción</h3>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {event.description || 'Sin descripción disponible'}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-4">
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Venue</p>
                                                        <p className="font-medium text-black">{event.venue.name}</p>
                                                        <p className="text-sm text-gray-500">{getVenueCompleteAddress(event.venue)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Creado</p>
                                                        <p className="font-medium text-black">{formatDate(event.created_at)}</p>
                                                        <p className="text-sm text-gray-500">Última actualización: {formatRelativeTime(event.updated_at)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Progreso de ventas detallado */}
                                    <Card className="bg-white border-gray-200">
                                        <CardHeader>
                                            <CardTitle className="text-black">Progreso de Ventas</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Tickets vendidos</span>
                                                    <span className="font-semibold text-black">{soldTickets} de {totalTickets}</span>
                                                </div>
                                                <Progress 
                                                    value={salesProgress} 
                                                    className="h-3 [&>div]:bg-primary"
                                                />
                                                <div className="grid grid-cols-3 gap-4 text-center pt-2">
                                                    <div>
                                                        <p className="text-2xl font-bold text-green-600">{soldTickets}</p>
                                                        <p className="text-sm text-gray-600">Vendidos</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-blue-600">{totalTickets - soldTickets}</p>
                                                        <p className="text-sm text-gray-600">Disponibles</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-purple-600">${totalRevenue.toLocaleString()}</p>
                                                        <p className="text-sm text-gray-600">Ingresos</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Información del organizador */}
                                <div className="space-y-6">
                                    <Card className="bg-white border-gray-200">
                                        <CardHeader>
                                            <CardTitle className="text-black">Organizador</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Users className="w-8 h-8 text-white" />
                                                </div>
                                                <h3 className="font-semibold text-black">{event.organizer.name}</h3>
                                                <p className="text-gray-600 text-sm">{event.organizer.email}</p>
                                            </div>
                                            <div className="pt-4 border-t border-gray-200">
                                                <Link href={route('admin.organizers.show', event.organizer.id)}>
                                                    <Button variant="outline" className="w-full border-gray-300">
                                                        Ver perfil del organizador
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Acciones rápidas */}
                                    <Card className="bg-white border-gray-200">
                                        <CardHeader>
                                            <CardTitle className="text-black">Acciones</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <Button 
                                                onClick={handleToggleFeatured}
                                                variant={event.featured ? "default" : "outline"}
                                                className={`w-full ${event.featured ? 'bg-primary text-white' : 'border-gray-300'}`}
                                            >
                                                <Star className="w-4 h-4 mr-2" />
                                                {event.featured ? 'Quitar destacado' : 'Marcar destacado'}
                                            </Button>
                                            
                                            <Button variant="outline" className="w-full border-gray-300" onClick={handleViewPublic}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Ver como público
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab: Funciones */}
                        <TabsContent value="functions">
                            <Card className="bg-white border-gray-200">
                                <CardHeader>
                                    <CardTitle className="text-black">
                                        Funciones del Evento ({event.functions.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {event.functions.length > 0 ? (
                                        <div className="space-y-4">
                                            {event.functions.map((func) => (
                                                <div key={func.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <h3 className="font-semibold text-black">{func.name}</h3>
                                                            <p className="text-gray-600 text-sm">{func.description}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Badge className={func.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                                                                {func.is_active ? 'Activa' : 'Inactiva'}
                                                            </Badge>
                                                            <Button
                                                                onClick={() => handleToggleFunction(func.id)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-gray-300"
                                                            >
                                                                {func.is_active ? 'Desactivar' : 'Activar'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div className="flex items-center space-x-2">
                                                            <Calendar className="w-4 h-4 text-primary" />
                                                            <div>
                                                                <p className="text-gray-600">Inicio</p>
                                                                <p className="font-medium text-black">
                                                                    {formatDate(func.start_date)} • {func.start_time_only}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="w-4 h-4 text-primary" />
                                                            <div>
                                                                <p className="text-gray-600">Fin</p>
                                                                <p className="font-medium text-black">
                                                                    {formatDate(func.end_date)} • {func.end_time_only}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Users className="w-4 h-4 text-primary" />
                                                            <div>
                                                                <p className="text-gray-600">Tipos de ticket</p>
                                                                <p className="font-medium text-black">{func.ticket_types.length}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-black mb-2">No hay funciones</h3>
                                            <p className="text-gray-600">Este evento aún no tiene funciones configuradas.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab: Tickets */}
                        <TabsContent value="tickets">
                            <Card className="bg-white border-gray-200">
                                <CardHeader>
                                    <CardTitle className="text-black">Tipos de Tickets</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {event.functions.some(func => func.ticket_types.length > 0) ? (
                                        <div className="space-y-6">
                                            {event.functions.map((func) => (
                                                func.ticket_types.length > 0 && (
                                                    <div key={func.id}>
                                                        <h3 className="font-semibold text-black mb-3">{func.name}</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {func.ticket_types.map((ticket) => (
                                                                <Card key={ticket.id} className="border-gray-200">
                                                                    <CardContent className="p-4">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <h4 className="font-medium text-black">{ticket.name}</h4>
                                                                            <span className="text-lg font-bold text-primary">
                                                                                ${ticket.price.toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        <div className="space-y-2 text-sm">
                                                                            <div className="flex justify-between">
                                                                                <span className="text-gray-600">Vendidos:</span>
                                                                                <span className="font-medium text-black">{ticket.quantity_sold}</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-gray-600">Disponibles:</span>
                                                                                <span className="font-medium text-black">{ticket.available}</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-gray-600">Total:</span>
                                                                                <span className="font-medium text-black">{ticket.quantity}</span>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="mt-3">
                                                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                                                <span>Progreso</span>
                                                                                <span>{Math.round((ticket.quantity_sold / ticket.quantity) * 100)}%</span>
                                                                            </div>
                                                                            <Progress 
                                                                                value={(ticket.quantity_sold / ticket.quantity) * 100} 
                                                                                className="h-2 [&>div]:bg-primary"
                                                                            />
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-black mb-2">No hay tickets</h3>
                                            <p className="text-gray-600">Este evento aún no tiene tipos de tickets configurados.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab: Análisis */}
                        <TabsContent value="analytics">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="bg-white border-gray-200">
                                    <CardHeader>
                                        <CardTitle className="text-black">Resumen de Ventas</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                                    <p className="text-2xl font-bold text-green-600">{soldTickets}</p>
                                                    <p className="text-sm text-gray-600">Tickets Vendidos</p>
                                                </div>
                                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                    <p className="text-2xl font-bold text-blue-600">${totalRevenue.toLocaleString()}</p>
                                                    <p className="text-sm text-gray-600">Ingresos Totales</p>
                                                </div>
                                            </div>
                                            
                                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                                <p className="text-2xl font-bold text-purple-600">{Math.round(salesProgress)}%</p>
                                                <p className="text-sm text-gray-600">Progreso de Ventas</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-gray-200">
                                    <CardHeader>
                                        <CardTitle className="text-black">Detalles por Función</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {event.functions.map((func) => {
                                                const funcTickets = func.ticket_types.reduce((sum, t) => sum + t.quantity_sold, 0);
                                                
                                                return (
                                                    <div key={func.id} className="p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h4 className="font-medium text-black">{func.name}</h4>
                                                            <Badge className={func.is_active ? 'bg-green-500' : 'bg-red-500'}>
                                                                {func.is_active ? 'Activa' : 'Inactiva'}
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <span className="text-gray-600">Tickets: </span>
                                                                <span className="font-medium text-black">{funcTickets}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">Ingresos: </span>
                                                                <span className="font-medium text-black">${func.function_revenue.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}

// Asignamos el Layout de Administrador
Show.layout = (page: any) => <AppLayout children={page} />;