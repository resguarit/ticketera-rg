import { useState } from 'react';
import { 
    ArrowLeft, 
    Building, 
    Mail, 
    Phone, 
    Calendar, 
    Users, 
    MapPin, 
    Eye, 
    Edit,
    Trash2,
    Star,
    Globe,
    Facebook,
    Instagram,
    Twitter,
    CreditCard,
    User,
    UserCheck,
    Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';

interface Event {
    id: number;
    name: string;
    description: string;
    banner_url: string;
    created_at: string;
    category: {
        id: number;
        name: string;
    };
    venue: {
        id: number;
        name: string;
        address: string;
        city: string;
    };
}

interface User {
    id: number;
    email: string;
    role: string;
    created_at: string;
    person: {
        id: number;
        name: string;
        last_name: string;
        phone: string;
    };
}

interface Organizer {
    id: number;
    name: string;
    referring: string;
    email: string;
    phone: string;
    logo_url: string;
    facebook_url: string;
    instagram_url: string;
    twitter_url: string;
    tax: string;
    created_at: string;
    events: Event[];
    users: User[];
}

interface PageProps {
    organizer: Organizer;
    [key: string]: any;
}

export default function Show({ auth }: any) {
    const { organizer } = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState("users");

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getUserFullName = (user: User) => {
        return `${user.person.name} ${user.person.last_name}`;
    };

    const getRoleText = (role: string) => {
        const roles: { [key: string]: string } = {
            'admin': 'Administrador',
            'organizer': 'Organizador',
            'user': 'Usuario'
        };
        return roles[role] || role;
    };

    return (
        <>
            <Head title={`${organizer.name} - Organizador`} />
            
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    {/* Header con navegación de vuelta */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <Link href={route('admin.organizers.index')}>
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Volver a organizadores
                                </Button>
                            </Link>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <Link href={route('admin.organizers.edit', organizer.id)}>
                                <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Información del organizador - Sección compacta */}
                    <Card className="bg-card border-border shadow-lg mb-8">
                        <CardContent className="p-6">
                            <div className="flex items-start space-x-6">
                                <div className="w-20 h-20 rounded-lg bg-gradient-to-r from-primary to-chart-2 flex items-center justify-center flex-shrink-0">
                                    {organizer.logo_url ? (
                                        <img 
                                            src={`/storage/${organizer.logo_url}`} 
                                            alt={organizer.name} 
                                            className="w-full h-full object-cover rounded-lg" 
                                        />
                                    ) : (
                                        <Building className="w-10 h-10 text-primary-foreground" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h2 className="section text-foreground mb-2">{organizer.name}</h2>
                                            <p className="text-muted-foreground text-lg">{organizer.referring}</p>
                                        </div>
                                        <div className="text-right text-sm text-muted-foreground">
                                            <p>Registrado el {formatDate(organizer.created_at)}</p>
                                            <p>ID: #{organizer.id}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="flex items-center text-muted-foreground">
                                            <Mail className="w-4 h-4 mr-2 text-primary" />
                                            <span>{organizer.email}</span>
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <Phone className="w-4 h-4 mr-2 text-primary" />
                                            <span>{organizer.phone}</span>
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <CreditCard className="w-4 h-4 mr-2 text-primary" />
                                            <span>CUIT: {organizer.tax}</span>
                                        </div>
                                    </div>

                                    {/* Redes sociales si existen */}
                                    {(organizer.facebook_url || organizer.instagram_url || organizer.twitter_url) && (
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm text-muted-foreground">Redes sociales:</span>
                                            {organizer.facebook_url && (
                                                <a href={organizer.facebook_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                                                    <Facebook className="w-4 h-4" />
                                                </a>
                                            )}
                                            {organizer.instagram_url && (
                                                <a href={organizer.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                                                    <Instagram className="w-4 h-4" />
                                                </a>
                                            )}
                                            {organizer.twitter_url && (
                                                <a href={organizer.twitter_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                                                    <Twitter className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pestañas para usuarios y eventos */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="bg-muted border-border">
                            <TabsTrigger value="users" className="data-[state=active]:bg-background">
                                <Users className="w-4 h-4 mr-2" />
                                Usuarios ({organizer.users.length})
                            </TabsTrigger>
                            <TabsTrigger value="events" className="data-[state=active]:bg-background">
                                <Calendar className="w-4 h-4 mr-2" />
                                Eventos ({organizer.events.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Pestaña de usuarios */}
                        <TabsContent value="users">
                            <Card className="bg-card border-border shadow-lg">
                                <CardHeader className="border-b border-border pb-6">
                                    <CardTitle className="text-card-foreground flex items-center">
                                        <Users className="w-5 h-5 mr-2" />
                                        Usuarios del Organizador
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {organizer.users.length > 0 ? (
                                        <div className="space-y-4">
                                            {organizer.users.map((user) => (
                                                <div key={user.id} className="p-4 bg-muted rounded-lg hover:bg-accent transition-colors border border-border">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <Avatar className="w-12 h-12">
                                                                <AvatarFallback className="bg-primary text-primary-foreground">
                                                                    {user.person.name.charAt(0)}{user.person.last_name.charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h3 className="font-semibold text-card-foreground">{getUserFullName(user)}</h3>
                                                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                                    <span className="flex items-center">
                                                                        <Mail className="w-3 h-3 mr-1" />
                                                                        {user.email}
                                                                    </span>
                                                                    {user.person.phone && (
                                                                        <span className="flex items-center">
                                                                            <Phone className="w-3 h-3 mr-1" />
                                                                            {user.person.phone}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                                                                {getRoleText(user.role)}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                Desde {formatDate(user.created_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-foreground mb-2">No hay usuarios</h3>
                                            <p className="text-muted-foreground">Este organizador aún no tiene usuarios asignados.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Pestaña de eventos */}
                        <TabsContent value="events">
                            <Card className="bg-card border-border shadow-lg">
                                <CardHeader className="border-b border-border pb-6">
                                    <CardTitle className="text-card-foreground flex items-center">
                                        <Calendar className="w-5 h-5 mr-2" />
                                        Eventos del Organizador
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {organizer.events.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {organizer.events.map((event) => (
                                                <Card key={event.id} className="bg-muted border-border hover:shadow-md transition-shadow">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start space-x-4">
                                                            <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-chart-1 to-chart-3 flex items-center justify-center flex-shrink-0">
                                                                {event.banner_url ? (
                                                                    <img 
                                                                        src={`/storage/${event.banner_url}`} 
                                                                        alt={event.name} 
                                                                        className="w-full h-full object-cover rounded-lg" 
                                                                    />
                                                                ) : (
                                                                    <Ticket className="w-8 h-8 text-primary-foreground" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-card-foreground mb-1 truncate">{event.name}</h3>
                                                                <p className="text-sm text-muted-foreground mb-2 overflow-hidden" style={{
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical'
                                                                }}>{event.description}</p>
                                                                <div className="space-y-1 text-xs text-muted-foreground">
                                                                    <div className="flex items-center">
                                                                        <Star className="w-3 h-3 mr-1 text-primary" />
                                                                        <span>{event.category.name}</span>
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <MapPin className="w-3 h-3 mr-1 text-primary" />
                                                                        <span className="truncate">{event.venue.name}, {event.venue.city}</span>
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <Calendar className="w-3 h-3 mr-1 text-primary" />
                                                                        <span>Creado {formatDate(event.created_at)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-foreground mb-2">No hay eventos</h3>
                                            <p className="text-muted-foreground">Este organizador aún no ha creado eventos.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}

// Asignamos el Layout de Administrador
Show.layout = (page: any) => <AppLayout children={page} />;