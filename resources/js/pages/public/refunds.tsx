import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function Refunds() {
    const { data, setData, post, processing, errors } = useForm({
        nombre_completo: '',
        email: '',
        telefono: '',
        evento_nombre: '',
        motivo: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('refunds.store'));
    };

    return (
        <>
            <Head title="Solicitud de Reembolso - Ticketera RG ENTRADAS" />
            <Header />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-background">
                <div className="px-8 py-6 sm:py-8">
                    {/* Header */}
                    <div className="mb-2 ">
                        <Link href={route('home')}>
                            <Button variant="ghost" className="mb-4 text-foreground hover:bg-accent">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver al Inicio
                            </Button>
                        </Link>
                        

                    </div>

                    {/* Formulario */}
                    <div className="max-w-xl mx-auto">
                        <Card className="bg-white shadow-xl">
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-xl sm:text-3xl text-foreground">
                                    Formulario de Reembolso
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="nombre_completo" className="text-foreground">
                                            Nombre y Apellido Completo *
                                        </Label>
                                        <Input
                                            id="nombre_completo"
                                            type="text"
                                            value={data.nombre_completo}
                                            onChange={(e) => setData('nombre_completo', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                        {errors.nombre_completo && (
                                            <p className="mt-1 text-sm text-red-600">{errors.nombre_completo}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="email" className="text-foreground">
                                            Email *
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="telefono" className="text-foreground">
                                            Teléfono *
                                        </Label>
                                        <Input
                                            id="telefono"
                                            type="tel"
                                            value={data.telefono}
                                            onChange={(e) => setData('telefono', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                        {errors.telefono && (
                                            <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="evento_nombre" className="text-foreground">
                                            Nombre del Evento *
                                        </Label>
                                        <Input
                                            id="evento_nombre"
                                            type="text"
                                            value={data.evento_nombre}
                                            onChange={(e) => setData('evento_nombre', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                        {errors.evento_nombre && (
                                            <p className="mt-1 text-sm text-red-600">{errors.evento_nombre}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="motivo" className="text-foreground">
                                            Motivo del Reembolso *
                                        </Label>
                                        <Textarea
                                            id="motivo"
                                            value={data.motivo}
                                            onChange={(e) => setData('motivo', e.target.value)}
                                            className="mt-1"
                                            rows={4}
                                            placeholder="Describe el motivo de tu solicitud de reembolso..."
                                            required
                                        />
                                        {errors.motivo && (
                                            <p className="mt-1 text-sm text-red-600">{errors.motivo}</p>
                                        )}
                                    </div>

                                    <div className="pt-6 ">
                                        <Button
                                            type="submit"
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-medium"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <>Enviando Solicitud...</>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2" />
                                                    Enviar Solicitud de Reembolso
                                                </>
                                            )}
                                        </Button>

                                        <p className="mt-4 text-sm text-center text-foreground/60">
                                            Recibirás una confirmación por email y respuesta en un plazo máximo de 5 días hábiles.
                                        </p>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            
            <Footer />
        </>
    );
}