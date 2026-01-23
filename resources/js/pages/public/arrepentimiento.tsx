import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { PageProps } from '@/types';
import { toast } from 'sonner';

interface ArrepentimientoPageProps extends PageProps {
    supportEmail: string;
    supportPhone: string;
}

export default function Arrepentimiento() {
    const { supportEmail, supportPhone } = usePage<ArrepentimientoPageProps>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        subject: 'Solicitud de Arrepentimiento',
        name: '',
        dni: '',
        cardHolderDni: '',
        orderNumber: '',
        description: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Construir el mensaje con todos los datos
            const message = `
Solicitud de Arrepentimiento

Nombre y Apellido: ${formData.name}
DNI: ${formData.dni}
DNI Titular Tarjeta: ${formData.cardHolderDni || 'No proporcionado'}
Número de Compra: ${formData.orderNumber || 'No proporcionado'}

Descripción:
${formData.description}
            `.trim();

            router.post(route('arrepentimiento.send'), {
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: message,
                // Campos adicionales para la plantilla de arrepentimiento
                dni: formData.dni,
                cardHolderDni: formData.cardHolderDni,
                orderNumber: formData.orderNumber,
                description: formData.description,
            }, {
                onSuccess: () => {
                    toast.success('Solicitud enviada correctamente. Nos pondremos en contacto pronto.');
                    // Resetear formulario
                    setFormData({
                        email: '',
                        subject: 'Solicitud de Arrepentimiento',
                        name: '',
                        dni: '',
                        cardHolderDni: '',
                        orderNumber: '',
                        description: '',
                    });
                },
                onError: () => {
                    toast.error('Hubo un error al enviar la solicitud. Por favor intenta más tarde.');
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            toast.error('Hubo un error al enviar la solicitud.');
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <Head title="Botón de Arrepentimiento" />
            <Header />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-background">
                <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <Link href={route('home')}>
                            <Button variant="ghost" className="mb-4 text-foreground hover:bg-accent">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver al Inicio
                            </Button>
                        </Link>
                        
                        <div className="text-center mb-6">
                            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                                Botón de Arrepentimiento
                            </h1>
                            <p className="text-foreground/60 text-base">
                                Ejercé tu derecho según la Ley de Defensa del Consumidor
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Información sobre el derecho */}
                        <Card className="bg-blue-50 border-blue-200 shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center gap-2">
                                    <Info className="w-5 h-5" />
                                    Información Importante
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-foreground/80">
                                <p>
                                    Según la Ley de Defensa del Consumidor (Ley 24.240), tenés derecho a arrepentirte 
                                    de tu compra dentro de los <strong>10 días corridos</strong> posteriores a la fecha de adquisición.
                                </p>
                                <p>
                                    Para ejercer este derecho, completá el formulario a continuación con tus datos y 
                                    nos pondremos en contacto a la brevedad para gestionar tu solicitud.
                                </p>
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        El cargo por servicio no será reembolsable según nuestros términos y condiciones.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>

                        {/* Formulario */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">
                                    Formulario de Arrepentimiento
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-foreground">
                                            Correo Electrónico <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="tu@email.com"
                                            className="bg-white border-gray-200"
                                            required
                                        />
                                    </div>

                                    {/* Nombre y Apellido */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-foreground">
                                            Nombre y Apellido <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Juan Pérez"
                                            className="bg-white border-gray-200"
                                            required
                                        />
                                    </div>

                                    {/* DNI */}
                                    <div className="space-y-2">
                                        <Label htmlFor="dni" className="text-foreground">
                                            DNI (sin puntos) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="dni"
                                            name="dni"
                                            type="text"
                                            value={formData.dni}
                                            onChange={handleChange}
                                            placeholder="12345678"
                                            pattern="[0-9]{7,8}"
                                            className="bg-white border-gray-200"
                                            required
                                        />
                                    </div>

                                    {/* DNI Titular Tarjeta */}
                                    <div className="space-y-2">
                                        <Label htmlFor="cardHolderDni" className="text-foreground">
                                            DNI del Titular de la Tarjeta (sin puntos)
                                        </Label>
                                        <Input
                                            id="cardHolderDni"
                                            name="cardHolderDni"
                                            type="text"
                                            value={formData.cardHolderDni}
                                            onChange={handleChange}
                                            placeholder="12345678"
                                            pattern="[0-9]{7,8}"
                                            className="bg-white border-gray-200"
                                        />
                                        <p className="text-sm text-foreground/60">
                                            Solo si es diferente al tuyo
                                        </p>
                                    </div>

                                    {/* Número de Compra */}
                                    <div className="space-y-2">
                                        <Label htmlFor="orderNumber" className="text-foreground">
                                            Número de Compra
                                        </Label>
                                        <Input
                                            id="orderNumber"
                                            name="orderNumber"
                                            type="text"
                                            value={formData.orderNumber}
                                            onChange={handleChange}
                                            placeholder="ORD-123456"
                                            className="bg-white border-gray-200"
                                        />
                                        <p className="text-sm text-foreground/60">
                                            Podés encontrar tu número de compra en{' '}
                                            <Link 
                                                href={route('my-tickets')} 
                                                className="text-primary hover:underline"
                                            >
                                                Mis Entradas
                                            </Link>
                                        </p>
                                    </div>

                                    {/* Descripción */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-foreground">
                                            Descripción <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Por favor, describí el motivo de tu arrepentimiento..."
                                            className="bg-white border-gray-200 min-h-[120px] resize-none"
                                            required
                                        />
                                    </div>

                                    {/* Botón Submit */}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-primary hover:bg-primary-hover text-white"
                                    >
                                        {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Información de contacto */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">
                                    ¿Necesitás ayuda?
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-foreground/80">
                                <p>También podés contactarnos por:</p>
                                <div className="space-y-1">
                                    <p><strong>Email:</strong> {supportEmail}</p>
                                    <p><strong>Teléfono:</strong> {supportPhone}</p>
                                </div>
                                <div className="pt-4">
                                    <Link href={route('help')}>
                                        <Button 
                                            variant="outline"
                                            className="border-primary text-primary hover:bg-primary hover:text-white"
                                        >
                                            Ir al Centro de Ayuda
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            
            <Footer />
        </>
    );
}