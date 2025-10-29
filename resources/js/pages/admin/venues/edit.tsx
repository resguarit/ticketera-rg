import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { PageProps } from '@/types/ui/ui';
import { Ciudad, Provincia, Venue } from '@/types';
import VenueForm from './VenueForm';
import BackButton from '@/components/Backbutton';

// Extender el tipo base Venue para la edición
interface VenueForEdit extends Venue {
    provincia_id: number;
    ciudad: Ciudad; // Hacemos que ciudad sea obligatoria en este contexto
    sectors: Sector[];
}

interface EditVenueProps extends PageProps {
    venue: VenueForEdit;
    provincias: Provincia[];
    ciudades: Ciudad[];
}

export default function EditVenue() {
    const { venue, provincias, ciudades } = usePage<EditVenueProps>().props;
    const { data, setData, post, processing, errors, progress } = useForm({
        _method: 'PUT',
        name: venue.name || '',
        address: venue.address || '',
        provincia_id_or_name: venue.provincia_id?.toString() || '',
        ciudad_name: venue.ciudad?.name || '',
        coordinates: venue.coordinates || '',
        banner: null as File | null,
        referring: venue.referring || '',
        sectors: venue.sectors || [], // <-- AÑADIR CAMPO
    });

    // Función para validar campos requeridos antes del envío
    const validateRequiredFields = () => {
        const requiredFields = [
            { field: 'name', label: 'Nombre del recinto', value: data.name },
            { field: 'address', label: 'Dirección', value: data.address },
            { field: 'provincia_id_or_name', label: 'Provincia', value: data.provincia_id_or_name },
            { field: 'ciudad_name', label: 'Ciudad', value: data.ciudad_name },
        ];

        for (const { field, label, value } of requiredFields) {
            if (!value || value.toString().trim() === '') {
                toast.error(`El campo ${label} es obligatorio`, { id: 'validation-error' });
                return false;
            }
        }

        // Validar sectores
        if (!data.sectors || data.sectors.length === 0) {
            toast.error('Debe agregar al menos un sector', { id: 'validation-error' });
            return false;
        }

        // Validar cada sector
        for (let i = 0; i < data.sectors.length; i++) {
            const sector = data.sectors[i];
            if (!sector.name || sector.name.trim() === '') {
                toast.error(`El nombre del sector ${i + 1} es obligatorio`, { id: 'validation-error' });
                return false;
            }
            if (!sector.capacity || sector.capacity <= 0) {
                toast.error(`La capacidad del sector "${sector.name}" debe ser mayor a 0`, { id: 'validation-error' });
                return false;
            }
        }

        // Validar coordenadas si se proporcionan
        if (data.coordinates && data.coordinates.trim() !== '') {
            const coords = data.coordinates.split(',').map(Number);
            if (coords.length !== 2 || coords.some(isNaN)) {
                toast.error('Las coordenadas deben tener el formato: latitud,longitud (ej: -34.6037,-58.3816)', { id: 'validation-error' });
                return false;
            }
        }

        // Validar archivo banner si se seleccionó
        if (data.banner) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(data.banner.type)) {
                toast.error('El banner debe ser una imagen válida (JPG, PNG, GIF o WebP)', { id: 'validation-error' });
                return false;
            }

            // Validar tamaño del archivo (máximo 2MB)
            const maxSize = 2 * 1024 * 1024; // 2MB en bytes
            if (data.banner.size > maxSize) {
                toast.error('El banner no puede ser mayor a 2MB', { id: 'validation-error' });
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

        post(route('admin.venues.update', venue.id), {
            onStart: () => {
                toast.loading('Actualizando recinto...', { id: 'update-venue' });
            },
            onSuccess: () => {
                toast.success('Recinto actualizado exitosamente', { id: 'update-venue' });
            },
            onError: (errors) => {
                console.log('Form errors:', errors);
                
                // Mostrar errores específicos del servidor
                if (errors.name) {
                    toast.error(`Nombre: ${errors.name}`, { id: 'update-venue' });
                } else if (errors.address) {
                    toast.error(`Dirección: ${errors.address}`, { id: 'update-venue' });
                } else if (errors.provincia_id_or_name) {
                    toast.error(`Provincia: ${errors.provincia_id_or_name}`, { id: 'update-venue' });
                } else if (errors.ciudad_name) {
                    toast.error(`Ciudad: ${errors.ciudad_name}`, { id: 'update-venue' });
                } else if (errors.coordinates) {
                    toast.error(`Coordenadas: ${errors.coordinates}`, { id: 'update-venue' });
                } else if (errors.banner) {
                    toast.error(`Banner: ${errors.banner}`, { id: 'update-venue' });
                } else if (errors.sectors) {
                    toast.error(`Sectores: ${errors.sectors}`, { id: 'update-venue' });
                } else {
                    toast.error('Error al actualizar el recinto. Verifique todos los campos', { id: 'update-venue' });
                }
            },
        });
    };

    return (
        <>
            <Head title={`Editar Recinto: ${venue.name}`} />
            <div className="container mx-auto p-6">
                <div className="flex items-center mb-6 gap-4">
                    <BackButton href={route('admin.venues.index')} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Editar Recinto</h1>
                        <p className="text-gray-600 mt-1">
                            Actualiza los datos del recinto "{venue.name}".
                        </p>
                    </div>
                </div>

                <Card className="max-w-4xl mx-auto bg-white">
                    <CardContent>
                        <VenueForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            onSubmit={submit}
                            provincias={provincias}
                            ciudades={ciudades}
                            submitText="Guardar Cambios"
                            venue={venue}
                            progress={progress}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EditVenue.layout = (page: any) => <AppLayout children={page} />;