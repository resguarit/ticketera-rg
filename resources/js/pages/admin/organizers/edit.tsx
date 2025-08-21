import { FormEventHandler, useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, RefreshCcw } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

interface Organizer {
  id: number;
  name: string;
  referring: string | null;
  email: string;
  phone: string | null;
  logo_url: string | null;
  image_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  tax: string | null;
}

export default function EditOrganizer() {
  const { props } = usePage<{ organizer: Organizer }>();
  const organizer = props.organizer;

  const { data, setData, post, processing, errors, reset } = useForm({
    _method: 'PUT', // method spoofing
    name: organizer.name || '',
    referring: organizer.referring || '',
    email: organizer.email || '',
    phone: organizer.phone || '',
    logo_url: null as File | null,
    facebook_url: organizer.facebook_url ? stripPrefix(organizer.facebook_url, ['https://www.facebook.com/', 'https://facebook.com/']) : '',
    instagram_url: organizer.instagram_url ? stripPrefix(organizer.instagram_url, ['https://www.instagram.com/', 'https://instagram.com/']) : '',
    twitter_url: organizer.twitter_url ? stripPrefix(organizer.twitter_url, ['https://x.com/', 'https://www.x.com/']) : '',
    tax: organizer.tax || '',
  });

  const existingLogoResolved = organizer.image_url;
  const [logoPreview, setLogoPreview] = useState<string | null>(existingLogoResolved);
  const [originalLogo, setOriginalLogo] = useState<string | null>(organizer.image_url);

  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  function stripPrefix(value: string, prefixes: string[]) {
    for (const p of prefixes) {
      if (value.startsWith(p)) return value.substring(p.length);
    }
    return value;
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setData('logo_url', file);
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview((originalLogo));
    }
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('admin.organizers.update', organizer.id));
  };

  const resetForm = () => {
    reset();
    setLogoPreview(originalLogo);
  };

  return (
    <> 
      <Head title={`Editar Organizador: ${organizer.name}`} />
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h2 className="section text-foreground">Editar Organizador</h2>
              <p className='text-muted-foreground'>Actualice los datos del organizador.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={route('admin.organizers.index')}>
                <Button variant="ghost" className="text-foreground hover:bg-accent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <Button onClick={submit} disabled={processing} className="bg-primary text-primary-foreground hover:bg-primary-hover">
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={processing}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Restablecer
              </Button>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
            <Card className='bg-card shadow-lg border-border'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold text-card-foreground'>Información del Organizador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-card-foreground">Nombre del Organizador</Label>
                    <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    <InputError message={errors.name} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="referring" className="text-card-foreground">Referente</Label>
                    <Input id="referring" value={data.referring} onChange={e => setData('referring', e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    <InputError message={errors.referring} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-card-foreground">Email</Label>
                    <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    <InputError message={errors.email} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-card-foreground">Teléfono</Label>
                    <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    <InputError message={errors.phone} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="tax" className="text-card-foreground">Cargo por servicio (%)</Label>
                    <Input id="tax" value={data.tax} onChange={e => setData('tax', e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    <InputError message={errors.tax} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-card shadow-lg border-border'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold text-card-foreground'>Redes Sociales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facebook_url" className="text-card-foreground">Facebook</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 border-border rounded-l-md">facebook.com/</span>
                      <Input id="facebook_url" value={data.facebook_url} onChange={e => setData('facebook_url', e.target.value)} className="rounded-l-none bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    </div>
                    <InputError message={errors.facebook_url} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="instagram_url" className="text-card-foreground">Instagram</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 border-border rounded-l-md">instagram.com/</span>
                      <Input id="instagram_url" value={data.instagram_url} onChange={e => setData('instagram_url', e.target.value)} className="rounded-l-none bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    </div>
                    <InputError message={errors.instagram_url} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="twitter_url" className="text-card-foreground">Twitter</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 border-border rounded-l-md">x.com/</span>
                      <Input id="twitter_url" value={data.twitter_url} onChange={e => setData('twitter_url', e.target.value)} className="rounded-l-none bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    </div>
                    <InputError message={errors.twitter_url} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-card shadow-lg border-border'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold text-card-foreground'>Logo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-start'>
                  <div className='space-y-2'>
                    <Label htmlFor="logo" className="text-card-foreground">Cambiar Logo</Label>
                    <div className='flex items-center py-4'>
                      <Input className='w-fit bg-background border-border text-foreground' id="logo" type="file" onChange={handleLogoChange} />
                      <InputError message={errors.logo_url} className="mt-1" />
                    </div>
                  </div>
                  {logoPreview && (
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Vista Previa del Logo</Label>
                      <img src={logoPreview} alt="Vista previa" className="h-32 w-32 object-contain rounded-md border p-2 bg-muted border-border" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </>
  );
}

EditOrganizer.layout = (page: any) => <AppLayout children={page} />;
