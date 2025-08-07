import { useState } from 'react';
import { Search, Calendar, MapPin, Music, Theater, Trophy, Star, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import Header from '@/components/header';
import { Head, Link } from '@inertiajs/react';

const allEvents = [
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
        featured: true,
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
    {
        id: 7,
        title: "Concierto de Rock Nacional",
        image: "/placeholder.svg?height=300&width=400",
        date: "28 Abr 2024",
        time: "21:30",
        location: "Luna Park",
        city: "Buenos Aires",
        category: "música",
        price: 7800,
        rating: 4.7,
    },
    {
        id: 8,
        title: "Espectáculo de Danza Contemporánea",
        image: "/placeholder.svg?height=300&width=400",
        date: "05 May 2024",
        time: "20:00",
        location: "Teatro Municipal",
        city: "Córdoba",
        category: "teatro",
        price: 5500,
        rating: 4.4,
    },
];

const categories = [
    { id: "música", label: "Música", icon: Music, color: "from-purple-500 to-pink-500" },
    { id: "teatro", label: "Teatro", icon: Theater, color: "from-orange-500 to-red-500" },
    { id: "deportes", label: "Deportes", icon: Trophy, color: "from-blue-500 to-cyan-500" },
];

export default function Events() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedCity, setSelectedCity] = useState("all");
    const [sortBy, setSortBy] = useState("date");
    const [viewMode, setViewMode] = useState("grid");

    const filteredEvents = allEvents
        .filter((event) => {
            const matchesSearch =
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
            const matchesCity = selectedCity === "all" || event.city === selectedCity;
            return matchesSearch && matchesCategory && matchesCity;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                case "rating":
                    return b.rating - a.rating;
                case "date":
                default:
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
            }
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
            <Head title="Eventos - TicketMax" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {/* Header */}
                <Header />

                <div className="container mx-auto px-4 py-8">
                    {/* Page Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
                            Todos los Eventos
                        </h1>
                        <p className="text-white/80 text-lg max-w-2xl mx-auto">
                            Descubre los mejores eventos de música, teatro y deportes en tu ciudad
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
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

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Fecha</SelectItem>
                                    <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                                    <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                                    <SelectItem value="rating">Mejor Valorados</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex space-x-2">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                    className="flex-1"
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                    className="flex-1"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-white/80">
                            <span>{filteredEvents.length} eventos encontrados</span>
                            <div className="flex space-x-2">
                                {categories.map((category) => (
                                    <Button
                                        key={category.id}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`text-white hover:bg-white/20 ${selectedCategory === category.id ? "bg-white/20" : ""}`}
                                    >
                                        <category.icon className="w-4 h-4 mr-2" />
                                        {category.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Events Grid/List */}
                    <Tabs value={viewMode} className="w-full">
                        <TabsContent value="grid">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                                {event.featured && (
                                                    <Badge className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
                                                        Destacado
                                                    </Badge>
                                                )}
                                                <div
                                                    className={`absolute top-4 right-4 p-2 rounded-full bg-gradient-to-r ${getCategoryColor(event.category)}`}
                                                >
                                                    <IconComponent className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="absolute bottom-4 right-4 flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
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
                                                            Ver Más
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </TabsContent>

                        <TabsContent value="list">
                            <div className="space-y-4">
                                {filteredEvents.map((event) => {
                                    const IconComponent = getCategoryIcon(event.category);
                                    return (
                                        <Card
                                            key={event.id}
                                            className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300"
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-center space-x-6">
                                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={event.image}
                                                            alt={event.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div
                                                            className={`absolute top-2 right-2 p-1 rounded-full bg-gradient-to-r ${getCategoryColor(event.category)}`}
                                                        >
                                                            <IconComponent className="w-3 h-3 text-white" />
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h4 className="text-xl font-bold text-white mb-1">{event.title}</h4>
                                                                <div className="flex items-center space-x-4 text-white/80 text-sm mb-2">
                                                                    <div className="flex items-center space-x-1">
                                                                        <Calendar className="w-4 h-4" />
                                                                        <span>
                                                                            {event.date} • {event.time}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-1">
                                                                        <MapPin className="w-4 h-4" />
                                                                        <span>
                                                                            {event.location}, {event.city}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-1">
                                                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                                        <span>{event.rating}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-2xl font-bold text-white">${event.price.toLocaleString()}</div>
                                                                <div className="text-white/60 text-sm">ARS</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Link href={`/events/${event.id}`}>
                                                        <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-full px-6">
                                                            Ver Detalles
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}