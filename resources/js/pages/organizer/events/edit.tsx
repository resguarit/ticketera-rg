import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import { Event, Category, Venue, EventFunction } from '@/types';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

interface EditEventProps {
    event: Event & { 
        functions: EventFunction[], 
        image_url?: string,
        hero_image_url?: string
    };
    categories: Category[];
    venues: Venue[];
}

export default function EditEvent({ event, categories, venues }: EditEventProps) {
    const [bannerPreview, setBannerPreview] = useState<string | null>(event.image_url || null);
    const [heroBannerPreview, setHeroBannerPreview] = useState<string | null>(event.hero_image_url || null);

    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        _method: 'PUT',
        name: event.name || '',
        description: event.description || '',
        category_id: event.category_id || '',
        venue_id: event.venue_id || '',
        featured: event.featured || false,
        banner_url: null as File | null,
        hero_banner_url: null as File | null,
    });

    useEffect(() => {
        return () => {
            if (bannerPreview && bannerPreview.startsWith('blob:')) {
                URL.revokeObjectURL(bannerPreview);
            }
            if (heroBannerPreview && heroBannerPreview.startsWith('blob:')) {
                URL.revokeObjectURL(heroBannerPreview);
            }
        };
    }, [bannerPreview, heroBannerPreview]);

    function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null;
        setData('banner_url', file);

        if (bannerPreview && bannerPreview.startsWith('blob:')) {
            URL.revokeObjectURL(bannerPreview);
        }

        if (file) {
            setBannerPreview(URL.createObjectURL(file));
        } else {
            // Si no hay archivo nuevo, mantener la preview existente
            setBannerPreview(event.image_url || null);
        }
    }

    function handleHeroBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null;
        setData('hero_banner_url', file);

        if (heroBannerPreview && heroBannerPreview.startsWith('blob:')) {
            URL.revokeObjectURL(heroBannerPreview);
        }

        if (file) {
            setHeroBannerPreview(URL.createObjectURL(file));
        } else {
            // Si no hay archivo nuevo, mantener la preview existente  
            setHeroBannerPreview(event.hero_image_url || null);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        // Validar campos obligatorios
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

        // Crear FormData para enviar archivos correctamente
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('category_id', data.category_id.toString());
        formData.append('venue_id', data.venue_id.toString());
        
        // Solo agregar archivos si se seleccionaron nuevos
        if (data.banner_url instanceof File) {
            formData.append('banner_url', data.banner_url);
        }
        
        if (data.hero_banner_url instanceof File) {
            formData.append('hero_banner_url', data.hero_banner_url);
        }

        // Usar router.post en lugar de put para FormData
        router.post(route('organizer.events.update', event.id), formData, {
            preserveScroll: true,
            preserveState: true,
            forceFormData: true,
            onStart: () => {
                toast.loading('Actualizando evento...', { id: 'update-event' });
            },
            onSuccess: () => {
                toast.success('Evento actualizado exitosamente', {
                    id: 'update-event',
                    description: 'Los cambios han sido guardados correctamente'
                });
            },
            onError: (errors: any) => {
                // Mostrar errores específicos del servidor
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    toast.error(Array.isArray(firstError) ? firstError[0] : firstError, { id: 'update-event' });
                } else {
                    toast.error('Error al actualizar el evento', {
                        id: 'update-event',
                        description: 'Verifique todos los campos e intente nuevamente'
                    });
                }
                console.log('Form errors:', errors);
            }
        });
    }

    return (
        <>
            <Head title={`Editar Evento - ${event.name}`} />            
            <div className='min-h-screen bg-background'>
                <div className='container mx-auto px-4 py-6'>
                    <div className="flex items-center mb-6">
                        <Link href={route('organizer.events.index')}>
                            <Button variant="outline" size="icon" className="mr-4">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Editar Evento</h1>
                            <p className="text-gray-600 mt-1">
                                Modifica los detalles de tu evento. La gestión de funciones se realiza por separado.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="category_id" className="text-card-foreground">Categoría <span className="text-red-500">*</span></Label>
                                        <Select value={String(data.category_id)} onValueChange={(value) => setData('category_id', Number(value))}>
                                            <SelectTrigger className="bg-background border-border text-foreground">
                                                <SelectValue placeholder="Seleccionar categoría" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={String(category.id)}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="venue_id" className="text-card-foreground">Recinto <span className="text-red-500">*</span></Label>
                                        <Select value={String(data.venue_id)} onValueChange={(value) => setData('venue_id', Number(value))}>
                                            <SelectTrigger className="bg-background border-border text-foreground">
                                                <SelectValue placeholder="Seleccionar recinto" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {venues.map((venue) => (
                                                    <SelectItem key={venue.id} value={String(venue.id)}>
                                                        {venue.name} - {venue.address}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="description" className="text-card-foreground">Descripción <span className="text-red-500">*</span></Label>
                                        <Textarea 
                                            id="description" 
                                            value={data.description} 
                                            onChange={(e) => setData('description', e.target.value)} 
                                            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                            rows={4}
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
                                                                        {data.name || 'NOMBRE DEL EVENTO'}
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
                                                        {/* Header section con la imagen */}
                                                        <div className="relative overflow-hidden" style={{ height: '260px' }}>
                                                            <img 
                                                                src={bannerPreview} 
                                                                alt="Banner preview desktop" 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>

                                                        {/* Bottom section - simulado */}
                                                        <div className="p-3 bg-white" style={{ height: '120px' }}>
                                                            <div className="flex items-center gap-1 mb-2" style={{ height: '16px' }}>
                                                                <div className="w-3 h-3 bg-gray-400 rounded-full flex-shrink-0"></div>
                                                                <span className="text-gray-600 text-xs font-medium uppercase truncate">
                                                                    UBICACIÓN, CIUDAD
                                                                </span>
                                                            </div>

                                                            <h2 className="text-black text-sm font-bold mb-2 leading-tight tracking-wide uppercase line-clamp-2" style={{ minHeight: '28px' }}>
                                                                {data.name || 'NOMBRE DEL EVENTO'}
                                                            </h2>

                                                            <div className="flex gap-4 mt-4">
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
                                                    <p className="text-xs text-muted-foreground mt-2">Vista en desktop y tablets</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Separador */}
                                    <div className="border-t border-border my-4"></div>

                                    {/* Hero Banner */}
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

                                    {/* Nota informativa */}
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start space-x-2">
                                            <div className="text-blue-600 mt-1">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-4 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
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

                                <div className="flex justify-end gap-2 mt-6">
                                    <Link href={route('organizer.events.index')}>
                                        <Button type="button" variant="outline">Cancelar</Button>
                                    </Link>
                                    <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary-hover">
                                        {processing ? <><LoaderCircle className='h-4 w-4 animate-spin' /> Guardando... </> : <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</>}
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

EditEvent.layout = (page: any) => <AppLayout children={page} />;