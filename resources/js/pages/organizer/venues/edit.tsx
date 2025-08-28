import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageProps } from '@/types/ui/ui';
import { Ciudad, Provincia, Venue } from '@/types';
import VenueForm from './VenueForm';

interface EditVenueProps extends PageProps {
    venue: Venue & { provincia_id: number, ciudad: Ciudad };
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
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
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