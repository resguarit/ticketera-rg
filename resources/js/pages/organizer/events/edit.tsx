import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { Event, Category, Venue, EventFunction } from '@/types';
import InputError from '@/components/input-error';
import { useEffect, useState } from 'react';

interface EditEventProps {
    event: Event & { functions: EventFunction[], image_url?: string };
    categories: Category[];
    venues: Venue[];
}

export default function EditEvent({ event, categories, venues }: EditEventProps) {
    const [bannerPreview, setBannerPreview] = useState<string | null>(event.image_url || null);

    const { data, setData, put, processing, errors, wasSuccessful } = useForm({
        _method: 'PUT',
        name: event.name || '',
        description: event.description || '',
        category_id: event.category_id || '',
        venue_id: event.venue_id || '',
        featured: event.featured || false,
        banner_url: null as File | null,
    });

    useEffect(() => {
        return () => {
            if (bannerPreview && bannerPreview.startsWith('blob:')) {
                URL.revokeObjectURL(bannerPreview);
            }
        };
    }, [bannerPreview]);

    function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null;
        setData('banner_url', file);

        if (bannerPreview && bannerPreview.startsWith('blob:')) {
            URL.revokeObjectURL(bannerPreview);
        }

        if (file) {
            setBannerPreview(URL.createObjectURL(file));
        } else {
            setBannerPreview(event.image_url || null);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('organizer.events.update', event.id), {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={`Editar Evento - ${event.name}`} />

            <div className="container mx-auto p-6">
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

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General del Evento</CardTitle>
                            <CardDescription>
                                Actualiza los datos principales de tu evento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="name">Nombre del Evento</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                <div>
                                    <Label htmlFor="category_id">Categoría</Label>
                                    <Select
                                        value={String(data.category_id)}
                                        onValueChange={(value) => setData('category_id', Number(value))}
                                    >
                                        <SelectTrigger id="category_id" className="mt-1">
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={String(category.id)}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.category_id} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1"
                                    rows={5}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="venue_id">Lugar / Recinto</Label>
                                    <Select
                                        value={String(data.venue_id)}
                                        onValueChange={(value) => setData('venue_id', Number(value))}
                                    >
                                        <SelectTrigger id="venue_id" className="mt-1">
                                            <SelectValue placeholder="Selecciona un lugar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {venues.map((venue) => (
                                                <SelectItem key={venue.id} value={String(venue.id)}>
                                                    {venue.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.venue_id} className="mt-2" />
                                </div>
                                <div>
                                    <Label htmlFor="banner_url">Banner del Evento (Opcional)</Label>
                                    {bannerPreview && (
                                        <div className="mt-2 mb-4">
                                            <img src={bannerPreview} alt="Vista previa del banner" className="w-full h-32 object-cover rounded-md border" />
                                        </div>
                                    )}
                                    <Input
                                        id="banner_url"
                                        type="file"
                                        onChange={handleBannerChange}
                                        className="mt-1"
                                        accept="image/*"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Sube una nueva imagen para reemplazar la actual. Formatos: JPG, PNG. Max: 2MB.</p>
                                    <InputError message={errors.banner_url} className="mt-2" />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="featured"
                                    checked={data.featured}
                                    onCheckedChange={(checked) => setData('featured', Boolean(checked))}
                                />
                                <Label htmlFor="featured" className="font-normal">
                                    Marcar como evento destacado
                                </Label>
                            </div>
                            <InputError message={errors.featured} className="mt-2" />

                            <div className="flex justify-end gap-2">
                                <Link href={route('organizer.events.index')}>
                                    <Button type="button" variant="outline">Cancelar</Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary-hover">
                                    <Save className="w-4 h-4 mr-2" />
                                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

EditEvent.layout = (page: any) => <AppLayout children={page} />;