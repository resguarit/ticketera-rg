import { useState } from 'react';
import { router } from '@inertiajs/react';
import { formatCurrency } from '@/lib/currencyHelpers';
import { calculateSalesPercentage } from '@/lib/ticketHelpers';
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
    EyeOff,
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
    status: string;
    status_label: string;
    status_color: string;
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
    hero_image_url: string;
    featured: boolean;
    total_revenue: number;
    net_revenue: number;  // Agregar
    service_fee: number;   // Agregar
    organizer: {
        id: number;
        name: string;
        email: string;
        image_url: string;
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
        province?: string;
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

    const totalRevenue = event.total_revenue;
    const salesProgress = calculateSalesPercentage(soldTickets, totalTickets);

    // Determinar estado del evento basado en prioridad de funciones
    const getEventStatus = () => {
        if (event.functions.length === 0) {
            return { 
                label: 'Borrador', 
                color: 'bg-gray-500', 
                icon: AlertTriangle,
                isActive: false 
            };
        }

        // Orden de prioridad de estados (mismo que en el backend)
        const priorityOrder: Record<string, number> = {
            'on_sale': 1,
            'upcoming': 2,
            'reprogrammed': 3,
            'cancelled': 4,
            'sold_out': 5,
            'inactive': 6,
            'finished': 7,
        };

        // Primero buscar funciones activas
        const activeFunctions = event.functions.filter(f => f.is_active);
        
        let primaryFunction;
        if (activeFunctions.length > 0) {
            // Ordenar funciones activas por prioridad
            primaryFunction = activeFunctions.sort((a, b) => {
                const priorityA = priorityOrder[a.status] ?? 999;
                const priorityB = priorityOrder[b.status] ?? 999;
                return priorityA - priorityB;
            })[0];
        } else {
            // Si no hay funciones activas, tomar la de mayor prioridad
            primaryFunction = event.functions.sort((a, b) => {
                const priorityA = priorityOrder[a.status] ?? 999;
                const priorityB = priorityOrder[b.status] ?? 999;
                return priorityA - priorityB;
            })[0];
        }

        // Mapeo de colores
        const colorMap: Record<string, string> = {
            'green': 'bg-green-500',
            'blue': 'bg-blue-500',
            'red': 'bg-red-500',
            'gray': 'bg-gray-500',
            'yellow': 'bg-yellow-500',
            'orange': 'bg-orange-500',
        };

        // Mapeo de iconos
        const iconMap: Record<string, any> = {
            'on_sale': CheckCircle,
            'upcoming': Clock,
            'reprogrammed': Clock,
            'cancelled': XCircle,
            'sold_out': AlertTriangle,
            'inactive': EyeOff,
            'finished': XCircle,
        };

        const hasAnyActiveFunction = event.functions.some(f => f.is_active);

        return {
            label: primaryFunction.status_label,
            color: colorMap[primaryFunction.status_color] || 'bg-gray-500',
            icon: iconMap[primaryFunction.status] || AlertTriangle,
            isActive: hasAnyActiveFunction
        };
    };

    const status = getEventStatus();
    const StatusIcon = status.icon;

    // Función para obtener badge de función
    const getFunctionStatusBadge = (func: EventFunction) => {
        const colorMap: Record<string, string> = {
            'green': 'bg-green-500 hover:bg-green-600',
            'blue': 'bg-blue-500 hover:bg-blue-600',
            'red': 'bg-red-500 hover:bg-red-600',
            'gray': 'bg-gray-500 hover:bg-gray-600',
            'yellow': 'bg-yellow-500 hover:bg-yellow-600',
            'orange': 'bg-orange-500 hover:bg-orange-600',
        };

        const badgeColor = colorMap[func.status_color] || 'bg-gray-500 hover:bg-gray-600';

        return (
            <div className="flex items-center gap-2">
                <Badge className={`${badgeColor} text-white border-0`}>
                    {func.status_label}
                </Badge>
                {!func.is_active && (
                    <Badge className="bg-gray-400 hover:bg-gray-500 text-white border-0 text-xs">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Oculto
                    </Badge>
                )}
            </div>
        );
    };

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

                    {/* Banners */}
                    <div className='grid grid-cols-4 gap-2 mb-8'>
                        {event.hero_image_url && (
                            <div className='col-span-3'>
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Hero Banner</h3>
                                <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                                    <img 
                                        src={event.hero_image_url}
                                        alt={`${event.name} - Hero Banner`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error('Error loading hero image:', event.hero_image_url);
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        
                        {event.image_url && (
                            <div className='col-span-1'>
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Banner Principal</h3>
                                <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                                    <img 
                                        src={event.image_url}
                                        alt={`${event.name} - Banner`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error('Error loading image:', event.image_url);
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Estado y estadísticas rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mb-8">
                        {/* Estado */}
                        <Card className="bg-white border-gray-200 flex items-center justify-center">
                            <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 ${status.color} rounded-lg flex items-center justify-center`}>
                                        <StatusIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Estado</p>
                                        <p className="font-semibold text-black">{status.label}</p>
                                        {!status.isActive && (
                                            <p className="text-xs text-gray-500">Todas inactivas</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tickets vendidos */}
                        <Card className="bg-white border-gray-200 flex items-center justify-center">
                            <CardContent className="p-3">
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
                        <Card className="bg-white border-gray-200 flex items-center justify-center">
                            <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-chart-3 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Ingresos</p>
                                        <p className="font-semibold text-black">{formatCurrency(totalRevenue)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ingreso Neto */}
                        <Card className="bg-white border-gray-200 flex items-center justify-center">
                            <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-chart-4 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Ingreso Neto</p>
                                        <p className="font-semibold text-black">{formatCurrency(event.net_revenue)}</p>
                                        <p className="text-xs text-gray-500">Cargo: {formatCurrency(event.service_fee)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Funciones */}
                        <Card className="bg-white border-gray-200 flex items-center justify-center">
                            <CardContent className="p-3">
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
                                    <Card className="bg-white border-gray-200 gap-2">
                                        <CardHeader className='pb-0'>
                                            <CardTitle className="text-black">Información del Evento</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="grid grid-cols-2 gap-4 pt-4">
                                                <div>
                                                    <h3 className="font-medium text-sm text-gray-600 mb-1">Descripción</h3>
                                                    <p className="text-black leading-relaxed">
                                                        {event.description || 'Sin descripción disponible'}
                                                    </p>
                                                </div>
                                                <div className="flex items-start space-x-2">
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">Próxima función</p>
                                                        {event.functions.length > 0 ? (
                                                            (() => {
                                                                const now = new Date();
                                                                const upcomingFunctions = event.functions.filter(func => 
                                                                    new Date(func.start_time) > now
                                                                ).sort((a, b) => 
                                                                    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
                                                                );

                                                                if (upcomingFunctions.length > 0) {
                                                                    const nextFunction = upcomingFunctions[0];
                                                                    return (
                                                                        <>
                                                                            <p className="font-medium text-black">
                                                                                {formatDate(nextFunction.start_date)}
                                                                            </p>
                                                                            <p className="text-sm text-black">
                                                                                {nextFunction.start_time_only} • {nextFunction.name}
                                                                            </p>
                                                                        </>
                                                                    );
                                                                } else {
                                                                    const lastFunction = event.functions
                                                                        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())[0];
                                                                    
                                                                    return (
                                                                        <>
                                                                            <p className="font-medium text-black">
                                                                                No hay próximas funciones
                                                                            </p>
                                                                            <p className="text-sm text-black">
                                                                                Última: {formatDate(lastFunction.start_date)}
                                                                            </p>
                                                                        </>
                                                                    );
                                                                }
                                                            })()
                                                        ) : (
                                                            <p className="font-medium text-red-500">Sin funciones programadas</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-4">
                                                <div className="flex items-start space-x-2">
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-600 mb-1">Recinto</p>
                                                        <p className="font-medium text-black">{event.venue.name}</p>
                                                        <p className="text-sm text-black">{getVenueCompleteAddress(event.venue)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-2">
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">Creado</p>
                                                        <p className="font-medium text-black">{formatDate(event.created_at)}</p>
                                                        <p className="text-sm text-black">Última actualización: {formatRelativeTime(event.updated_at)}</p>
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
                                                        <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalRevenue)}</p>
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
                                                    <img src={event.organizer.image_url} alt={event.organizer.name} className="w-full h-full object-cover rounded-full" />
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
                                                            {getFunctionStatusBadge(func)}
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
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h3 className="font-semibold text-black">{func.name}</h3>
                                                            {getFunctionStatusBadge(func)}
                                                        </div>
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
                                                            {getFunctionStatusBadge(func)}
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