import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import OrganizerEventCard from '@/components/organizers/event-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, X } from 'lucide-react';
import { Event, Category, Venue, Organizer, EventFunction } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';

interface EventFunctionDetail extends EventFunction {
    date: string;       
    time: string;       
    formatted_date: string; 
    day_name: string;
    status: string;
    status_label: string;
    status_color: string;
}

interface EventDetail extends Event {
    category: Category;
    venue: Venue;
    organizer: Organizer;
    functions: EventFunctionDetail[];
    min_price: number;
    max_price: number;
    next_function_date: string | null;
    functions_count: number;
    status: string;
    status_label: string;
    status_color: string;
    is_active: boolean;
}

interface EventStatus {
    value: string;
    label: string;
}

interface EventsIndexProps {
    auth: any;
    events: EventDetail[];
    categories: Category[];
    venues: Venue[];
    statuses: EventStatus[];
    filters: {
        search: string;
        category_id: string;
        venue_id: string;
        status: string;
        sort_by: string;
        sort_direction: string;
        include_archived: boolean;
        price_min: string;
        price_max: string;
    };
}

export default function EventsIndex({ 
    auth, 
    events = [], 
    categories = [], 
    venues = [], 
    statuses = [],
    filters 
}: EventsIndexProps) {
    const { user } = auth;

    // Estados para filtros locales - con valores por defecto seguros
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [selectedCategory, setSelectedCategory] = useState(filters?.category_id || "all");
    const [selectedVenue, setSelectedVenue] = useState(filters?.venue_id || "all");
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || "all");
    const [sortBy, setSortBy] = useState(filters?.sort_by || "created_at");
    const [sortDirection, setSortDirection] = useState(filters?.sort_direction || "desc");
    const [priceMin, setPriceMin] = useState(filters?.price_min || "");
    const [priceMax, setPriceMax] = useState(filters?.price_max || "");
    const [includeArchived, setIncludeArchived] = useState(filters?.include_archived || false);
    
    // Estado para detectar filtros pendientes
    const [hasPendingFilters, setHasPendingFilters] = useState(false);
    
    // Debounce para la búsqueda
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

    // Detectar cambios en los filtros - con valores por defecto seguros
    useEffect(() => {
        const hasChanges = 
            searchTerm !== (filters?.search || "") ||
            selectedCategory !== (filters?.category_id || "all") ||
            selectedVenue !== (filters?.venue_id || "all") ||
            selectedStatus !== (filters?.status || "all") ||
            sortBy !== (filters?.sort_by || "created_at") ||
            sortDirection !== (filters?.sort_direction || "desc") ||
            priceMin !== (filters?.price_min || "") ||
            priceMax !== (filters?.price_max || "") ||
            includeArchived !== (filters?.include_archived || false);
        
        setHasPendingFilters(hasChanges);
    }, [searchTerm, selectedCategory, selectedVenue, selectedStatus, sortBy, sortDirection, priceMin, priceMax, includeArchived, filters]);

    // Aplicar búsqueda automática con debounce - con verificación
    useEffect(() => {
        if (debouncedSearchTerm !== (filters?.search || "")) {
            applyFilters();
        }
    }, [debouncedSearchTerm]);

    // Aplicar filtros
    const applyFilters = () => {
        const params: any = {};
        
        if (searchTerm) params.search = searchTerm;
        if (selectedCategory !== "all") params.category_id = selectedCategory;
        if (selectedVenue !== "all") params.venue_id = selectedVenue;
        if (selectedStatus !== "all") params.status = selectedStatus;
        if (sortBy !== "created_at") params.sort_by = sortBy;
        if (sortDirection !== "desc") params.sort_direction = sortDirection;
        if (priceMin) params.price_min = priceMin;
        if (priceMax) params.price_max = priceMax;
        if (includeArchived) params.include_archived = includeArchived;

        router.get(route('organizer.events.index'), params, {
            preserveState: true,
            replace: true,
        });
    };

    // Limpiar filtros
    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("all");
        setSelectedVenue("all");
        setSelectedStatus("all");
        setSortBy("created_at");
        setSortDirection("desc");
        setPriceMin("");
        setPriceMax("");
        setIncludeArchived(false);
        
        router.get(route('organizer.events.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    // Manejar cambio de ordenamiento
    const handleSortChange = (value: string) => {
        const [newSortBy, newDirection] = value.split('-');
        setSortBy(newSortBy);
        setSortDirection(newDirection);
        
        // Aplicar inmediatamente
        const params = {
            ...getFilterParams(),
            sort_by: newSortBy,
            sort_direction: newDirection
        };
        
        router.get(route('organizer.events.index'), params, {
            preserveState: true,
            replace: true,
        });
    };

    // Obtener parámetros actuales
    const getFilterParams = () => {
        const params: any = {};
        if (searchTerm) params.search = searchTerm;
        if (selectedCategory !== "all") params.category_id = selectedCategory;
        if (selectedVenue !== "all") params.venue_id = selectedVenue;
        if (selectedStatus !== "all") params.status = selectedStatus;
        if (priceMin) params.price_min = priceMin;
        if (priceMax) params.price_max = priceMax;
        if (includeArchived) params.include_archived = includeArchived;
        return params;
    };

    // Contar filtros activos
    const activeFiltersCount = Object.keys(getFilterParams()).length;

    return (
        <>
            <Head title="Mis Eventos" />

            <div className="container mx-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mis Eventos</h1>
                        <p className="text-gray-600 mt-1">
                            Gestiona y supervisa todos tus eventos
                        </p>
                    </div>
                    <Link href={route('organizer.events.create')}>
                        <Button className="bg-primary hover:bg-primary-hover text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Evento
                        </Button>
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="mb-6">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Buscar eventos por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Category Filter */}
                        <div className="space-y-2">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las categorías" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las categorías</SelectItem>
                                    {categories && categories.length > 0 && categories.map(category => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Venue Filter */}
                        <div className="space-y-2">
                            <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los venues" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los venues</SelectItem>
                                    {venues && venues.length > 0 && venues.map(venue => (
                                        <SelectItem key={venue.id} value={venue.id.toString()}>
                                            {venue.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los estados" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    {statuses && statuses.length > 0 && statuses.map(status => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort Filter */}
                        <div className="space-y-2">
                            <Select value={`${sortBy}-${sortDirection}`} onValueChange={handleSortChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Ordenar por..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created_at-desc">Más recientes</SelectItem>
                                    <SelectItem value="created_at-asc">Más antiguos</SelectItem>
                                    <SelectItem value="name-asc">Nombre A-Z</SelectItem>
                                    <SelectItem value="name-desc">Nombre Z-A</SelectItem>
                                    <SelectItem value="next_function_date-asc">Próximos eventos</SelectItem>
                                    <SelectItem value="next_function_date-desc">Eventos lejanos</SelectItem>
                                    <SelectItem value="min_price-asc">Precio menor a mayor</SelectItem>
                                    <SelectItem value="min_price-desc">Precio mayor a menor</SelectItem>
                                    <SelectItem value="functions_count-desc">Más funciones</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-end mb-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="include_archived"
                                checked={includeArchived}
                                onCheckedChange={checked => setIncludeArchived(checked === true)}
                            />
                            <Label htmlFor="include_archived" className="text-sm font-medium">
                                Incluir archivados
                            </Label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            {activeFiltersCount > 0 && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    <Filter className="w-3 h-3 mr-1" />
                                    {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
                                </Badge>
                            )}
                            {hasPendingFilters && (
                                <Badge variant="outline" className="border-orange-300 text-orange-700">
                                    Filtros pendientes
                                </Badge>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            {(activeFiltersCount > 0 || hasPendingFilters) && (
                                <Button 
                                    onClick={clearFilters}
                                    variant="outline" 
                                    size="sm"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Limpiar
                                </Button>
                            )}
                            {hasPendingFilters && (
                                <Button 
                                    onClick={applyFilters}
                                    size="sm"
                                >
                                    Aplicar filtros
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                        {events.length === 0 
                            ? ""
                            : `${events.length} evento${events.length !== 1 ? 's' : ''} encontrado${events.length !== 1 ? 's' : ''}`
                        }
                    </p>
                </div>

                {/* Events Grid */}
                {events && events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map(event => (
                            <OrganizerEventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-gray-50 rounded-lg p-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No se encontraron eventos
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {activeFiltersCount > 0 
                                    ? "No hay eventos que coincidan con los filtros aplicados. Intenta modificar o limpiar los filtros."
                                    : includeArchived 
                                        ? "No tienes ningún evento, ni siquiera archivado."
                                        : "No tienes eventos activos. Intenta crear uno nuevo o revisa tus eventos archivados."
                                }
                            </p>
                            {activeFiltersCount > 0 ? (
                                <Button onClick={clearFilters} variant="outline">
                                    Limpiar filtros
                                </Button>
                            ) : (
                                <Link href={route('organizer.events.create')}>
                                    <Button className="bg-primary hover:bg-primary-hover text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Crear tu primer evento
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

// Asignamos el Layout de Organizador
EventsIndex.layout = (page: any) => <AppLayout children={page} />;
