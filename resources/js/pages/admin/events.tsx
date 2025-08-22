import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { formatNumber } from '@/lib/currencyHelpers';
import { 
    Eye, 
    Calendar, 
    MapPin, 
    Users, 
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Download,
    Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AdminDashboardLayout, StatCardProps, FilterConfig } from '@/components/admin';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';

// Importar las utilidades de fecha
import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/dateHelpers';

import {
    AdminEvent,
    EventStats,
    PaginatedEvents,
    EventFilters
} from '@/types'

interface PageProps {
    events: PaginatedEvents<AdminEvent>;
    stats: EventStats;
    filters: EventFilters;
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

    // Estado para detectar si hay filtros pendientes de aplicar
    const [hasPendingFilters, setHasPendingFilters] = useState(false);

    // Detectar cambios en los filtros para mostrar indicador
    const checkPendingFilters = () => {
        const hasChanges = 
            searchTerm !== (filters.search || "") ||
            selectedStatus !== (filters.status || "all") ||
            selectedCategory !== (filters.category || "all") ||
            selectedCity !== (filters.city || "all");
        setHasPendingFilters(hasChanges);
    };

    // Llamar checkPendingFilters cuando cambien los filtros locales
    useEffect(() => {
        checkPendingFilters();
    }, [searchTerm, selectedStatus, selectedCategory, selectedCity]);

    // Configuración de estadísticas para el dashboard
    const eventStats: StatCardProps[] = [
        {
            title: "Total Eventos",
            value: stats.total,
            icon: Calendar,
            variant: "primary",
        },
        {
            title: "Eventos Activos",
            value: stats.active,
            icon: CheckCircle,
            variant: "success",
        },
        {
            title: "Tickets Vendidos",
            value: stats.totalTicketsSold,
            icon: Users,
            variant: "warning",
        },
        {
            title: "Ingresos Totales",
            value: stats.totalRevenue,
            icon: DollarSign,
            variant: "info",
            format: "currency",
        },
    ];

    // Configuración de filtros
    const filterConfig: FilterConfig = {
        searchPlaceholder: "Buscar eventos...",
        showStatusFilter: true,
        showCategoryFilter: true,
        showCityFilter: true,
        statusOptions: [
            { value: "all", label: "Todos los estados" },
            { value: "active", label: "Activos" },
            { value: "inactive", label: "Inactivos" },
            { value: "finished", label: "Finalizados" },
            { value: "draft", label: "Borradores" },
        ],
        categoryOptions: categories.map(category => ({ value: category, label: category })),
        cityOptions: cities.map(city => ({ value: city, label: city })),
    };
    // Función para aplicar filtros (solo cuando se presione el botón o Enter)
    const handleFilters = () => {
        setHasPendingFilters(false); // Limpiar indicador de filtros pendientes
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
        setHasPendingFilters(false); // Limpiar indicador de filtros pendientes
        router.get(route('admin.events.index'), {}, {
            preserveState: true,
            replace: true
        });
    };

    // Manejar Enter en búsqueda para aplicar filtros
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
            
            <AdminDashboardLayout
                title="Gestión de Eventos"
                description="Administra todos los eventos de la plataforma"
                stats={eventStats}
                filterConfig={filterConfig}
                secondaryActions={[
                    {
                        label: "Exportar",
                        icon: Download,
                        onClick: () => {/* implementar exportación */},
                        variant: "outline"
                    }
                ]}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
                onApplyFilters={handleFilters}
                onClearFilters={handleClearFilters}
                onKeyPress={handleKeyPress}
                hasPendingFilters={hasPendingFilters}
            >
                {/* Events Table */}
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
                                            {event.image_url ? (
                                                <img 
                                                    src={event.image_url}
                                                    alt={event.name} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-full h-full bg-gray-300 flex items-center justify-center ${event.image_url ? 'hidden' : ''}`}>
                                                <Calendar className="w-8 h-8 text-gray-600" />
                                            </div>
                                        </div>

                                        {/* Event Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-black mb-1 flex items-center space-x-2">
                                                        <span>{event.name}</span>
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
                                                    <span>{formatNumber(event.revenue)}</span>
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
                                                    <span>Categoría: {event.category.name}</span>
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
            </AdminDashboardLayout>
        </>
    );
}

// Asignamos el Layout de Administrador
Events.layout = (page: any) => <AppLayout children={page} />;