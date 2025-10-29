import { FormEventHandler, useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import BackButton from '@/components/Backbutton';

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

  // Función para validar campos requeridos antes del envío
  const validateRequiredFields = () => {
    const requiredFields = [
      { field: 'name', label: 'Nombre del organizador', value: data.name },
      { field: 'referring', label: 'Referente', value: data.referring },
      { field: 'email', label: 'Email', value: data.email },
      { field: 'phone', label: 'Teléfono', value: data.phone },
      { field: 'tax', label: 'Cargo por servicio', value: data.tax }
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

    // Validar porcentaje de tax
    if (data.tax && data.tax.trim() !== '') {
      const taxValue = parseFloat(data.tax);
      if (isNaN(taxValue) || taxValue < 0 || taxValue > 100) {
        toast.error('El cargo por servicio debe ser un número entre 0 y 100', { id: 'validation-error' });
        return false;
      }
    } else {
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

    post(route('admin.organizers.update', organizer.id), {
      onStart: () => {
        toast.loading('Actualizando organizador...', { id: 'update-organizer' });
      },
      onSuccess: () => {
        toast.success('Organizador actualizado exitosamente', { id: 'update-organizer' });
      },
      onError: (errors) => {
        console.log('Form errors:', errors);
        
        // Mostrar errores específicos del servidor
        if (errors.name) {
          toast.error(`Nombre: ${errors.name}`, { id: 'update-organizer' });
        } else if (errors.referring) {
          toast.error(`Referente: ${errors.referring}`, { id: 'update-organizer' });
        } else if (errors.email) {
          toast.error(`Email: ${errors.email}`, { id: 'update-organizer' });
        } else if (errors.phone) {
          toast.error(`Teléfono: ${errors.phone}`, { id: 'update-organizer' });
        } else if (errors.tax) {
          toast.error(`Cargo por servicio: ${errors.tax}`, { id: 'update-organizer' });
        } else if (errors.logo_url) {
          toast.error(`Logo: ${errors.logo_url}`, { id: 'update-organizer' });
        } else if (errors.facebook_url) {
          toast.error(`Facebook: ${errors.facebook_url}`, { id: 'update-organizer' });
        } else if (errors.instagram_url) {
          toast.error(`Instagram: ${errors.instagram_url}`, { id: 'update-organizer' });
        } else if (errors.twitter_url) {
          toast.error(`Twitter: ${errors.twitter_url}`, { id: 'update-organizer' });
        } else {
          toast.error('Error al actualizar el organizador. Verifique todos los campos', { id: 'update-organizer' });
        }
      },
    });
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
            <div className='flex items-center gap-2'>
              <BackButton href={route('admin.organizers.index')} />
              <div>
              <h2 className="text-3xl font-bold text-gray-900">Editar Organizador</h2>
              <p className='text-gray-600 mt-1'>Actualice los datos del organizador.</p>
            </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={submit} disabled={processing} className="bg-primary text-primary-foreground hover:bg-primary-hover">
                <Save className="w-4 h-4 mr-2" />
                {processing ? 'Guardando...' : 'Guardar Cambios'}
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
                    <Label htmlFor="name" className="text-card-foreground">
                      Nombre del Organizador <span className="text-red-500">*</span>
                    </Label>
                    <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    <InputError message={errors.name} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="referring" className="text-card-foreground">
                      Referente <span className="text-red-500">*</span>
                    </Label>
                    <Input id="referring" value={data.referring} onChange={e => setData('referring', e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    <InputError message={errors.referring} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-card-foreground">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    <InputError message={errors.email} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-card-foreground">
                      Teléfono <span className="text-red-500">*</span>
                    </Label>
                    <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    <InputError message={errors.phone} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="tax" className="text-card-foreground">
                      Cargo por servicio (%) <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="tax" 
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={data.tax} 
                      onChange={e => setData('tax', e.target.value)} 
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground" 
                    />
                    <InputError message={errors.tax} className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">Porcentaje de comisión por venta (0-100)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-card shadow-lg border-border'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold text-card-foreground'>Redes Sociales</CardTitle>
                <p className="text-sm text-muted-foreground">Solo ingrese el nombre de usuario, sin la URL completa</p>
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
                <p className="text-sm text-muted-foreground">Cambie el logo de su organización (máximo 5MB)</p>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-start'>
                  <div className='space-y-2'>
                    <Label htmlFor="logo" className="text-card-foreground">Cambiar Logo</Label>
                    <div className='flex items-center py-4'>
                      <Input 
                        className='w-full bg-background border-border text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-muted file:text-muted-foreground hover:file:bg-muted/80' 
                        id="logo" 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoChange} 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Formatos soportados: JPG, PNG, GIF, WebP</p>
                    <InputError message={errors.logo_url} className="mt-1" />
                  </div>
                  {logoPreview && (
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Vista Previa del Logo</Label>
                      <div className="border border-border rounded-lg p-4 bg-muted">
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
          </form>
        </div>
      </div>
    </>
  );
}

EditOrganizer.layout = (page: any) => <AppLayout children={page} />;
