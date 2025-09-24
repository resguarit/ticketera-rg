import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Shield, Calendar, Lock, Eye, Database, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function Privacy() {
    const lastUpdated = "17 de Septiembre de 2025";

    return (
        <>
            <Head title="Política de Privacidad - Ticketera RG ENTRADAS" />
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
                            <h1 className="text-3xl sm:text-4xl  font-bold text-foreground mb-4">
                                Política de Privacidad
                            </h1>
                            <p className="text-foreground/60 text-sm flex items-center justify-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Última actualización: {lastUpdated}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Introducción */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary flex items-center">
                                    1. Introducción
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="prose prose-gray max-w-none">
                                <p className="text-foreground/80 leading-relaxed">
                                    En Ticketera RG ENTRADAS valoramos y respetamos su privacidad. Esta Política de Privacidad explica cómo recopilamos, utilizamos, almacenamos y protegemos sus datos personales de acuerdo con la Ley Nº 25.326 de Protección de Datos Personales de la República Argentina y la normativa complementaria de la Agencia de Acceso a la Información Pública (AAIP).
                                </p>
                                <p className="text-foreground/80 leading-relaxed mt-4">
                                    Al utilizar nuestra plataforma, usted presta su consentimiento libre, expreso e informado para el tratamiento de sus datos personales conforme a esta Política. Si no está de acuerdo, le solicitamos abstenerse de utilizar nuestros servicios.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Datos que recopilamos */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary flex items-center">
                                    2. Datos que recopilamos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">2.1 Datos Personales:</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Nombre y apellido</li>
                                        <li>Documento de identidad (DNI/Pasaporte)</li>
                                        <li>Dirección de correo electrónico</li>
                                        <li>Número de teléfono</li>
                                        <li>Dirección postal</li>
                                        <li>Información de pago (procesada de forma segura por terceros)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">2.2 Datos de Uso:</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Dirección IP, datos de ubicación aproximada</li>
                                        <li>Información del navegador y dispositivo</li>
                                        <li>Páginas visitadas y tiempo de navegación</li>
                                        <li>Preferencias y patrones de uso</li>
                                        <li>Cookies y tecnologías similares</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">2.3 Datos de Eventos:</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Historial de compras de entradas</li>
                                        <li>Preferencias de eventos</li>
                                        <li>Opiniones, valoraciones o comentarios</li>
                                        <li>Información de asistencia a eventos</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Finalidades del Tratamiento */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">3. Finalidades del Tratamiento</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <p>Usamos sus datos para:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Procesar y confirmar compras de entradas</li>
                                    <li>Emitir tickets digitales y confirmar reservas</li>
                                    <li>Gestionar su cuenta de usuario y brindar soporte</li>
                                    <li>Notificarle sobre cambios o cancelaciones en eventos</li>
                                    <li>Enviar comunicaciones de servicio y, con su consentimiento, promociones</li>
                                    <li>Analizar el uso de la plataforma y mejorar la experiencia</li>
                                    <li>Cumplir con obligaciones legales y regulatorias</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Cesión y Transferencia de Datos */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">4. Cesión y Transferencia de Datos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <p><strong>Organizadores de eventos:</strong> compartimos únicamente la información necesaria para gestionar su entrada y comunicar cuestiones relacionadas con el evento.</p>
                                </div>
                                <div>
                                    <p><strong>Proveedores de servicios:</strong> contratamos terceros (procesadores de pago, servicios de hosting, email marketing, etc.) que acceden a datos bajo estrictos compromisos de confidencialidad y seguridad.</p>
                                </div>
                                <div>
                                    <p><strong>Requerimientos legales:</strong> podremos divulgar información ante órdenes judiciales o autoridades competentes.</p>
                                </div>
                                <div>
                                    <p><strong>Transferencias internacionales:</strong> si sus datos se almacenan en servidores fuera de Argentina, aseguramos que el país de destino cuente con un nivel adecuado de protección de datos conforme la normativa argentina.</p>
                                </div>
                                <div>
                                    <p><strong>Nunca comercializamos sus datos:</strong> no vendemos ni alquilamos información personal a terceros con fines de marketing.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Seguridad y Conservación de Datos */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary flex items-center">
                                    5. Seguridad y Conservación de Datos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Empleamos cifrado SSL y servidores seguros con acceso restringido.</li>
                                    <li>No almacenamos información completa de tarjetas de crédito.</li>
                                    <li>Conservamos los datos solo mientras dure la relación contractual y mientras exista obligación legal, fiscal o contable de mantenerlos.</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Derechos de los Titulares de los Datos */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">6. Derechos de los Titulares de los Datos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <p>
                                    Usted podrá ejercer gratuitamente los derechos de acceso, rectificación, actualización, supresión y oposición, enviando un correo a ***************o por escrito al domicilio de Ticketera RG ENTRADAS.
                                </p>
                                <p>
                                    El titular de los datos tiene derecho a solicitar y obtener información sobre sus datos personales registrados, y podrá solicitar la rectificación, actualización o supresión de los mismos, conforme al art. 6 de la Ley 25.326.
                                </p>
                                <p>
                                    La Agencia de Acceso a la Información Pública (AAIP), en su carácter de autoridad de control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan respecto al incumplimiento de las normas sobre protección de datos personales.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Menores de Edad */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">7. Menores de Edad</CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p>
                                    Nuestros servicios están dirigidos a mayores de 18 años. No recopilamos de manera intencional datos de menores de edad.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Modificaciones */}
                        <Card className="bg-green-50 border-green-200 shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center">
                                    8. Modificaciones
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p className="mb-4">
                                    Podremos actualizar esta Política para reflejar cambios legales, técnicos o comerciales. La versión vigente siempre estará disponible en nuestro sitio web con la fecha de la última actualización. En caso de cambios sustanciales, se le notificará por medios razonables (correo electrónico o aviso en la plataforma).
                                </p>
                                <div className="mt-4 pt-4 border-t border-green-200">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Link href={route('help')}>
                                            <Button className="bg-primary hover:bg-primary-hover text-white">
                                                Centro de Ayuda
                                            </Button>
                                        </Link>
                                        <Link href={route('terms')}>
                                            <Button variant="outline" className="border-gray-300 text-foreground hover:bg-gray-50">
                                                Ver Términos y Condiciones
                                            </Button>
                                        </Link>
                                    </div>
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