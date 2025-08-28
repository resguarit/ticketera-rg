import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageProps } from '@/types/ui/ui';
import { Ciudad, Venue } from '@/types';
import VenueForm from './VenueForm';

interface EditVenueProps extends PageProps {
    venue: Venue;
    ciudades: (Ciudad & { provincia: { name: string } })[];
}

export default function EditVenue() {
    const { venue, ciudades } = usePage<EditVenueProps>().props;
    const { data, setData, post, processing, errors, progress } = useForm({
        _method: 'PUT', // Importante para que Laravel trate el POST como PUT
        name: venue.name || '',
        address: venue.address || '',
        ciudad_id: venue.ciudad_id?.toString() || '',
        coordinates: venue.coordinates || '',
        banner: null as File | null,
        referring: venue.referring || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Usamos 'post' porque Inertia maneja la carga de archivos (multipart/form-data)
        // solo con POST. El campo '_method: PUT' le dice a Laravel que lo trate como una solicitud PUT.
        post(route('organizer.venues.update', venue.id));
    };

    return (
        <>
            <Head title={`Editar Recinto: ${venue.name}`} />
            <div className="container mx-auto p-6">
                <Card className="max-w-4xl mx-auto bg-white">
                    <CardHeader>
                        <CardTitle>Editar Recinto</CardTitle>
                        <CardDescription>Actualiza los datos del recinto.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VenueForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            onSubmit={submit}
                            ciudades={ciudades}
                            submitText="Guardar Cambios"
                            venue={venue} // Pasamos el venue para la vista previa de la imagen
                            progress={progress}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EditVenue.layout = (page: any) => <AppLayout children={page} />;