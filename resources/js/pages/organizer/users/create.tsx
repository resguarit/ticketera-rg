import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import UserForm from './UserForm';
import { UserPlus } from 'lucide-react';

interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dni: string;
    password: string;
    password_confirmation: string;
    [key: string]: any;
}

export default function CreateUser() {
    const { data, setData, post, processing, errors } = useForm<UserFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dni: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('organizer.users.store'));
    };

    return (
        <AppLayout>
            <Head title="Crear Usuario" />

            <div className="space-y-6">
                <div className="flex items-center space-x-3">
                    <UserPlus className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold">Crear Usuario</h1>
                        <p className="text-muted-foreground mt-1">
                            Añade un nuevo usuario a tu organización
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Usuario</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <UserForm
                                data={data}
                                setData={setData}
                                errors={errors}
                                processing={processing}
                                onSubmit={submit}
                                submitText="Crear Usuario"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}