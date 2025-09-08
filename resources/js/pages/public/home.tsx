import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/currencyHelpers';
import { Search, Calendar, MapPin, Music, Theater, Trophy, Filter, Star, Presentation, Utensils, Palette, Laugh, Users, RotateCcw } from 'lucide-react';
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
import { getCategoryIcon } from '@/types/ui';

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

    // Filtrar eventos basado en los criterios de búsqueda
    const filteredEvents = events.filter((event) => {
        const matchesSearch =
            event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || event.category?.toLowerCase() === selectedCategory.toLowerCase();
        const matchesCity = selectedCity === "all" || event.city === selectedCity;

        return matchesSearch && matchesCategory && matchesCity;
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
                {/* Hero Banner - Solo eventos destacados */}
                <section className="relative h-[250px] sm:h-[350px] lg:h-[400px] overflow-hidden">
                    {featuredEvents.length > 0 ? (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
                            <img
                                src={featuredEvents[currentSlide]?.image_url || "/placeholder.svg?height=400&width=800"}
                                alt={featuredEvents[currentSlide]?.name || "Evento"}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 z-20 flex items-center">
                                <div className="container mx-auto px-3 sm:px-4">
                                    <div className="max-w-xl lg:max-w-2xl">
                                        <Badge className="mb-2 sm:mb-4 rounded-sm bg-primary text-white border-0 text-xs sm:text-sm">
                                            Evento Destacado
                                        </Badge>
                                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 sm:mb-4 text-white font-bold leading-tight">
                                            {featuredEvents[currentSlide]?.name}
                                        </h2>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-white mb-4 sm:mb-6 text-sm sm:text-base">
                                            <div className="flex items-center space-x-1 sm:space-x-2">
                                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                                                <span>{featuredEvents[currentSlide]?.date}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 sm:space-x-2">
                                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                                                <span className="truncate">{featuredEvents[currentSlide]?.location}</span>
                                            </div>
                                        </div>
                                        <Link href={`/events/${featuredEvents[currentSlide]?.id}`}>
                                            <button className="bg-primary hover:bg-primary-hover text-white px-4 sm:px-6 py-2 text-sm sm:text-lg font-medium rounded-md transform hover:scale-105 transition-all duration-200">
                                                Comprar Entradas
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Slide indicators */}
                            {featuredEvents.length > 1 && (
                                <div className="absolute bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-1 sm:space-x-2">
                                    {featuredEvents.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                                                index === currentSlide ? "bg-white" : "bg-white/40"
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        // Fallback si no hay eventos destacados
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover z-20 flex items-center justify-center">
                            <div className="text-center text-white px-4">
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-2 sm:mb-4 font-bold">¡Próximamente!</h2>
                                <p className="text-base sm:text-xl">Eventos destacados muy pronto</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Search and Filters */}
                <section className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
                    <div className="rounded-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
                            {/* Filtros principales */}
                            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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

                                <Link href={route('refunds')}>
                                    <Button 
                                        variant="outline" 
                                        className="w-full bg-primary/5 border-primary/20 text-primary/80 hover:bg-primary/10 hover:border-primary text-xs sm:text-sm h-7 sm:h-10 px-2 sm:px-4 gap-1 sm:gap-2"
                                    >
                                        <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="">Botón de arrepentimiento</span>
                                    </Button>
                                </Link>
                            </div>


      

                        </div>              
                    </div>
                </section>

                {/* Events Grid */}
                <section className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl text-foreground mb-4 sm:mb-6 lg:mb-8 font-bold px-1">Próximos Eventos</h2>
                    {filteredEvents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-12">
                            {filteredEvents.map((event) => {
                                const IconComponent = getCategoryIcon(
                                    categories.find(c => c.name.toLocaleLowerCase() === event.category.toLowerCase())?.icon || 'music'
                                );
                                const categoryColor = getCategoryColor(event.category);
                                
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
                                            {/* Icono de categoría con color de la BD */}
                                            <div 
                                                className="absolute top-2 sm:top-4 left-2 sm:left-4 p-1.5 sm:p-2 rounded-full"
                                                style={{ backgroundColor: categoryColor }}
                                            >
                                                <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                            </div>
                                            {/* Estrella para eventos destacados */}
                                            {event.featured && (
                                                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center space-x-1 bg-foreground/80 rounded-full p-1.5 sm:p-2">
                                                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-current" />
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4">
                                            <h4 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-2 line-clamp-2 leading-tight">
                                                {event.name}
                                            </h4>
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
                                                        {event.location}{event.city && `, ${event.city}`}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="min-w-0">
                                                    {event.price ? (
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
                                                    <Button className="bg-primary hover:bg-primary-hover text-white rounded-full px-3 text-xs sm:text-sm lg:text-base h-8 sm:h-9 lg:h-10">
                                                        Comprar
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
                </section>
            </div>
            
            {/* Add Footer */}
            <Footer />
        </>
    );
}
