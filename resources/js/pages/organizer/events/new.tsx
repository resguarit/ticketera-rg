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
        category_id: '',
        venue_id: '',
        featured: false,
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
        };
    }, [bannerPreview]);

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

    const addFunction = () => {
        // Validate required fields
        if (!functionForm.name || !functionForm.start_time) {
            alert('Debe completar todos los campos obligatorios de la función.');
            return;
        }

        // Validate start_time is a valid date
        if (!isValidDate(functionForm.start_time)) {
            alert('La fecha de inicio no es válida.');
            return;
        }

        // Only validate end_time if it's provided
        if (functionForm.end_time) {
            if (!isValidDate(functionForm.end_time)) {
                alert('La fecha de fin no es válida.');
                return;
            }
            
            if (!isDateAfter(functionForm.end_time, functionForm.start_time)) {
                alert('La fecha de fin debe ser posterior a la fecha de inicio.');
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
        } else {
            // Add new function
            const updatedFunctions = [...functions, newFunction];
            setFunctions(updatedFunctions);
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
        
        // Validate at least one function
        if (functions.length === 0) {
            alert('Debe agregar al menos una función al evento.');
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
            onSuccess: () => {
                console.log('Event created successfully');
            },
            onError: (errors: any) => {
                console.log('Form errors:', errors);
            }
        });
    };

    return (
        <>
            <Head title='Crear Evento' />
            <div className='min-h-screen bg-background'>
                <div className='container mx-auto px-4 py-6'>
                    <div className='flex items-center justify-between mb-6'>
                        <div>
                            <h2 className="section text-foreground">Crear Evento</h2>
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
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Información Básica del Evento */}
                        <Card className='bg-card shadow-lg border-border'>
                            <CardHeader>
                                <CardTitle className='text-lg font-semibold text-card-foreground'>Información del Evento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <Label htmlFor="name" className="text-card-foreground">Nombre del Evento *</Label>
                                        <Input 
                                            id="name" 
                                            value={data.name} 
                                            onChange={(e) => setData('name', e.target.value)} 
                                            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                            required
                                        />
                                        <InputError message={errors.name} className="mt-1" />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="category_id" className="text-card-foreground">Categoría *</Label>
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
                                        <InputError message={errors.category_id} className="mt-1" />
                                    </div>

                                    <div>
                                        <Label htmlFor="venue_id" className="text-card-foreground">Recinto *</Label>
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
                                        <InputError message={errors.venue_id} className="mt-1" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="description" className="text-card-foreground">Descripción *</Label>
                                        <Textarea 
                                            id="description" 
                                            value={data.description} 
                                            onChange={(e) => setData('description', e.target.value)} 
                                            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                            rows={4}
                                            required
                                        />
                                        <InputError message={errors.description} className="mt-1" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Banner */}
                        <Card className='bg-card shadow-lg border-border'>
                            <CardHeader>
                                <CardTitle className='text-lg font-semibold text-card-foreground'>Banner del Evento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-start'>
                                    <div className='space-y-2'>
                                        <Label htmlFor="banner" className="text-card-foreground">Subir Banner</Label>
                                        <div className='flex items-center py-4'>
                                            <Input 
                                                className='w-fit bg-background border-border text-foreground' 
                                                id="banner" 
                                                type="file" 
                                                onChange={handleBannerChange}
                                                accept="image/*"
                                            />
                                            <InputError message={errors.banner_url} className="mt-1" />
                                        </div>
                                    </div>
                                    {bannerPreview && (
                                        <div className='space-y-2'>
                                            <Label className="text-card-foreground">Vista Previa</Label>
                                            <img 
                                                src={bannerPreview} 
                                                alt="Banner preview" 
                                                className="w-full h-32 object-cover rounded-lg border border-border"
                                            />
                                        </div>
                                    )}
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
                                                <Label className="text-card-foreground">Nombre de la Función *</Label>
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

                                            <div>
                                                <Label className="text-card-foreground">Fecha y Hora de Inicio *</Label>
                                                <Input 
                                                    type="datetime-local"
                                                    value={functionForm.start_time} 
                                                    onChange={(e) => setFunctionForm(prev => ({ ...prev, start_time: e.target.value }))}
                                                    className="bg-background border-border text-foreground"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-card-foreground">Fecha y Hora de Fin (Opcional)</Label>
                                                <Input 
                                                    type="datetime-local"
                                                    value={functionForm.end_time} 
                                                    onChange={(e) => setFunctionForm(prev => ({ ...prev, end_time: e.target.value }))}
                                                    className="bg-background border-border text-foreground"
                                                />
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
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </>
    );
}

EventsNew.layout = (page: any) => <AppLayout children={page} />;