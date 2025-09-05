import { useState, useEffect } from 'react';
import { compareDates } from '@/lib/dateHelpers';
import { formatPrice } from '@/lib/currencyHelpers';
import { Search, Calendar, MapPin, Music, Theater, Trophy, Star, Grid, List, BringToFront, Presentation, Utensils, Palette, Laugh, Users, Ticket, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Head, Link, router } from '@inertiajs/react';

import {    
  Event,
  Category,
  Ciudad,
  Venue,
  EventFunction, // Asegúrate de que este tipo esté definido y sea importado
} from '@/types/models';

import {
  getCategoryIcon,  
} from '@/types/ui'

// Definir los estados basados en el Enum del backend
const eventStatuses = [
    { value: 'on_sale', label: 'A la venta', icon: Ticket },
    { value: 'upcoming', label: 'Próximas', icon: Calendar },
    { value: 'sold_out', label: 'Agotadas', icon: XCircle },
    { value: 'finished', label: 'Finalizadas', icon: CheckCircle },
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
    status: string; // <-- AÑADIR: Estado consolidado del evento
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
    const [selectedStatus, setSelectedStatus] = useState('all'); // <-- AÑADIR: Nuevo estado para el filtro de estado
    const [sortBy, setSortBy] = useState(filters.sortBy);
    const [viewMode, setViewMode] = useState("grid");
    console.log(events)

    // Filtrar y ordenar eventos en el frontend
    const filteredEvents = events
        .filter((event) => {
            const matchesSearch =
                event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.venue.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "all" || event.category.toLowerCase() === selectedCategory.toLowerCase();
            const matchesCity = selectedCity === "all" || event.city === selectedCity;
            // <-- MODIFICAR: Usar el nuevo campo de estado del evento
            const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
            
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

    return (
        <>
            <Head title="Eventos - Ticketera RG" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-background">
                {/* Header */}
                <Header />
                

                <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4">
                    {/* Page Header */}
                    <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-2 sm:mb-4">
                            Todos los Eventos
                        </h2>
                        <p className="text-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
                            Descubre los mejores eventos de música, teatro y deportes en tu ciudad
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="mb-4 sm:mb-6 lg:mb-8 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="relative lg:col-span-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                <Input
                                    placeholder="Buscar eventos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 sm:pl-10 bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md text-sm sm:text-base h-7 sm:h-10"
                                />
                            </div>

                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md text-sm sm:text-base  h-7 sm:h-10">
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
                            <div className="flex flex-row gap-2 w-full">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="bg-white w-1/2 border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md text-sm sm:text-base h-7 sm:h-10">
                                    <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Fecha</SelectItem>
                                    <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                                    <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex space-x-2 w-1/2 sm:space-x-4 sm:col-span-2 md:col-span-1">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`${viewMode === "grid" ? "bg-primary hover:bg-primary-hover text-white" : "bg-white text-primary hover:scale-110"} flex py-2 w-full text-center items-center justify-center shadow-md rounded-md h-7 sm:h-10`}
                                >
                                    <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`${viewMode === "list" ? "bg-primary hover:bg-primary-hover text-white" : "bg-white text-primary hover:scale-110"} flex py-2 w-full text-center items-center justify-center shadow-md rounded-md h-7 sm:h-10`}
                                >
                                    <List className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                            </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-foreground space-y-3 sm:space-y-0">
                            <span className="text-sm sm:text-base">{filteredEvents.length} eventos encontrados</span>
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
                                            <span className="hidden sm:inline">{status.label}</span>
                                            <span className="sm:hidden">{status.label.substring(0, 3)}</span>
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

                    {/* Events Grid/List */}
                    <Tabs value={viewMode} className="w-full">
                        <TabsContent value="grid">
                            {filteredEvents.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                    {filteredEvents.map((event) => {
                                        const IconComponent = getCategoryIcon(
                                            categories.find(c => c.name.toLowerCase() === event.category.toLowerCase())?.icon || 'music'
                                        );
                                        return (
                                            <Card
                                                key={event.id}
                                                className="bg-white py-0 gap-1 sm:gap-2 text-foreground overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group"
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={event.image_url || "/placeholder.svg?height=400&width=800"}
                                                        alt={event.name}
                                                        className="w-full h-40 sm:h-48 lg:h-52 object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    {event.featured && (
                                                        <Badge className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-primary text-white border-0 text-xs sm:text-sm">
                                                            Destacado
                                                        </Badge>
                                                    )}
                                                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 rounded-full bg-primary">
                                                        <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                                    </div>

                                                </div>
                                                <CardContent className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4">
                                                    <h4 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-2 line-clamp-2 leading-tight">{event.name}</h4>
                                                    <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                                                        <div className="flex items-center text-foreground/80">
                                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                                                            <span className="text-xs sm:text-sm truncate">
                                                                {event.date} {event.time && `• ${event.time}`}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-foreground/80">
                                                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                                                            <span className="text-xs sm:text-sm truncate">
                                                                {event.location}, {event.city}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0">
                                                            {event.price > 0 ? (
                                                                <>
                                                                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                                                                        {formatPrice(event.price)}
                                                                    </span>
                                                                    <span className="text-foreground/60 text-xs sm:text-sm ml-1">ARS</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-sm sm:text-base lg:text-lg font-bold text-foreground">Gratis</span>
                                                            )}
                                                        </div>
                                                        <Link href={`/events/${event.id}`}>
                                                            <Button className="bg-primary hover:bg-primary-hover text-white rounded-full px-2 sm:px-2 lg:px-3 text-xs sm:text-sm lg:text-base h-8 sm:h-9 lg:h-10">
                                                                Ver Más
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 sm:py-12">
                                    <p className="text-base sm:text-lg text-foreground/60 px-4">No se encontraron eventos que coincidan con tu búsqueda.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="list">
                            {filteredEvents.length > 0 ? (
                                <div className="space-y-3 sm:space-y-4">
                                    {filteredEvents.map((event) => {
                                        const IconComponent = getCategoryIcon(
                                            categories.find(c => c.name.toLowerCase() === event.category.toLowerCase())?.icon || 'music'
                                        );
                                        return (
                                            <Card
                                                key={event.id}
                                                className="bg-white py-0 overflow-hidden text-foreground hover:transform hover:scale-105 transition-all duration-300"
                                            >
                                                <CardContent className="p-3 pl-0 py-0 sm:p-4 ">
                                                    <div className=" flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
                                                        <div className="relative w-16 h-48 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-l-lg sm:rounded-lg overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={event.image_url || "/placeholder.svg?height=400&width=800"}
                                                                alt={event.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 p-1 rounded-full bg-primary">
                                                                <IconComponent className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 min-w-0 ">
                                                            <div className="flex flex-col  sm:flex-row sm:items-start sm:justify-between">
                                                                <div className="min-w-0 flex-1 ">
                                                                    <h4 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-1 sm:mb-2 line-clamp-2">{event.name}</h4>
                                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-foreground/80 text-xs sm:text-sm mb-2 sm:mb-0 space-y-1 sm:space-y-0">
                                                                        <div className="flex items-center space-x-1">
                                                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                                            <span className="truncate">
                                                                                {event.date} {event.time && `• ${event.time}`}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-1">
                                                                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                                            <span className="truncate">
                                                                                {event.location}, {event.city}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-left sm:text-right mt-2 sm:mt-0 sm:ml-4">
                                                                    {event.price > 0 ? (
                                                                        <>
                                                                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                                                                                {formatPrice(event.price)}
                                                                            </div>
                                                                            <div className="text-foreground/60 text-xs sm:text-sm">ARS</div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="text-base sm:text-lg font-bold text-foreground">Gratis</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Link href={`/events/${event.id}`}>
                                                            <Button className="bg-primary hover:bg-primary-hover text-white rounded-full px-3 sm:px-4 lg:px-6 text-xs sm:text-sm lg:text-base h-8 sm:h-9 lg:h-10 flex-shrink-0">
                                                                <span className="hidden sm:inline">Ver Detalles</span>
                                                                <span className="sm:hidden">Ver</span>
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 sm:py-12">
                                    <p className="text-base sm:text-lg text-foreground/60 px-4">No se encontraron eventos que coincidan con tu búsqueda.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            
            {/* Add Footer */}
            <Footer />
        </>
    );
}