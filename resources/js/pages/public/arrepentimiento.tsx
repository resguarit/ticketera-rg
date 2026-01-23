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
        subject: '',
        name: '',
        dni: '',
        orderNumber: '',
        event: '',
        ticketQuantity: '',
        paymentMethod: '',
        reason: '', // Agregar aquí también
        declaration: 'Solicito la revocación de la compra en los términos del artículo 34 de la Ley 24.240 de Defensa del Consumidor.',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Construir el asunto con el número de orden
        const emailSubject = `Botón de Arrepentimiento – Orden N° ${formData.orderNumber}`;

        // Construir el mensaje con todos los datos requeridos
        const message = `
SOLICITUD DE ARREPENTIMIENTO

Nombre y Apellido del Titular: ${formData.name}
DNI: ${formData.dni}
Correo Electrónico: ${formData.email}
Número de Orden: ${formData.orderNumber}
Evento: ${formData.event}
Cantidad de Entradas: ${formData.ticketQuantity}
Medio de Pago: ${formData.paymentMethod}
${formData.reason ? `\nMotivo de la Devolución:\n${formData.reason}\n` : ''}
Manifestación Expresa:
${formData.declaration}
`.trim();

        try {
            router.post(route('arrepentimiento.send'), {
                name: formData.name,
                email: formData.email,
                subject: emailSubject,
                message: message,
                dni: formData.dni,
                orderNumber: formData.orderNumber,
                event: formData.event,
                ticketQuantity: formData.ticketQuantity,
                paymentMethod: formData.paymentMethod,
                reason: formData.reason, // Agregar aquí también
                declaration: formData.declaration,
            }, {
                onSuccess: () => {
                    toast.success('Solicitud enviada correctamente. Nos pondremos en contacto pronto.');
                    setFormData({
                        email: '',
                        subject: '',
                        name: '',
                        dni: '',
                        orderNumber: '',
                        event: '',
                        ticketQuantity: '',
                        paymentMethod: '',
                        declaration: 'Solicito la revocación de la compra en los términos del artículo 34 de la Ley 24.240 de Defensa del Consumidor.',
                        reason: '',
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
                        {/* Información Legal Completa */}
                        <Card className="bg-blue-50 border-blue-200 shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center gap-2">
                                    <Info className="w-5 h-5" />
                                    Información Legal - Ley 24.240
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80 text-sm leading-relaxed">
                                <p>
                                    De conformidad con lo establecido en el <strong>artículo 34 de la Ley N° 24.240 de Defensa del Consumidor</strong>, 
                                    el consumidor tiene derecho a revocar la aceptación del producto o servicio contratado dentro del plazo de{' '}
                                    <strong>diez (10) días corridos</strong>, contados a partir de la fecha en que se realizó la compra, 
                                    sin responsabilidad alguna.
                                </p>

                                <Alert className="bg-amber-50 border-amber-300">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <AlertDescription className="text-amber-800">
                                        <strong>Importante para eventos:</strong> La solicitud de cancelación deberá realizarse{' '}
                                        <strong>dentro de los diez (10) días corridos desde la compra y hasta setenta y dos (72) horas 
                                        antes del horario de inicio del evento</strong>.
                                    </AlertDescription>
                                </Alert>

                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 className="font-semibold text-foreground mb-2">Requisitos para ejercer el derecho:</h4>
                                    <ul className="list-disc list-inside space-y-2 ml-2">
                                        <li>El correo debe ser enviado <strong>únicamente por el titular de la tarjeta utilizada para la compra</strong></li>
                                        <li>Debe enviarse <strong>desde el mismo correo electrónico con el que se efectuó la operación</strong></li>
                                        <li>El asunto debe incluir: <strong>"Botón de Arrepentimiento – Orden N° XXXXX"</strong></li>
                                        <li>Debe completar todos los datos requeridos en el formulario</li>
                                    </ul>
                                </div>

                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 className="font-semibold text-foreground mb-2">Sobre el reintegro:</h4>
                                    <ul className="list-disc list-inside space-y-2 ml-2">
                                        <li>El reintegro se realizará <strong>a la misma tarjeta utilizada para el pago</strong></li>
                                        <li>El plazo de acreditación depende de la entidad emisora de la tarjeta</li>
                                        <li><strong>Se reintegrará exclusivamente el valor de las entradas adquiridas</strong></li>
                                        <li className="text-red-700 font-medium">
                                            La tarifa correspondiente al servicio de la ticketera NO es reembolsable, 
                                            por tratarse de un cargo por gestión y administración
                                        </li>
                                    </ul>
                                </div>

                                <p className="text-xs text-foreground/60 italic">
                                    El número de orden se encuentra detallado en el correo electrónico de confirmación de compra.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Formulario */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">
                                    Formulario de Arrepentimiento
                                </CardTitle>
                                <p className="text-sm text-foreground/60">
                                    Complete todos los campos obligatorios. Recuerde que debe usar el mismo email con el que realizó la compra.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-foreground">
                                            Correo Electrónico de la Compra <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="email@utilizado-en-compra.com"
                                            className="bg-white border-gray-200"
                                            required
                                        />
                                        <p className="text-xs text-foreground/60">
                                            Debe ser el mismo email con el que realizó la compra
                                        </p>
                                    </div>

                                    {/* Nombre y Apellido */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-foreground">
                                            Nombre y Apellido del Titular <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Nombre completo del titular de la tarjeta"
                                            className="bg-white border-gray-200"
                                            required
                                        />
                                    </div>

                                    {/* DNI */}
                                    <div className="space-y-2">
                                        <Label htmlFor="dni" className="text-foreground">
                                            DNI del Titular (sin puntos) <span className="text-red-500">*</span>
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

                                    {/* Número de Orden */}
                                    <div className="space-y-2">
                                        <Label htmlFor="orderNumber" className="text-foreground">
                                            Número de Orden <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="orderNumber"
                                            name="orderNumber"
                                            type="text"
                                            value={formData.orderNumber}
                                            onChange={handleChange}
                                            placeholder="ORD-123456"
                                            className="bg-white border-gray-200"
                                            required
                                        />
                                        <p className="text-xs text-foreground/60">
                                            Lo encontrarás en el email de confirmación de compra o en{' '}
                                            <Link 
                                                href={route('my-tickets')} 
                                                className="text-primary hover:underline"
                                            >
                                                Mis Entradas
                                            </Link>
                                        </p>
                                    </div>

                                    {/* Evento */}
                                    <div className="space-y-2">
                                        <Label htmlFor="event" className="text-foreground">
                                            Evento <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="event"
                                            name="event"
                                            type="text"
                                            value={formData.event}
                                            onChange={handleChange}
                                            placeholder="Nombre del evento para el cual adquirió las entradas"
                                            className="bg-white border-gray-200"
                                            required
                                        />
                                    </div>

                                    {/* Cantidad de Entradas */}
                                    <div className="space-y-2">
                                        <Label htmlFor="ticketQuantity" className="text-foreground">
                                            Cantidad de Entradas <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="ticketQuantity"
                                            name="ticketQuantity"
                                            type="number"
                                            min="1"
                                            value={formData.ticketQuantity}
                                            onChange={handleChange}
                                            placeholder="Ej: 2"
                                            className="bg-white border-gray-200"
                                            required
                                        />
                                    </div>

                                    {/* Medio de Pago */}
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentMethod" className="text-foreground">
                                            Medio de Pago Utilizado <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="paymentMethod"
                                            name="paymentMethod"
                                            type="text"
                                            value={formData.paymentMethod}
                                            onChange={handleChange}
                                            placeholder="Ej: Visa terminada en 1234"
                                            className="bg-white border-gray-200"
                                            required
                                        />
                                    </div>

                                    {/* Motivo de la Devolución */}
                                    <div className="space-y-2">
                                        <Label htmlFor="reason" className="text-foreground">
                                            Motivo de la Devolución (Opcional)
                                        </Label>
                                        <Textarea
                                            id="reason"
                                            name="reason"
                                            value={formData.reason || ''}
                                            onChange={handleChange}
                                            placeholder="Si desea, puede agregar información adicional sobre el motivo de su devolución..."
                                            className="bg-white border-gray-200 min-h-[80px] resize-none"
                                        />
                                        <p className="text-xs text-foreground/60">
                                            Este campo es opcional pero puede ayudarnos a mejorar nuestro servicio
                                        </p>
                                    </div>

                                    {/* Manifestación Expresa */}
                                    <div className="space-y-2">
                                        <Label htmlFor="declaration" className="text-foreground">
                                            Manifestación Expresa <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="declaration"
                                            name="declaration"
                                            value={formData.declaration}
                                            onChange={handleChange}
                                            className="bg-white border-gray-200 min-h-[100px] resize-none"
                                            required
                                            readOnly
                                        />
                                        <p className="text-xs text-foreground/60">
                                            Esta declaración es requerida por ley y no puede ser modificada
                                        </p>
                                    </div>


                                    {/* Botón Submit */}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-primary hover:bg-primary-hover text-white"
                                    >
                                        {isSubmitting ? 'Enviando...' : 'Enviar Solicitud de Arrepentimiento'}
                                    </Button>

                                    <p className="text-xs text-center text-foreground/60">
                                        Al enviar este formulario, confirmo que he leído y comprendido los términos 
                                        del artículo 34 de la Ley 24.240 y que cumplo con todos los requisitos para 
                                        ejercer el derecho de arrepentimiento.
                                    </p>
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