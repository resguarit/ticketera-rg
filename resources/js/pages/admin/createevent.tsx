import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, DollarSign, Users, Clock, Image, Save, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

interface TicketType {
    id: string;
    name: string;
    description: string;
    price: string;
    quantity: string;
}

export default function CreateEvent({ auth }: any) {
    const [isLoading, setIsLoading] = useState(false);
    
    // Formulario básico
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        category: '',
        date: '',
        time: '',
        location: '',
        city: '',
        capacity: '',
        featured: false,
        status: 'draft'
    });

    // Tipos de tickets
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
        {
            id: '1',
            name: 'General',
            description: '',
            price: '',
            quantity: ''
        }
    ]);

    const handleInputChange = (field: string, value: string | boolean) => {
        setEventData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTicketChange = (id: string, field: string, value: string) => {
        setTicketTypes(prev => 
            prev.map(ticket => 
                ticket.id === id ? { ...ticket, [field]: value } : ticket
            )
        );
    };

    const addTicketType = () => {
        const newTicket: TicketType = {
            id: Date.now().toString(),
            name: '',
            description: '',
            price: '',
            quantity: ''
        };
        setTicketTypes(prev => [...prev, newTicket]);
    };

    const removeTicketType = (id: string) => {
        if (ticketTypes.length > 1) {
            setTicketTypes(prev => prev.filter(ticket => ticket.id !== id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simular envío al backend
        setTimeout(() => {
            setIsLoading(false);
            console.log('Evento creado:', { eventData, ticketTypes });
            // Redirigir a la lista de eventos
            router.visit('/admin/events');
        }, 2000);
    };

    const handleSaveDraft = () => {
        console.log('Guardado como borrador:', { eventData, ticketTypes });
    };

    return (
        <>
            <Head title="Crear Evento - Panel Admin" />
            
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <Link href="/admin/events">
                                <Button variant="ghost" size="sm" className="text-black hover:bg-gray-100">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Volver
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-black">Crear Nuevo Evento</h1>
                                <p className="text-gray-600">Completa la información del evento</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Button 
                                variant="outline" 
                                onClick={handleSaveDraft}
                                className="border-gray-300 text-white hover:bg-gray-50"
                            >
                                Guardar Borrador
                            </Button>
                            <Button 
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="min-w-[100px] bg-black text-white hover:bg-gray-800"
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Creando...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Save className="w-4 h-4" />
                                        <span>Crear Evento</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Información Principal */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Datos básicos */}
                                <Card className="bg-white py-0 pb-4 gap-2 shadow-lg border-gray-300">
                                    <CardHeader className="border-b py-3 border-gray-200">
                                        <CardTitle className="flex items-center space-x-2 text-black">
                                            <Calendar className="w-5 h-5 text-gray-700" />
                                            <span>Información Básica</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 ">
                                        <div>
                                            <Label htmlFor="title" className="text-black">Título del Evento *</Label>
                                            <Input
                                                id="title"
                                                value={eventData.title}
                                                onChange={(e) => handleInputChange('title', e.target.value)}
                                                placeholder="Ej: Festival de Música 2024"
                                                required
                                                className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="description" className="text-black">Descripción *</Label>
                                            <Textarea
                                                id="description"
                                                value={eventData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                placeholder="Describe el evento, qué pueden esperar los asistentes..."
                                                rows={4}
                                                required
                                                className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="category" className="text-black">Categoría *</Label>
                                                <Select 
                                                    value={eventData.category} 
                                                    onValueChange={(value) => handleInputChange('category', value)}
                                                >
                                                    <SelectTrigger className="bg-white border-gray-300 text-black">
                                                        <SelectValue placeholder="Selecciona una categoría" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-gray-300">
                                                        <SelectItem value="música">Música</SelectItem>
                                                        <SelectItem value="teatro">Teatro</SelectItem>
                                                        <SelectItem value="deportes">Deportes</SelectItem>
                                                        <SelectItem value="conferencia">Conferencia</SelectItem>
                                                        <SelectItem value="gastronómico">Gastronómico</SelectItem>
                                                        <SelectItem value="cultural">Cultural</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="capacity" className="text-black">Capacidad Total *</Label>
                                                <Input
                                                    id="capacity"
                                                    type="number"
                                                    value={eventData.capacity}
                                                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                                                    placeholder="1000"
                                                    required
                                                    className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Fecha y Ubicación */}
                                <Card className="bg-white py-0 pb-4 gap-2 shadow-lg border-gray-300">
                                    <CardHeader className="border-b py-3 border-gray-200">
                                        <CardTitle className="flex items-center space-x-2 text-black">
                                            <MapPin className="w-5 h-5 text-gray-700" />
                                            <span>Fecha y Ubicación</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 ">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="date" className="text-black">Fecha del Evento *</Label>
                                                <Input
                                                    id="date"
                                                    type="date"
                                                    value={eventData.date}
                                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                                    required
                                                    className="bg-white border-gray-300 text-black"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="time" className="text-black">Hora de Inicio *</Label>
                                                <Input
                                                    id="time"
                                                    type="time"
                                                    value={eventData.time}
                                                    onChange={(e) => handleInputChange('time', e.target.value)}
                                                    required
                                                    className="bg-white border-gray-300 text-black"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="location" className="text-black">Ubicación/Venue *</Label>
                                                <Input
                                                    id="location"
                                                    value={eventData.location}
                                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                                    placeholder="Ej: Estadio Nacional"
                                                    required
                                                    className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="city" className="text-black">Ciudad *</Label>
                                                <Select 
                                                    value={eventData.city} 
                                                    onValueChange={(value) => handleInputChange('city', value)}
                                                >
                                                    <SelectTrigger className="bg-white border-gray-300 text-black">
                                                        <SelectValue placeholder="Selecciona una ciudad" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-gray-300">
                                                        <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                                                        <SelectItem value="Córdoba">Córdoba</SelectItem>
                                                        <SelectItem value="Rosario">Rosario</SelectItem>
                                                        <SelectItem value="Mendoza">Mendoza</SelectItem>
                                                        <SelectItem value="La Plata">La Plata</SelectItem>
                                                        <SelectItem value="Montevideo">Montevideo</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Tipos de Tickets */}
                                <Card className="bg-white py-0 pb-4 gap-2 shadow-lg border-gray-300">
                                    <CardHeader className="border-b py-3 border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center space-x-2 text-black">
                                                <DollarSign className="w-5 h-5 text-gray-700" />
                                                <span>Tipos de Tickets</span>
                                            </CardTitle>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={addTicketType}
                                                className="border-gray-300 text-white hover:bg-gray-50"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Agregar Tipo
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-1">
                                        {ticketTypes.map((ticket, index) => (
                                            <div key={ticket.id} className="p-4 border border-gray-200 rounded-lg space-y-3 bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-black">Ticket #{index + 1}</h4>
                                                    {ticketTypes.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeTicketType(ticket.id)}
                                                            className="text-gray-600 hover:bg-gray-200"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-black">Nombre del Ticket *</Label>
                                                        <Input
                                                            value={ticket.name}
                                                            onChange={(e) => handleTicketChange(ticket.id, 'name', e.target.value)}
                                                            placeholder="Ej: General, VIP, Premium"
                                                            required
                                                            className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-black">Precio (ARS) *</Label>
                                                        <Input
                                                            type="number"
                                                            value={ticket.price}
                                                            onChange={(e) => handleTicketChange(ticket.id, 'price', e.target.value)}
                                                            placeholder="5000"
                                                            required
                                                            className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-black">Cantidad Disponible *</Label>
                                                        <Input
                                                            type="number"
                                                            value={ticket.quantity}
                                                            onChange={(e) => handleTicketChange(ticket.id, 'quantity', e.target.value)}
                                                            placeholder="100"
                                                            required
                                                            className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-black">Descripción</Label>
                                                        <Input
                                                            value={ticket.description}
                                                            onChange={(e) => handleTicketChange(ticket.id, 'description', e.target.value)}
                                                            placeholder="Descripción opcional"
                                                            className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Panel Lateral */}
                            <div className="space-y-6">
                                {/* Estado y Configuración */}
                                <Card className="bg-white py-0 pb-4 gap-2 shadow-lg border-gray-300">
                                    <CardHeader className="border-b py-3 border-gray-200">
                                        <CardTitle className="text-black">Estado del Evento</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 ">
                                        <div>
                                            <Label className="text-black">Estado</Label>
                                            <Select 
                                                value={eventData.status} 
                                                onValueChange={(value) => handleInputChange('status', value)}
                                            >
                                                <SelectTrigger className="bg-white border-gray-300 text-black">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-gray-300">
                                                    <SelectItem value="draft">Borrador</SelectItem>
                                                    <SelectItem value="pending">Pendiente de Revisión</SelectItem>
                                                    <SelectItem value="active">Activo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="featured"
                                                checked={eventData.featured}
                                                onCheckedChange={(checked) => handleInputChange('featured', !!checked)}
                                                className="border-gray-300"
                                            />
                                            <Label htmlFor="featured" className="text-sm text-black">
                                                Evento destacado
                                            </Label>
                                        </div>

                                        <div className="text-xs text-gray-500">
                                            Los eventos destacados aparecen en la página principal
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Imagen del Evento */}
                                <Card className="bg-white py-0 pb-4 gap-2 shadow-lg border-gray-300">
                                    <CardHeader className="border-b py-3 border-gray-200">
                                        <CardTitle className="flex items-center space-x-2 text-black">
                                            <Image className="w-5 h-5 text-gray-700" />
                                            <span>Imagen del Evento</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                                            <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-sm text-gray-600 mb-2">
                                                Arrastra una imagen aquí o haz clic para seleccionar
                                            </p>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm"
                                                className="border-gray-300 text-white hover:bg-gray-100"
                                            >
                                                Seleccionar Imagen
                                            </Button>
                                            <p className="text-xs text-gray-500 mt-2">
                                                PNG, JPG hasta 5MB
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Resumen */}
                                <Card className="bg-white py-0 pb-4 gap-2 shadow-lg border-gray-300">
                                    <CardHeader className="border-b py-3 border-gray-200">
                                        <CardTitle className="text-black">Resumen</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Capacidad total:</span>
                                            <span className="text-black">{eventData.capacity || '0'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tipos de tickets:</span>
                                            <span className="text-black">{ticketTypes.length}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Estado:</span>
                                            <span className="text-black capitalize">{eventData.status}</span>
                                        </div>
                                        <Separator className="bg-gray-200" />
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-black">Precio mínimo:</span>
                                            <span className="text-black">
                                                ${Math.min(...ticketTypes.map(t => parseInt(t.price) || 0)).toLocaleString() || '0'} ARS
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

// Asignamos el Layout de Administrador
CreateEvent.layout = (page: any) => <AppLayout children={page} />;