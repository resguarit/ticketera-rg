import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/currencyHelpers';
import { Search, Calendar, MapPin, Music, Theater, Trophy, Filter, Star, Presentation, Utensils, Palette, Laugh, Users, RotateCcw, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Event, Category } from '@/types/models';
import EventCard from '@/components/EventCard';

// Definir los tipos de datos que llegan del backend
interface EventDetail extends Event {
    date: string;
    time?: string;
    location: string;
    city?: string;
    province?: string; 
    category: string;
    price?: number;
}

interface HomeProps {
    featuredEvents: EventDetail[];
    events: EventDetail[];
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
];

export default function Home({ featuredEvents, events, categories }: HomeProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedCity, setSelectedCity] = useState("all");
    const [sortBy, setSortBy] = useState("date");
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-rotate del carousel cada 5 segundos
    useEffect(() => {
        if (featuredEvents.length > 1) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [featuredEvents.length]);

    // Función para ir al slide anterior
    const goToPreviousSlide = () => {
        setCurrentSlide((prev) => 
            prev === 0 ? featuredEvents.length - 1 : prev - 1
        );
    };

    // Función para ir al slide siguiente
    const goToNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
    };

    // Filtrar y ordenar eventos
    const filteredAndSortedEvents = events
        .filter((event) => {
            const matchesSearch =
                event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "all" || event.category?.toLowerCase() === selectedCategory.toLowerCase();
            const matchesCity = selectedCity === "all" || event.city === selectedCity;

            return matchesSearch && matchesCategory && matchesCity;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "date":
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case "price-low":
                    return (a.price || 0) - (b.price || 0);
                case "price-high":
                    return (b.price || 0) - (a.price || 0);
                case "name":
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

    // Obtener color de categoría
    const getCategoryColor = (categoryName: string) => {
        const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        return category?.color || '#3b82f6';
    };

    // Obtener colores únicos de ciudades para el filtro
    const cities = [...new Set(events.map(event => event.city).filter(Boolean))];

    return (
        <>
            <Head title="Ticketera RG - Eventos" />
            <Header className="" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-background">
                {/* Hero Banner - Eventos destacados con hero banners */}
                <section className="relative h-[160px] sm:h-[200px] lg:h-[300px] overflow-hidden">
                    {featuredEvents.length > 0 ? (
                        <>
                            <div className="absolute inset-0 bg-black/20 z-10"></div>
                            <img
                                src={featuredEvents[currentSlide]?.hero_image_url || featuredEvents[currentSlide]?.image_url || "/placeholder.svg?height=400&width=800"}
                                alt={featuredEvents[currentSlide]?.name || "Evento"}
                                className="w-full h-full object-cover"
                            />

                            {/* Flechas de navegación - solo mostrar si hay más de 1 imagen */}
                            {featuredEvents.length > 1 && (
                                <>
                                    {/* Flecha izquierda */}
                                    <button
                                        onClick={goToPreviousSlide}
                                        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 hover:bg-black/30 text-white rounded-full p-1.5 sm:p-3 transition-all duration-200 hover:scale-110"
                                    >
                                        <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8" />
                                    </button>

                                    {/* Flecha derecha */}
                                    <button
                                        onClick={goToNextSlide}
                                        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 hover:bg-black/30 text-white rounded-full p-1.5 sm:p-3 transition-all duration-200 hover:scale-110"
                                    >
                                        <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8" />
                                    </button>
                                </>
                            )}

                            {/* Slide indicators - solo indicadores visuales, no clickeables */}
                            {featuredEvents.length > 1 && (
                                <div className="absolute bottom-2 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-1 sm:space-x-2">
                                    {featuredEvents.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                                                index === currentSlide ? "bg-white" : "bg-white/40"
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover z-20 flex items-center justify-center">
                            <div className="text-center text-white px-4">
                                <h2 className="text-2xl sm:text-4xl lg:text-5xl mb-2 sm:mb-4 font-bold">¡Bienvenido! (esto es una prueba)</h2>
                                <p className="text-sm sm:text-xl">Descubre los mejores eventos</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Search and Filters */}
                <section className="container mx-auto px-4 py-3 sm:py-6 lg:py-8">
                    <div className="rounded-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
                            <div className="lg:col-span-5">
                                {/* MÓVIL: Solo searchbar y ordenador */}
                                <div className="sm:hidden">
                                    <div className="grid grid-cols-2 gap-2">
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
                                                <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                                                <SelectValue placeholder="Ordenar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="date">Por fecha</SelectItem>
                                                <SelectItem value="name">Por nombre</SelectItem>
                                                <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                                                <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* DESKTOP: Filtros completos con ordenador */}
                                <div className="hidden sm:grid sm:grid-cols-4 gap-3 sm:gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                        <Input
                                            placeholder="Buscar eventos..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8 sm:pl-10 bg-white border-gray-100 border text-gray-400 placeholder:text-gray-500 shadow-md text-xs sm:text-base h-7 sm:h-10"
                                        />
                                    </div>

                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="bg-white border-gray-100 border text-gray-400 placeholder:text-gray-500 shadow-md text-xs sm:text-base h-7 sm:h-10">
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
                                        <SelectTrigger className="bg-white border-gray-100 border text-gray-400 placeholder:text-gray-500 shadow-md text-xs sm:text-base h-7 sm:h-10">
                                            <SelectValue placeholder="Ciudad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas las ciudades</SelectItem>
                                            {cities.filter(city => city).map((city) => (
                                                <SelectItem key={city} value={city!}>
                                                    {city}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="bg-white border-gray-100 border text-gray-400 placeholder:text-gray-500 shadow-md text-xs sm:text-base h-7 sm:h-10">
                                            <ArrowUpDown className="w-4 h-4 mr-2" />
                                            <SelectValue placeholder="Ordenar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="date">Por fecha</SelectItem>
                                            <SelectItem value="name">Por nombre</SelectItem>
                                            <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                                            <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>              
                    </div>
                </section>

                {/* Events Grid */}
                <section className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl text-foreground mb-4 sm:mb-6 lg:mb-8 font-bold px-1">Próximos Eventos</h2>
                    {filteredAndSortedEvents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-12">
                            {filteredAndSortedEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 sm:py-12">
                            <p className="text-base sm:text-lg text-foreground/60 px-4">No se encontraron eventos que coincidan con tu búsqueda.</p>
                        </div>
                    )}
                </section>
            </div>
            
            <Footer />
        </>
    );
}
