import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Calendar, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function Terms() {
    const lastUpdated = "15 de Noviembre de 2024";

    return (
        <>
            <Head title="Términos y Condiciones - Ticketera RG" />
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
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                                Términos y Condiciones
                            </h1>
                            <p className="text-foreground/80 text-lg mb-2">
                                Términos de uso de Ticketera RG
                            </p>
                            <p className="text-foreground/60 text-sm flex items-center justify-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Última actualización: {lastUpdated}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Introducción */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center">
                                    <Shield className="w-5 h-5 mr-2 text-primary" />
                                    1. Introducción
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="prose prose-gray max-w-none">
                                <p className="text-foreground/80 leading-relaxed">
                                    Bienvenido a Ticketera RG, una plataforma de venta de entradas para eventos operada por ResguarIT. 
                                    Al acceder y utilizar nuestro sitio web y servicios, usted acepta cumplir con estos Términos y 
                                    Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
                                </p>
                                <p className="text-foreground/80 leading-relaxed mt-4">
                                    Estos términos se aplican a todos los usuarios del sitio web, incluyendo compradores, 
                                    organizadores de eventos y visitantes del sitio.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Definiciones */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">2. Definiciones</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 text-foreground/80">
                                    <div>
                                        <strong>"Plataforma":</strong> Se refiere al sitio web Ticketera RG y todos sus servicios relacionados.
                                    </div>
                                    <div>
                                        <strong>"Usuario":</strong> Cualquier persona que acceda o utilice la Plataforma.
                                    </div>
                                    <div>
                                        <strong>"Organizador":</strong> Persona o entidad que organiza eventos y vende entradas a través de la Plataforma.
                                    </div>
                                    <div>
                                        <strong>"Comprador":</strong> Usuario que adquiere entradas para eventos a través de la Plataforma.
                                    </div>
                                    <div>
                                        <strong>"Evento":</strong> Cualquier actividad, espectáculo o función para la cual se venden entradas.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Uso de la Plataforma */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">3. Uso de la Plataforma</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">3.1 Registro de Cuenta</h4>
                                    <p>Para realizar compras, debe crear una cuenta proporcionando información veraz y actualizada. 
                                    Es responsable de mantener la confidencialidad de sus credenciales de acceso.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">3.2 Uso Permitido</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Comprar entradas para uso personal o como regalo</li>
                                        <li>Acceder a información sobre eventos</li>
                                        <li>Contactar al soporte técnico cuando sea necesario</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">3.3 Uso Prohibido</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Revender entradas sin autorización expresa</li>
                                        <li>Usar bots o software automatizado para comprar entradas</li>
                                        <li>Proporcionar información falsa o fraudulenta</li>
                                        <li>Interferir con el funcionamiento de la Plataforma</li>
                                        <li>Violar derechos de propiedad intelectual</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Compra de Entradas */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">4. Compra de Entradas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">4.1 Proceso de Compra</h4>
                                    <p>Las compras se consideran finales una vez completado el pago. Recibirá una confirmación 
                                    por email con sus entradas digitales.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">4.2 Precios y Pagos</h4>
                                    <p>Los precios incluyen todos los impuestos aplicables. Aceptamos tarjetas de crédito, 
                                    débito y otros métodos de pago disponibles en la Plataforma.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">4.3 Límites de Compra</h4>
                                    <p>Nos reservamos el derecho de limitar la cantidad de entradas por persona/evento para 
                                    garantizar disponibilidad equitativa.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cancelaciones y Reembolsos */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">5. Cancelaciones y Reembolsos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">5.1 Cancelación por el Organizador</h4>
                                    <p>Si un evento es cancelado por el organizador, se ofrecerá reembolso completo o 
                                    crédito para futuros eventos, según la preferencia del comprador.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">5.2 Cancelación por el Comprador</h4>
                                    <p>Las cancelaciones por parte del comprador están sujetas a la política específica 
                                    de cada evento. Consulte los detalles antes de la compra.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">5.3 Derecho de Arrepentimiento</h4>
                                    <p>En cumplimiento con la Ley de Defensa del Consumidor, puede ejercer su derecho de 
                                    arrepentimiento dentro de los 10 días posteriores a la compra, excepto para eventos 
                                    que ocurran dentro de este período.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Responsabilidades */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">6. Responsabilidades y Limitaciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">6.1 Responsabilidad de Ticketera RG</h4>
                                    <p>Actuamos como intermediario entre organizadores y compradores. No somos responsables 
                                    por la calidad, seguridad o legalidad de los eventos anunciados.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">6.2 Limitación de Responsabilidad</h4>
                                    <p>Nuestra responsabilidad se limita al valor de las entradas compradas. No seremos 
                                    responsables por daños indirectos, incidentales o consecuenciales.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Propiedad Intelectual */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">7. Propiedad Intelectual</CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p>Todo el contenido de la Plataforma, incluyendo textos, gráficos, logos, imágenes y software, 
                                está protegido por derechos de autor y otras leyes de propiedad intelectual. No puede reproducir, 
                                distribuir o crear obras derivadas sin autorización escrita.</p>
                            </CardContent>
                        </Card>

                        {/* Modificaciones */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">8. Modificaciones de los Términos</CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                                Las modificaciones entrarán en vigor inmediatamente después de su publicación. 
                                El uso continuado de la Plataforma constituye aceptación de los términos modificados.</p>
                            </CardContent>
                        </Card>

                        {/* Ley Aplicable */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">9. Ley Aplicable y Jurisdicción</CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p>Estos términos se rigen por las leyes de la República Argentina. 
                                Cualquier disputa será resuelta en los tribunales competentes de La Plata, Buenos Aires.</p>
                            </CardContent>
                        </Card>

                        {/* Contacto */}
                        <Card className="bg-blue-50 border-blue-200 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2 text-blue-500" />
                                    10. Contacto
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p className="mb-4">Para consultas sobre estos términos y condiciones, puede contactarnos:</p>
                                <div className="space-y-2">
                                    <p><strong>Email:</strong> legal@ticketera-rg.com</p>
                                    <p><strong>Teléfono:</strong> +54 2966 123456</p>
                                    <p><strong>Dirección:</strong> La Plata, Buenos Aires, Argentina</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-blue-200">
                                    <Link href={route('help')}>
                                        <Button className="bg-primary hover:bg-primary-hover text-white">
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