import { FormEventHandler, useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Car, Save } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

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
        decidir_public_key_prod: '',
        decidir_secret_key_prod: '',
        decidir_public_key_test: '',
        decidir_secret_key_test: '',
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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.organizers.store'));
    };

    return (
        <>
            <Head title='Crear Organizador' />
            <div className='min-h-screen bg-white'>
                <div className='container mx-auto px-4 py-6'>
                    <div className='flex items-center justify-between mb-6'>
                        <div>
                            <h1 className='text-2xl font-bold text-black'>Crear Organizador</h1>
                            <p className='text-gray-600'>Complete el formulario para crear un nuevo organizador.</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Link href="/admin/organizers">
                                <Button variant="ghost" className="text-black hover:bg-gray-100">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Volver
                                </Button>
                            </Link>
                            <Button onClick={submit} disabled={processing} className="bg-black text-white hover:bg-gray-800">
                                <Save className="w-4 h-4 mr-2" />
                                Guardar Organizador
                            </Button>
                        </div>
                    </div>
                    <form onSubmit={submit} className="space-y-6">
                        <Card className='bg-white shadow-lg border-gray-300'>
                            <CardHeader>
                                <CardTitle className='text-lg font-semibold text-black'>Información del Organizador</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Nombre del Organizador</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="referring">Referente</Label>
                                    <Input id="referring" value={data.referring} onChange={(e) => setData('referring', e.target.value)} />
                                    <InputError message={errors.referring} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    <InputError message={errors.email} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                    <InputError message={errors.phone} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="tax">CUIT / Tax ID</Label>
                                    <Input id="tax" value={data.tax} onChange={(e) => setData('tax', e.target.value)} />
                                    <InputError message={errors.tax} className="mt-1" />
                                </div>
                                </div>
                            </CardContent>
                            </Card>

                            {/* Redes Sociales */}
                            <Card className='bg-white shadow-lg border-gray-300'>
                            <CardHeader>
                                <CardTitle className='text-lg font-semibold text-black'>Redes Sociales</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="facebook_url">Facebook</Label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                                            facebook.com/
                                        </span>
                                        <Input id="facebook_url" value={data.facebook_url} onChange={(e) => setData('facebook_url', e.target.value)} className="rounded-l-none" />
                                    </div>
                                    <InputError message={errors.facebook_url} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="instagram_url">Instagram</Label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                                            instagram.com/
                                        </span>
                                        <Input id="instagram_url" value={data.instagram_url} onChange={(e) => setData('instagram_url', e.target.value)} className="rounded-l-none" />
                                    </div>
                                    <InputError message={errors.instagram_url} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="twitter_url">Twitter</Label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                                            x.com/
                                        </span>
                                        <Input id="twitter_url" value={data.twitter_url} onChange={(e) => setData('twitter_url', e.target.value)} className="rounded-l-none" />
                                    </div>
                                    <InputError message={errors.twitter_url} className="mt-1" />
                                </div>
                                </div>
                            </CardContent>
                            </Card>

                            {/* Logo */}
                            <Card className='bg-white shadow-lg border-gray-300'>
                                <CardHeader>
                                    <CardTitle className='text-lg font-semibold text-black'>Logo</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-start'>
                                        <div className='space-y-2'>
                                            <Label htmlFor="logo">Subir Logo</Label>
                                            <div className='flex items-center py-4'>
                                                <Input className='w-fit' id="logo" type="file" onChange={handleLogoChange} />
                                                <InputError message={errors.logo_url} className="mt-1" />
                                            </div>
                                        </div>
                                        {logoPreview && (
                                            <div className="space-y-2">
                                                <Label>Vista Previa del Logo</Label>
                                                <img src={logoPreview} alt="Vista previa" className="h-32 w-32 object-contain rounded-md border p-2 bg-gray-50" />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                    </form>
                </div>
            </div>
        </>
    )

}

NewOrganizer.layout = (page: any) => <AppLayout children={page} />;