import { useState } from 'react';
import { Search, Calendar, MapPin, Music, Theater, Trophy, Filter, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import Header from '@/components/header';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
];

const featuredEvents = [
    {
        id: 1,
        title: "Festival de Música Electrónica 2024",
        image: "/placeholder.svg?height=400&width=800",
        date: "15 Mar 2024",
        location: "Estadio Nacional",
        category: "música",
        featured: true,
    },
    {
        id: 2,
        title: "Concierto Sinfónico de Primavera",
        image: "/placeholder.svg?height=400&width=800",
        date: "22 Mar 2024",
        location: "Teatro Colón",
        category: "música",
        featured: true,
    },
    {
        id: 3,
        title: "Copa Mundial de Fútbol",
        image: "/placeholder.svg?height=400&width=800",
        date: "30 Mar 2024",
        location: "Estadio Centenario",
        category: "deportes",
        featured: true,
    },
];

const events = [
    {
        id: 1,
        title: "Festival de Música Electrónica 2024",
        image: "/placeholder.svg?height=300&width=400",
        date: "15 Mar 2024",
        time: "20:00",
        location: "Estadio Nacional",
        city: "Buenos Aires",
        category: "música",
        price: 8500,
        rating: 4.8,
    },
    {
        id: 2,
        title: "Concierto Sinfónico de Primavera",
        image: "/placeholder.svg?height=300&width=400",
        date: "22 Mar 2024",
        time: "19:30",
        location: "Teatro Colón",
        city: "Buenos Aires",
        category: "música",
        price: 12000,
        rating: 4.9,
    },
    {
        id: 3,
        title: "Copa Mundial de Fútbol",
        image: "/placeholder.svg?height=300&width=400",
        date: "30 Mar 2024",
        time: "16:00",
        location: "Estadio Centenario",
        city: "Montevideo",
        category: "deportes",
        price: 15000,
        rating: 4.7,
    },
    {
        id: 4,
        title: "Obra de Teatro: Romeo y Julieta",
        image: "/placeholder.svg?height=300&width=400",
        date: "05 Abr 2024",
        time: "21:00",
        location: "Teatro San Martín",
        city: "Córdoba",
        category: "teatro",
        price: 6500,
        rating: 4.6,
    },
    {
        id: 5,
        title: "Festival de Jazz Internacional",
        image: "/placeholder.svg?height=300&width=400",
        date: "12 Abr 2024",
        time: "18:00",
        location: "Parque Centenario",
        city: "Buenos Aires",
        category: "música",
        price: 9500,
        rating: 4.8,
    },
    {
        id: 6,
        title: "Campeonato de Tenis",
        image: "/placeholder.svg?height=300&width=400",
        date: "20 Abr 2024",
        time: "14:00",
        location: "Club de Tenis",
        city: "Rosario",
        category: "deportes",
        price: 4500,
        rating: 4.5,
    },
];

const categories = [
    { id: "música", label: "Música", icon: Music, color: "from-purple-500 to-pink-500" },
    { id: "teatro", label: "Teatro", icon: Theater, color: "from-orange-500 to-red-500" },
    { id: "deportes", label: "Deportes", icon: Trophy, color: "from-blue-500 to-cyan-500" },
];

export default function Home() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedCity, setSelectedCity] = useState("all");
    const [currentSlide, setCurrentSlide] = useState(0);

    const filteredEvents = events.filter((event) => {
        const matchesSearch =
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
        const matchesCity = selectedCity === "all" || event.city === selectedCity;

        return matchesSearch && matchesCategory && matchesCity;
    });

    const getCategoryIcon = (category: string) => {
        const cat = categories.find((c) => c.id === category);
        return cat ? cat.icon : Music;
    };

    const getCategoryColor = (category: string) => {
        const cat = categories.find((c) => c.id === category);
        return cat ? cat.color : "from-purple-500 to-pink-500";
    };

    return (
        <>
            <Header className="" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ">
                {/* Hero Banner */}
                <section className="relative h-[500px] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
                    <img
                        src={featuredEvents[currentSlide].image}
                        alt={featuredEvents[currentSlide].title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 z-20 flex items-center">
                        <div className="container mx-auto px-4">
                            <div className="max-w-2xl">
                                <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
                                    Evento Destacado
                                </Badge>
                                <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
                                    {featuredEvents[currentSlide].title}
                                </h2>
                                <div className="flex items-center space-x-4 text-white/80 mb-6">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-5 h-5" />
                                        <span>{featuredEvents[currentSlide].date}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="w-5 h-5" />
                                        <span>{featuredEvents[currentSlide].location}</span>
                                    </div>
                                </div>
                                <Link href={`/events/${featuredEvents[currentSlide].id}`}>
                                    <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-3 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-200">
                                        Comprar Entradas
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Slide indicators */}
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
                </section>

                {/* Search and Filters */}
                <section className="container mx-auto px-4 py-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                                <Input
                                    placeholder="Buscar eventos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-cyan-400"
                                />
                            </div>

                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="bg-white/10 border-white/20 text-white">
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
                                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Ciudad" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las ciudades</SelectItem>
                                    <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                                    <SelectItem value="Córdoba">Córdoba</SelectItem>
                                    <SelectItem value="Rosario">Rosario</SelectItem>
                                    <SelectItem value="Montevideo">Montevideo</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white">
                                <Filter className="w-4 h-4 mr-2" />
                                Filtrar
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Events Grid */}
                <section className="container mx-auto px-4 pb-12">
                    <h3 className="text-3xl font-bold text-white mb-8">Próximos Eventos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => {
                            const IconComponent = getCategoryIcon(event.category);
                            return (
                                <Card
                                    key={event.id}
                                    className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group"
                                >
                                    <div className="relative">
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div
                                            className={`absolute top-4 left-4 p-2 rounded-full bg-gradient-to-r ${getCategoryColor(event.category)}`}
                                        >
                                            <IconComponent className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="text-white text-sm">{event.rating}</span>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <h4 className="text-xl font-bold text-white mb-2 line-clamp-2">{event.title}</h4>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-white/80">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                <span className="text-sm">
                                                    {event.date} • {event.time}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-white/80">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                <span className="text-sm">
                                                    {event.location}, {event.city}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-2xl font-bold text-white">${event.price.toLocaleString()}</span>
                                                <span className="text-white/60 text-sm ml-1">ARS</span>
                                            </div>
                                            <Link href={`/events/${event.id}`}>
                                                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-full px-6">
                                                    Comprar
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>
            </div>
</>
    );
}
