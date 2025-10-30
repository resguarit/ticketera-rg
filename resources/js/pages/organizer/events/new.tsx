import { useState, useEffect, FormEventHandler } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Save, Plus, Trash2, Calendar } from 'lucide-react';
import { isDateAfter, formatDateForInput, isValidDate, formatDate } from '@/lib/dateHelpers';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Category } from '@/types';
import { toast, Toaster } from 'sonner';

interface EventFunction {
    id: string;
    name: string;
    description: string;
    start_time: string;
    end_time?: string;
}

interface Category {
    id: number;
    name: string;
}

interface Venue {
    id: number;
    name: string;
    address: string;
}

interface Sector {
    id: number;
    name: string;
    venue_id: number;
}

interface Props {
    categories: Category[];
    venues: Venue[];
}



export default function EventsNew({ categories, venues }: Props) {
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [heroBannerPreview, setHeroBannerPreview] = useState<string | null>(null);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [loadingSectors, setLoadingSectors] = useState(false);
    const [functions, setFunctions] = useState<EventFunction[]>([]);
    const [editingFunction, setEditingFunction] = useState<EventFunction | null>(null);
    const [functionForm, setFunctionForm] = useState({
        name: '',
        description: '',
        start_time: '',
        end_time: ''
    });
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        icon: '',
        color: '#3b82f6',
    });
    const [categoryErrors, setCategoryErrors] = useState<{ [key: string]: string }>({});
    const [categoryProcessing, setCategoryProcessing] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        banner_url: null as File | null,
        hero_banner_url: null as File | null,
        category_id: '',
        venue_id: '',
    });

    // Helper functions for date formatting
    const formatDisplayDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString('es-ES');
        } catch {
            return 'Fecha inválida';
        }
    };

    const formatDisplayTime = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return 'Hora inválida';
        }
    };

    const formatDateTimeForInput = (dateString: string | undefined): string => {
        if (!dateString) return '';
        try {
            // Convert to datetime-local format (YYYY-MM-DDTHH:mm)
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch {
            return '';
        }
    };

    // Load sectors when venue changes
    const loadSectors = async (venueId: string) => {
        if (!venueId) {
            setSectors([]);
            return;
        }
        
        setLoadingSectors(true);
        try {
            const response = await fetch(`/organizer/api/venues/${venueId}/sectors`);
            if (response.ok) {
                const sectorsData = await response.json();
                setSectors(sectorsData);
            }
        } catch (error) {
            console.error('Error loading sectors:', error);
        } finally {
            setLoadingSectors(false);
        }
    };

    const handleVenueChange = (venueId: string) => {
        setData('venue_id', venueId);
        loadSectors(venueId);
    };

    useEffect(() => {
        return () => {
            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview);
            }
            if (heroBannerPreview) {
                URL.revokeObjectURL(heroBannerPreview);
            }
        };
    }, [bannerPreview, heroBannerPreview]);

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('banner_url', file);
        if (bannerPreview) {
            URL.revokeObjectURL(bannerPreview);
        }
        if (file) {
            setBannerPreview(URL.createObjectURL(file));
        } else {
            setBannerPreview(null);
        }
    };

    const handleHeroBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('hero_banner_url', file);
        if (heroBannerPreview) {
            URL.revokeObjectURL(heroBannerPreview);
        }
        if (file) {
            setHeroBannerPreview(URL.createObjectURL(file));
        } else {
            setHeroBannerPreview(null);
        }
    };

    const addFunction = () => {
        // Validate required fields
        if (!functionForm.name || !functionForm.start_time) {
            toast.error('Debe completar todos los campos obligatorios de la función');
            return;
        }

        // Validate start_time is a valid date
        if (!isValidDate(functionForm.start_time)) {
            toast.error('La fecha de inicio no es válida');
            return;
        }

        // Only validate end_time if it's provided
        if (functionForm.end_time) {
            if (!isValidDate(functionForm.end_time)) {
                toast.error('La fecha de fin no es válida');
                return;
            }
            
            if (!isDateAfter(functionForm.end_time, functionForm.start_time)) {
                toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
                return;
            }
        }

        const newFunction: EventFunction = {
            id: editingFunction?.id || Date.now().toString(),
            name: functionForm.name,
            description: functionForm.description,
            start_time: functionForm.start_time,
            end_time: functionForm.end_time || undefined,
        };

        if (editingFunction) {
            // Update existing function
            const updatedFunctions = functions.map(f => 
                f.id === editingFunction.id ? newFunction : f
            );
            setFunctions(updatedFunctions);
            toast.success('Función actualizada correctamente');
        } else {
            // Add new function
            const updatedFunctions = [...functions, newFunction];
            setFunctions(updatedFunctions);
            toast.success('Función agregada correctamente');
        }

        // Clear form
        setFunctionForm({
            name: '',
            description: '',
            start_time: '',
            end_time: ''
        });
        setEditingFunction(null);
    };

    const editFunction = (functionToEdit: EventFunction) => {
        setFunctionForm({
            name: functionToEdit.name,
            description: functionToEdit.description,
            start_time: formatDateTimeForInput(functionToEdit.start_time),
            end_time: formatDateTimeForInput(functionToEdit.end_time)
        });
        setEditingFunction(functionToEdit);
    };

    const removeFunction = (functionId: string) => {
        const updatedFunctions = functions.filter(f => f.id !== functionId);
        setFunctions(updatedFunctions);
        
        // If we're editing this function, clear the form
        if (editingFunction?.id === functionId) {
            setFunctionForm({
                name: '',
                description: '',
                start_time: '',
                end_time: ''
            });
            setEditingFunction(null);
        }
    };

    const cancelEdit = () => {
        setFunctionForm({
            name: '',
            description: '',
            start_time: '',
            end_time: ''
        });
        setEditingFunction(null);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Validar campos obligatorios uno por uno
        if (!data.name.trim()) {
            toast.error('El nombre del evento es obligatorio');
            return;
        }

        if (!data.description.trim()) {
            toast.error('La descripción del evento es obligatoria');
            return;
        }

        if (!data.category_id) {
            toast.error('Debe seleccionar una categoría para el evento');
            return;
        }

        if (!data.venue_id) {
            toast.error('Debe seleccionar un recinto para el evento');
            return;
        }
        
        // Validate at least one function
        if (functions.length === 0) {
            toast.error('Debe agregar al menos una función al evento');
            return;
        }
        
        // Convert functions to plain objects
        const functionsData = functions.map(func => ({
            name: func.name,
            description: func.description,
            start_time: func.start_time,
            end_time: func.end_time || null
        }));
        
        // Use Inertia router directly
        router.post(route('organizer.events.store'), {
            ...data,
            functions: functionsData
        }, {
            onStart: () => {
                toast.loading('Creando evento...', { id: 'create-event' });
            },
            onSuccess: () => {
                toast.success('Evento creado exitosamente', { id: 'create-event' });
            },
            onError: (errors: any) => {
                // Mostrar errores específicos del servidor
                if (errors.name) {
                    toast.error(`Nombre: ${errors.name}`, { id: 'create-event' });
                } else if (errors.description) {
                    toast.error(`Descripción: ${errors.description}`, { id: 'create-event' });
                } else if (errors.category_id) {
                    toast.error(`Categoría: ${errors.category_id}`, { id: 'create-event' });
                } else if (errors.venue_id) {
                    toast.error(`Recinto: ${errors.venue_id}`, { id: 'create-event' });
                } else if (errors.functions) {
                    toast.error(`Funciones: ${errors.functions}`, { id: 'create-event' });
                } else {
                    toast.error('Error al crear el evento. Verifique todos los campos', { id: 'create-event' });
                }
                console.log('Form errors:', errors);
            }
        });
    };

    return (
        <>
            <Head title='Crear Evento' />
            <div className='min-h-screen bg-background'>
                <div className='container mx-auto px-4 py-6'>
                <div className="flex items-center mb-6">
                    <Link href={route('organizer.events.index')}>
                        <Button variant="outline" size="icon" className="mr-4">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Crear Evento</h1>
                        <p className="text-gray-600 mt-1">
                            Complete el formulario para crear un nuevo evento.
                        </p>
                    </div>
                </div>

{/*                     <div className='flex items-center justify-between mb-6'>
                        <div>
                            <h2 className="section text-2xl text-foreground">Crear Evento</h2>
                            <p className='text-muted-foreground'>Complete el formulario para crear un nuevo evento.</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Link href="/organizer/events">
                                <Button variant="ghost" className="text-foreground hover:bg-accent">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Volver
                                </Button>
                            </Link>
                            <Button onClick={submit} disabled={processing} className="bg-primary text-primary-foreground hover:bg-primary-hover">
                                <Save className="w-4 h-4 mr-2" />
                                Guardar Evento
                            </Button>
                        </div>
                    </div> */}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Información Básica del Evento */}
                        <Card className='bg-card shadow-lg border-border'>
                            <CardHeader className='pb-0'>
                                <CardTitle className='text-lg font-semibold text-card-foreground'>Información del Evento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <Label htmlFor="name" className="text-card-foreground">Nombre del Evento <span className="text-red-500">*</span></Label>
                                        <Input 
                                            id="name" 
                                            value={data.name} 
                                            onChange={(e) => setData('name', e.target.value)} 
                                            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="category_id" className="text-card-foreground">Categoría <span className="text-red-500">*</span></Label>
                                        <div className="flex gap-2">
                                            <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                                <SelectTrigger className="bg-background border-border text-foreground">
                                                    <SelectValue placeholder="Seleccionar categoría" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="venue_id" className="text-card-foreground">Recinto <span className="text-red-500">*</span></Label>
                                        <div className="flex gap-2">
                                            <Select value={data.venue_id} onValueChange={handleVenueChange}>
                                                <SelectTrigger className="bg-background border-border text-foreground">
                                                    <SelectValue placeholder="Seleccionar recinto" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {venues.map((venue) => (
                                                        <SelectItem key={venue.id} value={venue.id.toString()}>
                                                            {venue.name} - {venue.address}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button type="button" variant="outline" size="icon">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="description" className="text-card-foreground">Descripción <span className="text-red-500">*</span></Label>
                                        <Textarea 
                                            id="description" 
                                            value={data.description} 
                                            onChange={(e) => setData('description', e.target.value)} 
                                            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                            rows={4}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Banners del Evento */}
                        <Card className='bg-card shadow-lg border-border'>
                            <CardHeader>
                                <CardTitle className='text-lg font-semibold text-card-foreground'>Imágenes del Evento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Banner Normal */}
                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'>
                                        <div className='space-y-2'>
                                            <Label htmlFor="banner" className="text-card-foreground">Banner Normal</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Imagen que aparece en las tarjetas de eventos. Recomendado: 800x400px
                                            </p>
                                            <Input 
                                                className='bg-background border-border text-foreground' 
                                                id="banner" 
                                                type="file" 
                                                onChange={handleBannerChange}
                                                accept="image/*"
                                            />
                                        </div>
                                        {bannerPreview && (
                                            <div className='space-y-2'>
                                                <Label className="text-card-foreground">Vista Previa - Como se verá en la tarjeta</Label>
                                                {/* Vista previa móvil */}
                                                <div className="block sm:hidden">
                                                    <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ width: '212px' }}>
                                                        <div className="flex h-32">
                                                            {/* Imagen izquierda - tamaño móvil */}
                                                            <div className="w-32 h-32 flex-shrink-0">
                                                                <img 
                                                                    src={bannerPreview} 
                                                                    alt="Banner preview móvil" 
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            
                                                            {/* Contenido derecha - simulado */}
                                                            <div className="flex-1 p-3 flex flex-col justify-between">
                                                                <div>
                                                                    <div className="flex items-center gap-1 mb-1">
                                                                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                                                        <span className="text-xs text-gray-500 uppercase">
                                                                            UBICACIÓN
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <h3 className="text-sm font-bold text-black uppercase leading-tight line-clamp-2 mb-2">
                                                                        NOMBRE DEL EVENTO
                                                                    </h3>
                                                                </div>
                                                                
                                                                <div className="flex gap-4">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-2xl font-bold text-black leading-none">15</span>
                                                                        <div className="leading-none">
                                                                            <div className="text-xs font-bold text-black">nov</div>
                                                                            <div className="text-xs font-bold text-black">2024</div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-2xl font-bold text-black leading-none">20</span>
                                                                        <div className="leading-none">
                                                                            <div className="text-xs font-bold text-black">30</div>
                                                                            <div className="text-xs font-bold text-black">hrs</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-2">Vista en móviles</p>
                                                </div>

                                                {/* Vista previa desktop */}
                                                <div className="hidden sm:block">
                                                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg" style={{ width: '212px', height: '380px' }}>
                                                        {/* Header section con la imagen - altura fija como en la tarjeta real */}
                                                        <div className="relative overflow-hidden" style={{ height: '260px' }}>
                                                            <img 
                                                                src={bannerPreview} 
                                                                alt="Banner preview desktop" 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>

                                                        {/* Bottom section - simulado - altura exacta restante */}
                                                        <div className="p-3 bg-white" style={{ height: '100px' }}>
                                                            <div className="flex items-center gap-1 mb-2" style={{ height: '16px' }}>
                                                                <div className="w-3 h-3 bg-gray-400 rounded-full flex-shrink-0"></div>
                                                                <span className="text-gray-600 text-xs font-medium uppercase truncate">
                                                                    UBICACIÓN, CIUDAD
                                                                </span>
                                                            </div>

                                                            <h2 className="text-black text-sm font-bold mb-2 leading-tight tracking-wide uppercase line-clamp-2" style={{ minHeight: '28px' }}>
                                                                NOMBRE DEL EVENTO
                                                            </h2>

                                                            <div className="flex gap-4">
                                                                <div className="text-center">
                                                                    <div className="flex gap-[1px] flex-row items-center">
                                                                        <div className="text-2xl font-bold text-black leading-none">15</div>
                                                                        <div className="gap-0">
                                                                            <div className="capitalize text-start font-bold text-black leading-none text-xs pt-1">
                                                                                nov<br />2024
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="flex gap-[1px] flex-row items-center">
                                                                        <div className="text-2xl font-bold text-black leading-none">20</div>
                                                                        <div className="gap-0">
                                                                            <div className="text-start font-bold text-black leading-none text-xs pt-1">
                                                                                30<br />hrs
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-2">Vista en desktop y tablets </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Separador */}
                                    <div className="border-t border-border my-4"></div>

                                    {/* Hero Banner - mantener como está */}
                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'>
                                        <div className='space-y-2'>
                                            <Label htmlFor="hero_banner" className="text-card-foreground">
                                                Hero Banner 
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Imagen especial para la página principal. Solo se mostrará si el administrador marca el evento como destacado. 
                                                Recomendado: 1920x600px
                                            </p>
                                            <Input 
                                                className='bg-background border-border text-foreground' 
                                                id="hero_banner" 
                                                type="file" 
                                                onChange={handleHeroBannerChange}
                                                accept="image/*"
                                            />
                                        </div>
                                        {heroBannerPreview && (
                                            <div className='space-y-2'>
                                                <Label className="text-card-foreground">Vista Previa - Hero Banner</Label>
                                                <img 
                                                    src={heroBannerPreview} 
                                                    alt="Hero banner preview" 
                                                    className="w-full h-24 object-cover rounded-lg border border-border"
                                                />
                                                <p className="text-xs text-muted-foreground">Se mostrará en el banner principal del home</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Nota informativa - mantener como está */}
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start space-x-2">
                                            <div className="text-blue-600 mt-1">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-blue-800">Eventos Destacados</h4>
                                                <p className="text-sm text-blue-700">
                                                    Solo los administradores pueden marcar eventos como destacados. 
                                                    Si subes un hero banner, estará listo para cuando tu evento sea destacado.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Funciones del Evento */}
                        <Card className='bg-card shadow-lg border-border'>
                            <CardHeader>
                                <CardTitle className='text-lg font-semibold text-card-foreground'>Funciones del Evento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Formulario de Función */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-md font-medium text-card-foreground">
                                                {editingFunction ? 'Editar Función' : 'Agregar Función'}
                                            </h4>
                                            {editingFunction && (
                                                <Button 
                                                    type="button" 
                                                    onClick={cancelEdit}
                                                    variant="outline" 
                                                    size="sm"
                                                >
                                                    Cancelar
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-4 border border-border rounded-lg p-4">
                                            <div>
                                                <Label className="text-card-foreground">Nombre de la Función <span className="text-red-500">*</span></Label>
                                                <Input 
                                                    value={functionForm.name} 
                                                    onChange={(e) => setFunctionForm(prev => ({ ...prev, name: e.target.value }))}
                                                    className="bg-background border-border text-foreground"
                                                    placeholder="Ej: Función 1, Matinée, Noche"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-card-foreground">Descripción</Label>
                                                <Textarea 
                                                    value={functionForm.description} 
                                                    onChange={(e) => setFunctionForm(prev => ({ ...prev, description: e.target.value }))}
                                                    className="bg-background border-border text-foreground"
                                                    placeholder="Descripción opcional de la función"
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-card-foreground">Fecha de Inicio <span className="text-red-500">*</span></Label>
                                                    <Input 
                                                        type="date"
                                                        value={functionForm.start_time ? functionForm.start_time.split('T')[0] : ''} 
                                                        onChange={(e) => {
                                                            const currentTime = functionForm.start_time ? functionForm.start_time.split('T')[1] || '09:00' : '09:00';
                                                            setFunctionForm(prev => ({ 
                                                                ...prev, 
                                                                start_time: e.target.value ? `${e.target.value}T${currentTime}` : ''
                                                            }));
                                                        }}
                                                        className="bg-background border-border text-foreground"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-card-foreground">Hora de Inicio <span className="text-red-500">*</span></Label>
                                                    <Select 
                                                        value={functionForm.start_time ? functionForm.start_time.split('T')[1] || '' : ''} 
                                                        onValueChange={(value) => {
                                                            const currentDate = functionForm.start_time ? functionForm.start_time.split('T')[0] : '';
                                                            if (currentDate && value) {
                                                                setFunctionForm(prev => ({ 
                                                                    ...prev, 
                                                                    start_time: `${currentDate}T${value}`
                                                                }));
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="bg-background border-border text-foreground">
                                                            <SelectValue placeholder="Seleccionar hora" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Array.from({ length: 48 }, (_, i) => {
                                                                const hour = Math.floor(i / 2);
                                                                const minute = i % 2 === 0 ? '00' : '30';
                                                                const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                                                const displayTime = `${hour.toString().padStart(2, '0')}:${minute}`;
                                                                return (
                                                                    <SelectItem key={time} value={time}>
                                                                        {displayTime}
                                                                    </SelectItem>
                                                                );
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-card-foreground">Fecha de Fin </Label>
                                                    <Input 
                                                        type="date"
                                                        value={functionForm.end_time ? functionForm.end_time.split('T')[0] : ''} 
                                                        onChange={(e) => {
                                                            if (!e.target.value) {
                                                                setFunctionForm(prev => ({ ...prev, end_time: '' }));
                                                                return;
                                                            }
                                                            const currentTime = functionForm.end_time ? functionForm.end_time.split('T')[1] || '21:00' : '21:00';
                                                            setFunctionForm(prev => ({ 
                                                                ...prev, 
                                                                end_time: `${e.target.value}T${currentTime}`
                                                            }));
                                                        }}
                                                        className="bg-background border-border text-foreground"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-card-foreground">Hora de Fin </Label>
                                                    <Select 
                                                        value={functionForm.end_time ? functionForm.end_time.split('T')[1] || '' : ''} 
                                                        onValueChange={(value) => {
                                                            const currentDate = functionForm.end_time ? functionForm.end_time.split('T')[0] : '';
                                                            if (currentDate && value) {
                                                                setFunctionForm(prev => ({ 
                                                                    ...prev, 
                                                                    end_time: `${currentDate}T${value}`
                                                                }));
                                                            }
                                                        }}
                                                        disabled={!functionForm.end_time || !functionForm.end_time.includes('T')}
                                                    >
                                                        <SelectTrigger className="bg-background border-border text-foreground">
                                                            <SelectValue placeholder="Seleccionar hora" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Array.from({ length: 48 }, (_, i) => {
                                                                const hour = Math.floor(i / 2);
                                                                const minute = i % 2 === 0 ? '00' : '30';
                                                                const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                                                const displayTime = `${hour.toString().padStart(2, '0')}:${minute}`;
                                                                return (
                                                                    <SelectItem key={time} value={time}>
                                                                        {displayTime}
                                                                    </SelectItem>
                                                                );
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <Button 
                                                type="button" 
                                                onClick={addFunction}
                                                className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                {editingFunction ? 'Actualizar Función' : 'Agregar Función'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Lista de Funciones */}
                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium text-card-foreground">
                                            Funciones Agregadas ({functions.length})
                                        </h4>
                                        
                                        {functions.length > 0 ? (
                                            <div className="border border-border rounded-lg overflow-hidden">
                                                <div className="bg-muted/50 px-4 py-2 border-b border-border">
                                                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                                                        <div className="col-span-3">Nombre</div>
                                                        <div className="col-span-3">Inicio</div>
                                                        <div className="col-span-3">Fin</div>
                                                        <div className="col-span-3">Acciones</div>
                                                    </div>
                                                </div>
                                                <div className="max-h-80 overflow-y-auto">
                                                    {functions.map((func, index) => (
                                                        <div 
                                                            key={func.id} 
                                                            className={`px-4 py-3 border-b border-border last:border-b-0 ${
                                                                editingFunction?.id === func.id ? 'bg-primary/10' : 'hover:bg-muted/30'
                                                            }`}
                                                        >
                                                            <div className="grid grid-cols-12 gap-2 items-center text-sm">
                                                                <div className="col-span-3">
                                                                    <div className="font-medium text-foreground truncate" title={func.name}>
                                                                        {func.name}
                                                                    </div>
                                                                    {func.description && (
                                                                        <div className="text-xs text-muted-foreground truncate" title={func.description}>
                                                                            {func.description}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="col-span-3 text-foreground">
                                                                    <div className="text-xs">
                                                                        {formatDisplayDate(func.start_time)}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {formatDisplayTime(func.start_time)}
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-3 text-foreground">
                                                                    {func.end_time ? (
                                                                        <>
                                                                            <div className="text-xs">
                                                                                {formatDisplayDate(func.end_time)}
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground">
                                                                                {formatDisplayTime(func.end_time)}
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="text-xs text-muted-foreground">
                                                                            Sin fecha de fin
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="col-span-3 flex gap-1">
                                                                    <Button 
                                                                        type="button" 
                                                                        onClick={() => editFunction(func)}
                                                                        variant="outline" 
                                                                        size="sm"
                                                                        className="h-7 px-2"
                                                                    >
                                                                        Editar
                                                                    </Button>
                                                                    <Button 
                                                                        type="button" 
                                                                        onClick={() => removeFunction(func.id)}
                                                                        variant="destructive" 
                                                                        size="sm"
                                                                        className="h-7 px-2"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border border-dashed border-border rounded-lg p-8 text-center">
                                                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground">
                                                    No hay funciones agregadas
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Complete el formulario de la izquierda para agregar la primera función
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                    <Link href={route('organizer.events.index')}>
                                        <Button type="button" variant="outline">Cancelar</Button>
                                    </Link>
                                    <Button onClick={submit} disabled={processing} className="bg-primary text-primary-foreground hover:bg-primary-hover">
                                        <Save className="w-4 h-4 mr-2" />
                                        Guardar Evento
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </>
    );
}

EventsNew.layout = (page: any) => <AppLayout children={page} />;