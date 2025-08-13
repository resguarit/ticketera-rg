import { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    Search, 
    Plus, 
    Filter, 
    MoreVertical, 
    Eye, 
    Edit, 
    Trash2, 
    Calendar, 
    MapPin, 
    Users, 
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Download,
    Upload,
    Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

// Importar las utilidades de fecha
import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/dateHelpers';

// Interfaces para datos reales
interface EventOrganizer {
    id: number;
    name: string;
    email: string;
}

interface EventData {
    id: number;
    title: string;
    organizer: EventOrganizer;
    category: string;
    date: string | null; // Ya formateada como Y-m-d
    time: string | null;
    datetime?: string | null; // Para comparaciones si es necesario
    location: string;
    city: string;
    province?: string;
    status: string;
    tickets_sold: number;
    total_tickets: number;
    revenue: number;
    price_range: string;
    created_at: string; // Ya formateada como Y-m-d
    created_datetime?: string | null; // Para comparaciones si es necesario
    image: string | null;
    featured: boolean;
    functions_count: number;
}

interface EventStats {
    total: number;
    active: number;
    inactive: number;
    finished: number;
    draft: number;
    totalTicketsSold: number;
    totalRevenue: number;
}

interface PaginatedEvents {
    data: EventData[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface PageProps {
    events: PaginatedEvents;
    stats: EventStats;
    filters: {
        search: string;
        status: string;
        category: string;
        city: string;
        sort_by: string;
        sort_direction: string;
    };
    categories: string[];
    cities: string[];
    [key: string]: any;
}

export default function Events({ auth }: any) {
    const { events, stats, filters, categories, cities } = usePage<PageProps>().props;

    // Estados para filtros locales
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedStatus, setSelectedStatus] = useState(filters.status || "all");
    const [selectedCategory, setSelectedCategory] = useState(filters.category || "all");
    const [selectedCity, setSelectedCity] = useState(filters.city || "all");
    const [sortBy, setSortBy] = useState(filters.sort_by || "created_at");

    // Función para aplicar filtros
    const handleFilters = () => {
        router.get(route('admin.events.index'), {
            search: searchTerm,
            status: selectedStatus,
            category: selectedCategory,
            city: selectedCity,
            sort_by: sortBy,
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Función para limpiar filtros
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("all");
        setSelectedCategory("all");
        setSelectedCity("all");
        setSortBy("created_at");
        router.get(route('admin.events.index'), {}, {
            preserveState: true,
            replace: true
        });
    };

    // Manejar Enter en búsqueda
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFilters();
        }
    };

    const handleToggleFeatured = (eventId: number) => {
        router.patch(route('admin.events.toggle-featured', eventId), {}, {
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: "Activo", color: "bg-green-500 hover:bg-green-600" },
            inactive: { label: "Inactivo", color: "bg-yellow-500 hover:bg-yellow-600" },
            finished: { label: "Finalizado", color: "bg-gray-500 hover:bg-gray-600" },
            draft: { label: "Borrador", color: "bg-red-500 hover:bg-red-600" }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        
        return (
            <Badge className={`${config.color} text-white border-0`}>
                {config.label}
            </Badge>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active": return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "inactive": return <Clock className="w-4 h-4 text-yellow-500" />;
            case "finished": return <XCircle className="w-4 h-4 text-gray-500" />;
            default: return <AlertTriangle className="w-4 h-4 text-red-500" />;
        }
    };

    return (
        <>
            <Head title="Gestión de Eventos - Panel Admin" />
            
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-black mb-2">
                                Gestión de Eventos
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Administra todos los eventos de la plataforma
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <Button 
                                variant="outline" 
                                className="border-gray-300 text-black hover:bg-gray-50 bg-white"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Exportar
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards - Usando datos reales */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Eventos</p>
                                        <p className="text-2xl font-bold text-black">{stats.total}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Eventos Activos</p>
                                        <p className="text-2xl font-bold text-black">{stats.active}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-chart-2 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Tickets Vendidos</p>
                                        <p className="text-2xl font-bold text-black">{stats.totalTicketsSold.toLocaleString()}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-chart-3 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Ingresos Totales</p>
                                        <p className="text-2xl font-bold text-black">${stats.totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-chart-4 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters - Usando datos reales */}
                    <Card className="bg-white border-gray-200 shadow-lg mb-8">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <Input
                                        placeholder="Buscar eventos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="pl-10 bg-white border-gray-300 text-black placeholder:text-gray-500"
                                    />
                                </div>

                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="bg-white border-gray-300 text-black">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        <SelectItem value="active">Activos</SelectItem>
                                        <SelectItem value="inactive">Inactivos</SelectItem>
                                        <SelectItem value="finished">Finalizados</SelectItem>
                                        <SelectItem value="draft">Borradores</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="bg-white border-gray-300 text-black">
                                        <SelectValue placeholder="Categoría" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedCity} onValueChange={setSelectedCity}>
                                    <SelectTrigger className="bg-white border-gray-300 text-black">
                                        <SelectValue placeholder="Ciudad" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                        <SelectItem value="all">Todas las ciudades</SelectItem>
                                        {cities.map((city) => (
                                            <SelectItem key={city} value={city}>{city}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>



                                <Button 
                                    onClick={handleClearFilters}
                                    variant="outline"
                                    className="border-gray-300 text-black hover:bg-gray-50 bg-white"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Limpiar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Events Table - Usando helpers de fecha */}
                    <Card className="bg-white border-gray-200 shadow-lg">
                        <CardHeader className="border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-black">
                                    Eventos ({events.total})
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {events.data.map((event) => (
                                    <div key={event.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                        <div className="flex items-center space-x-6">
                                            {/* Event Image */}
                                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                {event.image ? (
                                                    <img 
                                                        src={event.image.startsWith('/') ? event.image : `/images/events/${event.image}`}
                                                        alt={event.title} 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`w-full h-full bg-gray-300 flex items-center justify-center ${event.image ? 'hidden' : ''}`}>
                                                    <Calendar className="w-8 h-8 text-gray-600" />
                                                </div>
                                            </div>

                                            {/* Event Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-black mb-1 flex items-center space-x-2">
                                                            <span>{event.title}</span>
                                                            {event.featured && (
                                                                <Badge className="bg-primary text-white border-0 text-xs">
                                                                    Destacado
                                                                </Badge>
                                                            )}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm">
                                                            Por: {event.organizer.name} • {event.organizer.email}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(event.status)}
                                                        {getStatusBadge(event.status)}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                                                        <span>
                                                            {formatDateTime(event.date, event.time)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                                                        <span>{event.location}, {event.city}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <Users className="w-4 h-4 mr-2 text-primary" />
                                                        <span>{event.tickets_sold}/{event.total_tickets} tickets</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 text-sm">
                                                        <DollarSign className="w-4 h-4 mr-2 text-primary" />
                                                        <span>${event.revenue.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                        <span>Progreso de ventas</span>
                                                        <span>{event.total_tickets > 0 ? Math.round((event.tickets_sold / event.total_tickets) * 100) : 0}%</span>
                                                    </div>
                                                    <Progress value={event.total_tickets > 0 ? (event.tickets_sold / event.total_tickets) * 100 : 0} className="h-2" />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span>Rango: ${event.price_range} ARS</span>
                                                        <span>Categoría: {event.category}</span>
                                                        <span>Funciones: {event.functions_count}</span>
                                                        <span>Creado: {formatRelativeTime(event.created_at)}</span>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center space-x-2">
                                                        <Link href={route('admin.events.show', event.id)}>
                                                            <Button variant="outline" size="sm" className="border-gray-300 text-black hover:bg-gray-50">
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                Ver
                                                            </Button>
                                                        </Link>
                                                        

                                                        <Button 
                                                            onClick={() => handleToggleFeatured(event.id)}
                                                            variant={event.featured ? "default" : "outline"}
                                                            size="sm"
                                                            className={event.featured 
                                                                ? "bg-primary hover:bg-primary-hover text-white" 
                                                                : "border-gray-200 text-gray-400 hover:text-primary"
                                                            }
                                                        >
                                                            <Star className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {events.data.length === 0 && (
                                    <div className="text-center py-12">
                                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-black mb-2">No se encontraron eventos</h3>
                                        <p className="text-gray-600">
                                            {searchTerm || selectedStatus !== "all" || selectedCategory !== "all" || selectedCity !== "all"
                                                ? "Prueba ajustando los filtros de búsqueda"
                                                : "Aún no hay eventos creados"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {events.data.length > 0 && (
                                <div className="mt-6 flex justify-center">
                                    <div className="flex items-center space-x-2">
                                        {events.links.map((link, index) => (
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
            </div>
        </>
    );
}

// Asignamos el Layout de Administrador
Events.layout = (page: any) => <AppLayout children={page} />;