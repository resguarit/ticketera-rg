import { FormEventHandler, useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Car, Save } from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import BackButton from '@/components/Backbutton';

export default function NewOrganizer() {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        referring: '',
        email: '',
        phone: '',
        logo_url: null as File | null,
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        tax: '',
    });

    useEffect(() => {
        return () => {
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('logo_url', file);
        if (logoPreview) {
            URL.revokeObjectURL(logoPreview);
        }
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setLogoPreview(null);
        }
    };

    // Función para validar campos requeridos antes del envío
    const validateRequiredFields = () => {
        const requiredFields = [
            { field: 'name', label: 'Nombre del organizador', value: data.name },
            { field: 'referring', label: 'Referente', value: data.referring },
            { field: 'email', label: 'Email', value: data.email },
            { field: 'phone', label: 'Teléfono', value: data.phone },
            { field: 'tax', label: 'Cargo por servicio', value: data.tax } // ahora obligatorio
        ];

        for (const { field, label, value } of requiredFields) {
            if (!value || value.toString().trim() === '') {
                toast.error(`El campo ${label} es obligatorio`, { id: 'validation-error' });
                return false;
            }
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            toast.error('El formato del email no es válido', { id: 'validation-error' });
            return false;
        }

        // Validar teléfono (formato básico)
        if (data.phone && data.phone.trim() !== '') {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
            if (!phoneRegex.test(data.phone)) {
                toast.error('El formato del teléfono no es válido', { id: 'validation-error' });
                return false;
            }
        }

        // Validar porcentaje de tax (ya es obligatorio)
        if (data.tax && data.tax.trim() !== '') {
            const taxValue = parseFloat(data.tax);
            if (isNaN(taxValue) || taxValue < 0 || taxValue > 100) {
                toast.error('El cargo por servicio debe ser un número entre 0 y 100', { id: 'validation-error' });
                return false;
            }
        } else {
            // Esta rama normalmente no se alcanzará porque tax es requerido arriba,
            // pero la dejamos por seguridad en caso de cambios futuros.
            toast.error('El cargo por servicio es obligatorio', { id: 'validation-error' });
            return false;
        }

        // Validar URLs de redes sociales si se proporcionan
        if (data.facebook_url && data.facebook_url.trim() !== '') {
            if (data.facebook_url.includes('facebook.com/') || data.facebook_url.includes('fb.com/')) {
                toast.error('Solo ingrese el nombre de usuario de Facebook, sin la URL completa', { id: 'validation-error' });
                return false;
            }
        }

        if (data.instagram_url && data.instagram_url.trim() !== '') {
            if (data.instagram_url.includes('instagram.com/') || data.instagram_url.includes('@')) {
                toast.error('Solo ingrese el nombre de usuario de Instagram, sin la URL completa ni @', { id: 'validation-error' });
                return false;
            }
        }

        if (data.twitter_url && data.twitter_url.trim() !== '') {
            if (data.twitter_url.includes('x.com/') || data.twitter_url.includes('twitter.com/') || data.twitter_url.includes('@')) {
                toast.error('Solo ingrese el nombre de usuario de Twitter/X, sin la URL completa ni @', { id: 'validation-error' });
                return false;
            }
        }

        // Validar archivo de logo si se seleccionó
        if (data.logo_url) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(data.logo_url.type)) {
                toast.error('El logo debe ser una imagen válida (JPG, PNG, GIF o WebP)', { id: 'validation-error' });
                return false;
            }

            // Validar tamaño del archivo (máximo 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB en bytes
            if (data.logo_url.size > maxSize) {
                toast.error('El logo no puede ser mayor a 5MB', { id: 'validation-error' });
                return false;
            }
        }

        return true;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Validar antes de enviar
        if (!validateRequiredFields()) {
            return;
        }

        post(route('admin.organizers.store'), {
            onStart: () => {
                toast.loading('Creando organizador...', { id: 'create-organizer' });
            },
            onSuccess: () => {
                toast.success('Organizador creado exitosamente', { id: 'create-organizer' });
            },
            onError: (errors) => {
                console.log('Form errors:', errors);

                // Mostrar errores específicos del servidor
                if (errors.name) {
                    toast.error(`Nombre: ${errors.name}`, { id: 'create-organizer' });
                } else if (errors.referring) {
                    toast.error(`Referente: ${errors.referring}`, { id: 'create-organizer' });
                } else if (errors.email) {
                    toast.error(`Email: ${errors.email}`, { id: 'create-organizer' });
                } else if (errors.phone) {
                    toast.error(`Teléfono: ${errors.phone}`, { id: 'create-organizer' });
                } else if (errors.tax) {
                    toast.error(`Cargo por servicio: ${errors.tax}`, { id: 'create-organizer' });
                } else if (errors.logo_url) {
                    toast.error(`Logo: ${errors.logo_url}`, { id: 'create-organizer' });
                } else if (errors.facebook_url) {
                    toast.error(`Facebook: ${errors.facebook_url}`, { id: 'create-organizer' });
                } else if (errors.instagram_url) {
                    toast.error(`Instagram: ${errors.instagram_url}`, { id: 'create-organizer' });
                } else if (errors.twitter_url) {
                    toast.error(`Twitter: ${errors.twitter_url}`, { id: 'create-organizer' });
                } else {
                    toast.error('Error al crear el organizador. Verifique todos los campos', { id: 'create-organizer' });
                }
            },
        });
    };

    return (
        <>
            <Head title='Crear Organizador' />
            <div className='min-h-screen bg-background'>
                <div className='container mx-auto px-4 py-6'>
                    <div className='flex items-center justify-between mb-6'>
                        <div className="flex items-center space-x-4">
                            <BackButton
                                href={route('admin.organizers.index')}
                            />
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Crear Organizador</h2>
                                <p className='text-gray-600 mt-1'>Complete el formulario para crear un nuevo organizador.</p>
                            </div>
                        </div>

                    </div>

                    <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                        <Card className='bg-white shadow-lg border-gray-200'>
                            <CardHeader className='pb-0'>
                                <CardTitle className='text-lg font-semibold text-black'>Información del Organizador</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name" className="text-black">
                                            Nombre del Organizador <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                                            placeholder="Ej: MusicPro Events"
                                        />
                                        <InputError message={errors.name} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="referring" className="text-black">
                                            Referente <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="referring"
                                            value={data.referring}
                                            onChange={(e) => setData('referring', e.target.value)}
                                            className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                                            placeholder="Ej: Juan Pérez"
                                        />
                                        <InputError message={errors.referring} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="email" className="text-black">
                                            Email <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                                            placeholder="contacto@musicpro.com"
                                        />
                                        <InputError message={errors.email} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone" className="text-black">
                                            Teléfono <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                                            placeholder="+54 11 1234-5678"
                                        />
                                        <InputError message={errors.phone} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="tax" className="text-black">Cargo por servicio (%)<span className="text-red-500">*</span></Label>
                                        <Input
                                            id="tax"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={data.tax}
                                            onChange={(e) => setData('tax', e.target.value)}
                                            className="bg-white border-gray-300 text-black placeholder:text-gray-500"
                                            placeholder="5.5"
                                        />
                                        <InputError message={errors.tax} className="mt-1" />
                                        <p className="text-xs text-gray-500 mt-1">Porcentaje de comisión por venta (0-100)</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Redes Sociales */}
                        <Card className='bg-white shadow-lg border-gray-200'>
                            <CardHeader className='pb-0'>
                                <CardTitle className='text-lg font-semibold text-black'>Redes Sociales</CardTitle>
                                <p className="text-sm text-gray-600">Solo ingrese el nombre de usuario, sin la URL completa</p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="facebook_url" className="text-black">Facebook</Label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 text-sm text-gray-600 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                                                facebook.com/
                                            </span>
                                            <Input
                                                id="facebook_url"
                                                value={data.facebook_url}
                                                onChange={(e) => setData('facebook_url', e.target.value)}
                                                className="rounded-l-none bg-white border-gray-300 text-black placeholder:text-gray-500"
                                                placeholder="musicproevents"
                                            />
                                        </div>
                                        <InputError message={errors.facebook_url} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="instagram_url" className="text-black">Instagram</Label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 text-sm text-gray-600 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                                                instagram.com/
                                            </span>
                                            <Input
                                                id="instagram_url"
                                                value={data.instagram_url}
                                                onChange={(e) => setData('instagram_url', e.target.value)}
                                                className="rounded-l-none bg-white border-gray-300 text-black placeholder:text-gray-500"
                                                placeholder="musicproevents"
                                            />
                                        </div>
                                        <InputError message={errors.instagram_url} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="twitter_url" className="text-black">Twitter / X</Label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 text-sm text-gray-600 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                                                x.com/
                                            </span>
                                            <Input
                                                id="twitter_url"
                                                value={data.twitter_url}
                                                onChange={(e) => setData('twitter_url', e.target.value)}
                                                className="rounded-l-none bg-white border-gray-300 text-black placeholder:text-gray-500"
                                                placeholder="musicproevents"
                                            />
                                        </div>
                                        <InputError message={errors.twitter_url} className="mt-1" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Logo */}
                        <Card className='bg-white shadow-lg border-gray-200'>
                            <CardHeader className='pb-0'>
                                <CardTitle className='text-lg font-semibold text-black'>Logo</CardTitle>
                                <p className="text-sm text-gray-600">Sube el logo de tu organización (máximo 5MB)</p>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-start'>
                                    <div className='space-y-2'>
                                        <Label htmlFor="logo" className="text-black">Subir Logo</Label>
                                        <div className='flex items-center py-4'>
                                            <Input
                                                className='w-full bg-white border-gray-300 text-black file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200'
                                                id="logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">Formatos soportados: JPG, PNG, GIF, WebP</p>
                                        <InputError message={errors.logo_url} className="mt-1" />
                                    </div>
                                    {logoPreview && (
                                        <div className="space-y-2">
                                            <Label className="text-black">Vista Previa del Logo</Label>
                                            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                                <img
                                                    src={logoPreview}
                                                    alt="Vista previa"
                                                    className="h-32 w-32 object-contain mx-auto rounded-md"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex w-full justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="w-fit"
                            >
                                <Link href={route('admin.organizers.index')}>
                                    Cancelar
                                </Link>
                            </Button>
                            <Button
                                onClick={submit}
                                disabled={processing}
                                className="bg-primary text-white hover:bg-primary-hover"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Guardando...' : 'Guardar Organizador'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )

}

NewOrganizer.layout = (page: any) => <AppLayout children={page} />;