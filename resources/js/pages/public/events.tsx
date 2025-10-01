import { useState, useEffect } from 'react';
import { compareDates } from '@/lib/dateHelpers';
import { formatPrice } from '@/lib/currencyHelpers';
import { Search, Calendar, MapPin, Music, Theater, Trophy, Star, Grid, List, BringToFront, Presentation, Utensils, Palette, Laugh, Users, Ticket, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Head, Link, router } from '@inertiajs/react';

import {    
  Event,
  Category,
  Ciudad,
  Venue,
  EventFunction,
} from '@/types/models';

import {
  getCategoryIcon,  
} from '@/types/ui'
import EventCard from '@/components/EventCard';

// Definir los estados basados en el Enum del backend
const eventStatuses = [
    { value: 'on_sale', label: 'A la venta', icon: Ticket },
    { value: 'upcoming', label: 'Próximas', icon: Calendar },
    { value: 'sold_out', label: 'Agotadas', icon: XCircle },
    { value: 'finished', label: 'Finalizadas', icon: CheckCircle },
    { value: 'featured', label: 'Destacados', icon: Star },
];

interface EventDetail extends Event {
    date: string;
    time?: string;
    location: string;
    city?: string;
    province?: string; 
    category: string;
    price: number;
    venue: Venue;
    status: string;
    has_ticket_types: boolean;
    has_free_tickets: boolean;
    functions: EventFunction[];
}

interface PublicEventsPageProps {
    events: EventDetail[];
    categories: Category[];
    cities: Ciudad[];
    filters: {
        search: string;
        category: string;
        city: string;
        sortBy: string;
    };
}

export default function Events({ events, categories, cities, filters }: PublicEventsPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [selectedCategory, setSelectedCategory] = useState(filters.category);
    const [selectedCity, setSelectedCity] = useState(filters.city);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [sortBy, setSortBy] = useState(filters.sortBy);
    
    // Asegurar que events sea un array
    const eventsArray = Array.isArray(events)
        ? events
        : (typeof events === 'object' && events !== null && 'data' in events && Array.isArray((events as any).data)
            ? (events as { data: EventDetail[] }).data
            : []);

    // Filtrar y ordenar eventos en el frontend
    const filteredEvents = eventsArray
        .filter((event) => {
            const matchesSearch =
                event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.venue.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "all" || event.category.toLowerCase() === selectedCategory.toLowerCase();
            const matchesCity = selectedCity === "all" || event.city === selectedCity;
            
            const matchesStatus = selectedStatus === 'all' || 
                                (selectedStatus === 'featured' ? event.featured === true : event.status === selectedStatus);
            
            return matchesSearch && matchesCategory && matchesCity && matchesStatus;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                case "date":
                default:
                    return compareDates(a.date, b.date);
            }
        });

    // Si no hay datos, mostrar mensaje de carga o error
    if (!eventsArray || eventsArray.length === 0) {
        return (
            <>
                <Head title="Eventos" />
                <div className="min-h-screen bg-gradient-to-br from-gray-200 to-background">
                    <Header />
                    <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4">
                        <div className="text-center py-8 sm:py-12">
                            <p className="text-base sm:text-lg text-foreground/60 px-4">
                                {eventsArray === null ? 'Cargando eventos...' : 'No hay eventos disponibles en este momento.'}
                            </p>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Eventos" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-background">
                <Header />
                
                <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4">
                    {/* Filters */}
                    <div className="mb-4 sm:mb-6 lg:mb-8 w-full mt-6">
                        {/* MÓVIL: Solo searchbar y ordenador */}
                        <div className="sm:hidden">
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                    <Input
                                        placeholder="Buscar eventos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 bg-white border-gray-100 border text-gray-400 placeholder:text-gray-500 shadow-md text-xs h-8"
                                    />
                                </div>
                                
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="bg-white border-gray-100 border text-gray-400 placeholder:text-gray-500 shadow-md text-xs h-8">
                                        <SelectValue placeholder="Ordenar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date">Por fecha</SelectItem>
                                        <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                                        <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {/* Información simplificada para móvil */}
                            <div className="text-center mb-4">
                                <span className="text-xs text-foreground/60">{filteredEvents.length} eventos encontrados</span>
                            </div>
                        </div>

                        {/* TABLET: Filtros sin botones de estado (sm a lg) */}
                        <div className="hidden sm:block lg:hidden">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                    <Input
                                        placeholder="Buscar eventos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 sm:pl-10 bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md text-sm sm:text-base h-7 sm:h-10"
                                    />
                                </div>

                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md text-sm sm:text-base h-7 sm:h-10">
                                        <SelectValue placeholder="Categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.name}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedCity} onValueChange={setSelectedCity}>
                                    <SelectTrigger className="bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md text-sm sm:text-base h-7 sm:h-10">
                                        <SelectValue placeholder="Ciudad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las ciudades</SelectItem>
                                        {cities.map((city, id) => (
                                            <SelectItem key={id} value={city.name}>
                                                {city.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md text-sm sm:text-base h-7 sm:h-10">
                                        <SelectValue placeholder="Ordenar por" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date">Ordenar por Fecha</SelectItem>
                                        <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                                        <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {/* Solo contador para tablets */}
                            <div className="text-center mb-4">
                                <span className="text-sm text-foreground/60">{filteredEvents.length} eventos encontrados</span>
                            </div>
                        </div>

                        {/* DESKTOP: Filtros completos CON botones de estado (lg y mayores) */}
                        <div className="hidden lg:block">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                    <Input
                                        placeholder="Buscar eventos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 sm:pl-10 bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md text-sm  h-7 sm:h-10"
                                    />
                                </div>

                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md text-sm sm:text-sm h-7 sm:h-10">
                                        <SelectValue placeholder="Categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.name}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedCity} onValueChange={setSelectedCity}>
                                    <SelectTrigger className="bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md text-sm sm:text-sm h-7 sm:h-10">
                                        <SelectValue placeholder="Ciudad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las ciudades</SelectItem>
                                        {cities.map((city, id) => (
                                            <SelectItem key={id} value={city.name}>
                                                {city.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md text-sm sm:text-sm h-7 sm:h-10">
                                        <SelectValue placeholder="Ordenar por" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date">Ordenar por Fecha</SelectItem>
                                        <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                                        <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Información y filtros de estado - Solo en desktop LG+ */}
                            <div className="flex flex-row items-center justify-between text-foreground space-y-3 sm:space-y-0 mb-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm sm:text-base">{filteredEvents.length} eventos encontrados</span>
                                </div>
                                
                                {/* Filtros de estado - Solo en LG+ */}
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                    {eventStatuses.map((status) => {
                                        const IconComponent = status.icon;
                                        return (
                                            <Button
                                                key={status.value}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedStatus(status.value)}
                                                className={`text-foreground hover:bg-primary hover:text-white text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 ${selectedStatus === status.value ? "bg-primary text-white" : ""}`}
                                            >
                                                <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                                <span>{status.label}</span>
                                            </Button>
                                        );
                                    })}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedStatus("all")}
                                        className={`text-foreground hover:bg-primary hover:text-white text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 ${selectedStatus === "all" ? "bg-primary text-white" : ""}`}
                                    >
                                        <BringToFront className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"/>
                                        Todos
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Events Grid */}
                    <div className="w-full">
                        {filteredEvents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-12">
                                {filteredEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 sm:py-12">
                                <p className="text-base sm:text-lg text-foreground/60 px-4">No se encontraron eventos que coincidan con tu búsqueda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <Footer />
        </>
    );
}