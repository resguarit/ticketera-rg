import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Music, Theater, Trophy, Filter, Star, Presentation, Utensils, Palette, Laugh, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import Header from '@/components/header';

// Definir los tipos de datos que llegan del backend
interface Event {
    id: number;
    title: string;
    image: string;
    date: string;
    time?: string;
    location: string;
    city?: string;
    category: string;
    price?: number;
    featured?: boolean;
}

interface Category {
    id: string;
    label: string;
    icon: string;
    color: string;
}

interface HomeProps {
    featuredEvents: Event[];
    events: Event[];
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
];

// Mapeo de iconos ampliado
const iconMap = {
    music: Music,
    theater: Theater,
    trophy: Trophy,
    presentation: Presentation,
    utensils: Utensils,
    palette: Palette,
    laugh: Laugh,
    users: Users,
};

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
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || event.category.toLowerCase() === selectedCategory;
        const matchesCity = selectedCity === "all" || event.city === selectedCity;

        return matchesSearch && matchesCategory && matchesCity;
    });

    // Obtener icono de categoría
    const getCategoryIcon = (iconName: string) => {
        return iconMap[iconName as keyof typeof iconMap] || Music;
    };

    // Obtener color de categoría
    const getCategoryColor = (categoryName: string) => {
        const category = categories.find(c => c.id === categoryName.toLowerCase());
        return category?.color || '#3b82f6';
    };

    // Obtener colores únicos de ciudades para el filtro
    const cities = [...new Set(events.map(event => event.city).filter(Boolean))];

    return (
        <>
            <Head title="Ticketera RG - Eventos" />
            <Header className="" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-secondary">
                {/* Hero Banner - Solo eventos destacados */}
                <section className="relative h-[400px] overflow-hidden">
                    {featuredEvents.length > 0 ? (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
                            <img
                                src={featuredEvents[currentSlide]?.image || "/placeholder.svg?height=400&width=800"}
                                alt={featuredEvents[currentSlide]?.title || "Evento"}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 z-20 flex items-center">
                                <div className="container mx-auto px-4">
                                    <div className="max-w-2xl">
                                        <Badge className="mb-4 rounded-sm bg-primary text-white border-0">
                                            Evento Destacado
                                        </Badge>
                                        <h2 className="text-5xl mb-4 text-white">
                                            {featuredEvents[currentSlide]?.title}
                                        </h2>
                                        <div className="flex items-center space-x-4 text-white mb-6">
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-5 h-5" />
                                                <span>{featuredEvents[currentSlide]?.date}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-5 h-5" />
                                                <span>{featuredEvents[currentSlide]?.location}</span>
                                            </div>
                                        </div>
                                        <Link href={`/events/${featuredEvents[currentSlide]?.id}`}>
                                            <button className="bg-primary hover:bg-primary-hover text-white px-6 py-2 text-lg font-medium rounded-md transform hover:scale-105 transition-all duration-200">
                                                Comprar Entradas
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Slide indicators */}
                            {featuredEvents.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
                                    {featuredEvents.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`w-3 h-3 rounded-full transition-all duration-200 ${
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
                            <div className="text-center text-white">
                                <h2 className="text-5xl mb-4">¡Próximamente!</h2>
                                <p className="text-xl">Eventos destacados muy pronto</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Search and Filters */}
                <section className="container mx-auto px-4 py-8">
                    <div className="rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="Buscar eventos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md"
                                />
                            </div>

                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md">
                                    <SelectValue placeholder="Categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las categorías</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedCity} onValueChange={setSelectedCity}>
                                <SelectTrigger className="bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md">
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

                            <Button className="bg-primary hover:bg-primary-hover text-white">
                                <Filter className="w-4 h-4 mr-2" />
                                Filtrar
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Events Grid */}
                <section className="container mx-auto px-4 pb-12">
                    <h2 className="text-3xl text-foreground mb-8">Próximos Eventos</h2>
                    {filteredEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredEvents.map((event) => {
                                const IconComponent = getCategoryIcon(
                                    categories.find(c => c.id === event.category.toLowerCase())?.icon || 'music'
                                );
                                const categoryColor = getCategoryColor(event.category);
                                
                                return (
                                    <Card
                                        key={event.id}
                                        className="bg-white pt-4 py-0 gap-2 text-foreground overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group"
                                    >
                                        <div className="relative">
                                            <img
                                                src={event.image}
                                                alt={event.title}
                                                className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                            {/* Icono de categoría con color de la BD */}
                                            <div 
                                                className="absolute top-4 left-4 p-2 rounded-full"
                                                style={{ backgroundColor: categoryColor }}
                                            >
                                                <IconComponent className="w-4 h-4 text-white" />
                                            </div>
                                            {/* Estrella para eventos destacados */}
                                            {event.featured && (
                                                <div className="absolute top-4 right-4 flex items-center space-x-1 bg-foreground/80 rounded-full p-2">
                                                    <Star className="w-4 h-4 text-white fill-current" />
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="px-6 pb-4">
                                            <h4 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
                                                {event.title}
                                            </h4>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-foreground/80">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    <span className="text-sm">
                                                        {event.date} {event.time && `• ${event.time}`}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-foreground/80">
                                                    <MapPin className="w-4 h-4 mr-2" />
                                                    <span className="text-sm">
                                                        {event.location}{event.city && `, ${event.city}`}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    {event.price ? (
                                                        <>
                                                            <span className="text-2xl font-bold text-foreground">
                                                                ${event.price.toLocaleString()}
                                                            </span>
                                                            <span className="text-foreground/60 text-sm ml-1">ARS</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-lg font-bold text-foreground">Gratis</span>
                                                    )}
                                                </div>
                                                <Link href={`/events/${event.id}`}>
                                                    <Button className="bg-primary hover:bg-primary-hover text-white rounded-full px-6">
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
                        <div className="text-center py-12">
                            <p className="text-lg text-foreground/60">No se encontraron eventos que coincidan con tu búsqueda.</p>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
