import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, Calendar, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { PageProps } from '@/types';

interface TermsPageProps extends PageProps {
    supportEmail: string;
    supportPhone: string;
}

export default function Terms() {
    const { supportEmail, supportPhone } = usePage<TermsPageProps>().props;
    const lastUpdated = "17 de Septiembre de 2025";

    return (
        <>
            <Head title="Términos y Condiciones" />
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
                                Términos y Condiciones 
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
                                    Bienvenido a Ticketera RG ENTRADAS, una plataforma de venta de entradas para eventos operada por ResguarIT Consultoría en Informática y Tecnología S.R.l.
                                </p>
                                <p className="text-foreground/80 leading-relaxed mt-4">
                                    Al acceder y utilizar nuestro sitio web y servicios, usted acepta cumplir con estos Términos y Condiciones. Si no está de acuerdo con alguna parte de los mismos, no debe utilizar nuestros servicios.
                                </p>
                                <p className="text-foreground/80 leading-relaxed mt-4">
                                    Estos términos se aplican a todos los usuarios de la Plataforma, incluyendo compradores, organizadores de eventos y visitantes.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Definiciones */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">2. Definiciones</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 text-foreground/80">
                                    <div>
                                        <strong>Plataforma:</strong> Ticketera RG ENTRADAS y todos sus servicios relacionados.
                                    </div>
                                    <div>
                                        <strong>Usuario:</strong> Toda persona que acceda o utilice la Plataforma.
                                    </div>
                                    <div>
                                        <strong>Organizador:</strong> Persona o entidad que organiza eventos y vende entradas a través de la Plataforma.
                                    </div>
                                    <div>
                                        <strong>Comprador:</strong> Usuario que adquiere entradas para eventos a través de la Plataforma.
                                    </div>
                                    <div>
                                        <strong>Evento:</strong> Toda actividad, espectáculo o función para la cual se venden entradas.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Uso de la Plataforma */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">3. Uso de la Plataforma</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">3.1 Registro de Cuenta</h4>
                                    <p>Para realizar compras, el Usuario debe crear una cuenta proporcionando información veraz y actualizada. Es responsable de mantener la confidencialidad de sus credenciales.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">3.2 Uso Permitido</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Comprar entradas para uso personal o como regalo.</li>
                                        <li>Acceder a información sobre eventos.</li>
                                        <li>Contactar al soporte técnico cuando sea necesario.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">3.3 Uso Prohibido</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Revender entradas sin autorización expresa.</li>
                                        <li>Usar bots o software automatizado para comprar entradas.</li>
                                        <li>Proporcionar información falsa o fraudulenta.</li>
                                        <li>Interferir con el funcionamiento de la Plataforma.</li>
                                        <li>Violar derechos de propiedad intelectual.</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Compra de Entradas */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">4. Compra de Entradas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">4.1 Proceso de Compra</h4>
                                    <p>Las compras se consideran finales una vez confirmado el pago. El Comprador recibirá las entradas digitales por correo electrónico y/o podrá descargarlas desde su cuenta.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">4.2 Precios y Pagos</h4>
                                    <p>Los precios incluyen impuestos aplicables. Se aceptan tarjetas de crédito, débito y otros medios de pago disponibles en la Plataforma.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">4.3 Límites de Compra</h4>
                                    <p>Ticketera RG ENTRADAS podrá limitar la cantidad de entradas por persona/evento para garantizar la disponibilidad equitativa.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cancelaciones, Reembolsos y Arrepentimiento */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">5. Cancelaciones, Reembolsos y Arrepentimiento</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">5.1 Cancelación por el Organizador</h4>
                                    <p>Si un evento es cancelado por el organizador, el Comprador podrá optar entre reembolso total del valor de la entrada. El cargo por servicio no será reembolsable.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">5.2 Modificación del Evento</h4>
                                    <p>En caso de reprogramación o cambio de lugar del evento, las entradas seguirán siendo válidas. Si el Comprador no pudiera asistir, podrá solicitar reembolso conforme a la política del Organizador. El cargo por servicio no será reembolsable.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">5.3 Cancelación por el Comprador</h4>
                                    <p>Las cancelaciones solicitadas por el Comprador estarán sujetas a la política del Organizador. El cargo por servicio no será reembolsable.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">5.4 Derecho de Arrepentimiento</h4>
                                    <p>En cumplimiento de la Ley de Defensa del Consumidor (Ley 24.240), el Comprador podrá ejercer el derecho de arrepentimiento dentro de los 10 días corridos posteriores a la compra, salvo que el evento se realice dentro de dicho período.</p>
                                    <p>La Plataforma cuenta con el "Botón de Arrepentimiento", disponible para ejercer este derecho de manera rápida y gratuita.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Responsabilidades */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">6. Responsabilidades</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">6.1 De Ticketera RG ENTRADAS</h4>
                                    <p>La Plataforma actúa como intermediario entre Organizadores y Compradores. No es responsable por la organización, calidad, seguridad o desarrollo del evento, cuya responsabilidad recae exclusivamente en el Organizador.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">6.2 Del Organizador</h4>
                                    <p>El Organizador es responsable de:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Garantizar que el evento cumpla con normas de seguridad, higiene y habilitaciones legales.</li>
                                        <li>Respetar el aforo y condiciones de acceso.</li>
                                        <li>Cumplir con devoluciones y reembolsos en caso de suspensión o modificación.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">6.3 Limitación de Responsabilidad</h4>
                                    <p>La responsabilidad de Ticketera RG ENTRADAS se limita al valor de las entradas adquiridas a través de la Plataforma. No será responsable por daños indirectos, incidentales o consecuenciales.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Entradas Digitales */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">7. Entradas Digitales</CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Las entradas son emitidas en formato digital y contienen un código único.</li>
                                    <li>El Comprador es responsable de custodiar su entrada. La duplicación, falsificación o cesión indebida será exclusiva responsabilidad del Usuario.</li>
                                    <li>Ticketera RG ENTRADAS no será responsable por el uso indebido de entradas compartidas por el propio Comprador.</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Propiedad Intelectual */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">8. Propiedad Intelectual</CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p>El contenido de la Plataforma, incluyendo textos, gráficos, logos, imágenes y software, está protegido por derechos de autor y propiedad intelectual. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.</p>
                            </CardContent>
                        </Card>

                        {/* Contacto y Atención al Usuario */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">9. Contacto y Atención al Usuario</CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p className="mb-2">El Usuario podrá realizar consultas, reclamos o solicitudes de reembolso a través de los siguientes medios de contacto:</p>
                                <div className="space-y-2">
                                    <p><strong>Email:</strong> {supportEmail}</p>
                                    <p><strong>Teléfono:</strong> {supportPhone}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="mb-0"><strong>Formulario de contacto en la Plataforma:</strong></p> 
                                        <Link href={route('help')}>
                                            <Button 
                                                size="sm"
                                                className="bg-primary hover:bg-primary-hover text-white"
                                            >
                                                Contactar
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Modificaciones de los Términos */}
                        <Card className="bg-white shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-primary">10. Modificaciones de los Términos</CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p>Ticketera RG ENTRADAS podrá modificar estos Términos en cualquier momento. Las modificaciones entrarán en vigencia al ser publicadas en la Plataforma. El uso posterior implicará aceptación de los cambios.</p>
                            </CardContent>
                        </Card>

                        {/* Ley Aplicable y Jurisdicción */}
                        <Card className="bg-blue-50 border-blue-200 shadow-lg gap-2">
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center">
                                    11. Ley Aplicable y Jurisdicción
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p className="mb-4">Estos Términos se rigen por las leyes de la República Argentina. Cualquier controversia será resuelta por los tribunales competentes de la ciudad de La Plata, Provincia de Buenos Aires.</p>
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