import { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import { formatCurrency, formatNumber } from '@/lib/currencyHelpers';
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
    Star,
    EyeOff
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
    Event,
    Organizer,
    PaginatedResponse,
    EventFilters
} from '@/types'

interface AdminEvent extends Event {
    organizer: Organizer;
    category: string;
    date: string | null;
    time: string | null;
    datetime: string;
    location: string;
    city: string;
    province: string;
    status: string;
    status_label: string;
    status_color: string;
    is_active: boolean;
    tickets_sold: number;
    total_tickets: number;
    revenue: number;
    price_range: string;
    created_datetime: string;
    functions_count: number;
}

interface EventStats {
    total: number;
    on_sale: number;
    upcoming: number;
    sold_out: number;
    finished: number;
    inactive: number;
    cancelled: number;
    reprogrammed: number;
    draft: number;
    totalTicketsSold: number;
    totalRevenue: number;
}

interface EventStatus {
    value: string;
    label: string;
}

interface PageProps {
    events: PaginatedResponse<AdminEvent>;
    stats: EventStats;
    filters: EventFilters;
    categories: string[];
    cities: string[];
    statuses: EventStatus[];
    [key: string]: any;
}

export default function Events({ auth }: any) {
    const { events, stats, filters, categories, cities, statuses } = usePage<PageProps>().props;

    // Estados para filtros locales
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedStatus, setSelectedStatus] = useState(filters.status || "all");
    const [selectedCategory, setSelectedCategory] = useState(filters.category || "all");
    const [selectedCity, setSelectedCity] = useState(filters.city || "all");
    const [sortBy, setSortBy] = useState(filters.sort_by || "created_at");
    
    // Ref para controlar si es la primera carga
    const isInitialLoad = useRef(true);
    
    // Ref para controlar timeouts de debounce
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Función para aplicar filtros automáticamente
    const applyFilters = useCallback((resetPage = true) => {
        const params: Record<string, any> = {
            search: searchTerm || undefined,
            status: selectedStatus !== "all" ? selectedStatus : undefined,
            category: selectedCategory !== "all" ? selectedCategory : undefined,
            city: selectedCity !== "all" ? selectedCity : undefined,
            sort_by: sortBy !== "created_at" ? sortBy : undefined,
        };

        // Solo resetear página si resetPage es true
        if (!resetPage) {
            params.page = filters.page || 1;
        }

        // Filtrar parámetros undefined
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== undefined)
        );

        router.get(route('admin.events.index'), filteredParams, {
            preserveState: true,
            replace: true,
            only: ['events', 'stats']
        });
    }, [searchTerm, selectedStatus, selectedCategory, selectedCity, sortBy, filters.page]);

    // Aplicar filtros automáticamente cuando cambien los selectores (excepto en la primera carga)
    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }
        
        applyFilters(true); // Resetear página cuando cambian los filtros
    }, [selectedStatus, selectedCategory, selectedCity, sortBy]);

    // Para la búsqueda, aplicar con debounce
    useEffect(() => {
        if (isInitialLoad.current) {
            return;
        }

        // Limpiar timeout anterior
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Si la búsqueda está vacía, aplicar inmediatamente
        if (searchTerm.trim() === '') {
            applyFilters(true);
            return;
        }

        // Aplicar búsqueda con debounce
        searchTimeoutRef.current = setTimeout(() => {
            applyFilters(true); // Resetear página cuando se busca
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm]);

    // Limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Función para manejar la paginación
    const handlePagination = (url: string) => {
        if (!url) return;
        
        router.get(url, {}, {
            preserveState: true,
            replace: true,
            only: ['events']
        });
    };

    // Configuración de estadísticas para el dashboard
    const eventStats: StatCardProps[] = [
        {
            title: "Total Eventos",
            value: stats.total,
            icon: Calendar,
            variant: "primary",
        },
        {
            title: "En Venta",
            value: stats.on_sale,
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

    // Configuración de filtros - Actualizada con los estados del enum
    const filterConfig: FilterConfig = {
        searchPlaceholder: "Buscar eventos...",
        showStatusFilter: true,
        showCategoryFilter: true,
        showCityFilter: true,
        statusOptions: [
            { value: "all", label: "Todos los estados" },
            ...statuses.map(status => ({ value: status.value, label: status.label })),
            { value: "draft", label: "Borradores" },
        ],
        categoryOptions: categories.map(category => ({ value: category, label: category })),
        cityOptions: cities.map(city => ({ value: city, label: city })),
    };

    // Función para limpiar filtros
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("all");
        setSelectedCategory("all");
        setSelectedCity("all");
        setSortBy("created_at");
        
        // Redirigir sin parámetros
        router.get(route('admin.events.index'), {}, {
            preserveState: true,
            replace: true,
            only: ['events', 'stats']
        });
    };

    // Manejar Enter en búsqueda para aplicar inmediatamente
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            // Limpiar timeout y aplicar inmediatamente
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            applyFilters(true);
        }
    };

    const handleToggleFeatured = (eventId: number) => {
        router.patch(route('admin.events.toggle-featured', eventId), {}, {
            preserveScroll: true,
            only: ['events']
        });
    };

    // Función actualizada para usar el enum de estados
    const getEventStatusBadge = (status: string, statusLabel: string, statusColor: string, isActive: boolean) => {
        // Mapeo de colores del enum a clases de Tailwind
        const colorMap: Record<string, string> = {
            'green': 'bg-green-500 hover:bg-green-600',
            'blue': 'bg-blue-500 hover:bg-blue-600',
            'red': 'bg-red-500 hover:bg-red-600',
            'gray': 'bg-gray-500 hover:bg-gray-600',
            'yellow': 'bg-yellow-500 hover:bg-yellow-600',
            'orange': 'bg-orange-500 hover:bg-orange-600',
        };

        const badgeColor = colorMap[statusColor] || 'bg-gray-500 hover:bg-gray-600';
        
        return (
            <div className="flex items-center gap-2">
                <Badge className={`${badgeColor} text-white border-0`}>
                    {statusLabel}
                </Badge>
                {!isActive && (
                    <Badge className="bg-gray-400 hover:bg-gray-500 text-white border-0 text-xs">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Oculto
                    </Badge>
                )}
            </div>
        );
    };

    // Función actualizada para iconos de estado
    const getStatusIcon = (status: string, statusColor: string) => {
        const iconColorMap: Record<string, string> = {
            'green': 'text-green-500',
            'blue': 'text-blue-500',
            'red': 'text-red-500',
            'gray': 'text-gray-500',
            'yellow': 'text-yellow-500',
            'orange': 'text-orange-500',
        };

        const iconColor = iconColorMap[statusColor] || 'text-gray-500';

        switch (status) {
            case "on_sale": return <CheckCircle className={`w-4 h-4 ${iconColor}`} />;
            case "upcoming": return <Clock className={`w-4 h-4 ${iconColor}`} />;
            case "sold_out": return <AlertTriangle className={`w-4 h-4 ${iconColor}`} />;
            case "finished": return <XCircle className={`w-4 h-4 ${iconColor}`} />;
            case "inactive": return <EyeOff className={`w-4 h-4 ${iconColor}`} />;
            case "cancelled": return <XCircle className={`w-4 h-4 ${iconColor}`} />;
            case "reprogrammed": return <Clock className={`w-4 h-4 ${iconColor}`} />;
            case "draft": return <AlertTriangle className={`w-4 h-4 ${iconColor}`} />;
            default: return <AlertTriangle className={`w-4 h-4 ${iconColor}`} />;
        }
    };

    return (
        <>
            <Head title="Gestión de Eventos" />
            
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
                onClearFilters={handleClearFilters}
                onKeyPress={handleKeyPress}
                searchDebounceMs={500}
            >
                {/* Events Table */}
                <Card className="bg-white border-gray-200 shadow-lg">
                    <CardHeader className="border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-black">
                                Eventos ({events.total})
                            </CardTitle>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>En venta: {stats.on_sale}</span>
                                <span>•</span>
                                <span>Próximos: {stats.upcoming}</span>
                                <span>•</span>
                                <span>Agotados: {stats.sold_out}</span>
                                <span>•</span>
                                <span>Finalizados: {stats.finished}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {events.data.map((event) => (
                                <div key={event.id} className="pl-0 py-0 pr-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        {/* Event Image */}
                                        <div className="h-64 md:h-52 md:w-24 w-24  rounded-lg rounded-r-none overflow-hidden flex-shrink-0 border border-gray-200 relative">
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
                                            {!event.is_active && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <EyeOff className="w-6 h-6 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Event Info */}
                                        <div className="flex-1 min-w-0 ">
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-black mb-1 flex items-center space-x-2">
                                                        <span>{event.name}</span>
                                                        {event.featured && (
                                                            <Badge className="bg-secondary text-white border-0 text-xs">
                                                                <Star className="w-3 h-3 mr-1" />
                                                                Destacado
                                                            </Badge>
                                                        )}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm">
                                                        Por: {event.organizer.name} • {event.organizer.email}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(event.status, event.status_color)}
                                                    {getEventStatusBadge(
                                                        event.status,
                                                        event.status_label,
                                                        event.status_color,
                                                        event.is_active
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0  mb-2">
                                                <div className="flex items-center text-gray-700 text-xs sm:text-sm">
                                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                                    <span>
                                                        {event.date && event.time ? formatDateTime(event.date, event.time) : 'Sin fecha'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-gray-700 text-xs sm:text-sm">
                                                    <MapPin className="w-4 h-4 mr-2 text-primary " />
                                                    <span className='truncate'>{event.location}, {event.city}</span>
                                                </div>
                                                <div className="flex items-center text-gray-700 text-xs sm:text-sm">
                                                    <Users className="w-4 h-4 mr-2 text-primary" />
                                                    <span>{event.tickets_sold}/{event.total_tickets} tickets</span>
                                                </div>
                                                <div className="flex items-center text-gray-700 text-xs sm:text-sm">
                                                    <span>{formatCurrency(event.revenue)}</span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            {event.total_tickets > 0 && (
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                        <span>Progreso de ventas</span>
                                                        <span>{Math.round((event.tickets_sold / event.total_tickets) * 100)}%</span>
                                                    </div>
                                                    <Progress 
                                                        value={(event.tickets_sold / event.total_tickets) * 100} 
                                                        className="h-2" 
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col items-start space-y-0 sm:space-y-1 text-xs text-gray-500">
                                                    <span>Rango: ${event.price_range} ARS</span>
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
                                                            ? "bg-secondary hover:bg-secondary/50 text-white" 
                                                            : "border-gray-200 text-gray-400 hover:text-secondary hover:border-secondary"
                                                        }
                                                        title={event.featured ? "Quitar de destacados" : "Marcar como destacado"}
                                                    >
                                                        <Star className={`w-4 h-4 ${event.featured ? 'fill-current' : ''}`} />
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
                                        <button
                                            key={index}
                                            onClick={() => handlePagination(link.url)}
                                            disabled={!link.url}
                                            className={`px-3 py-2 text-sm rounded-md transition-colors ${
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