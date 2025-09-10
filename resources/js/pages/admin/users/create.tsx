import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import UserForm from './UserForm';

export default function CreateUser() {
    const { data, setData, post, processing, errors, reset } = useForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dni: '',
        address: '',
        password: '',
        password_confirmation: '',
        email_verified: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => {
                reset();
            }
        });
    };

    return (
        <>
            <Head title="Crear Usuario - Panel Admin" />
            
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <Link href={route('admin.users.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Volver
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Usuario</h1>
                                <p className="text-gray-600 mt-1">
                                    Completa la información del nuevo cliente
                                </p>
                            </div>
                        </div>
                    </div>

                    <UserForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={submit}
                        submitText="Crear Usuario"
                        isEditing={false}
                    />
                </div>
            </div>
        </>
    );
}

// Asignamos el Layout de Administrador
CreateUser.layout = (page: any) => <AppLayout children={page} />;