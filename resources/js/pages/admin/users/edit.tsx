import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import UserForm from './UserForm';

interface UserData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dni: string;
    address: string;
    email_verified: boolean;
}

interface PageProps {
    user: UserData;
}

export default function EditUser() {
    const { user } = usePage<PageProps>().props;
    
    const { data, setData, put, processing, errors } = useForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dni: user.dni || '',
        address: user.address || '',
        password: '',
        password_confirmation: '',
        email_verified: user.email_verified || false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    return (
        <>
            <Head title={`Editar Usuario: ${user.firstName} ${user.lastName} - Panel Admin`} />
            
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
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Editar Usuario: {user.firstName} {user.lastName}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Modifica la información del cliente
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
                        submitText="Guardar Cambios"
                        user={user}
                        isEditing={true}
                    />
                </div>
            </div>
        </>
    );
}

// Asignamos el Layout de Administrador
EditUser.layout = (page: any) => <AppLayout children={page} />;