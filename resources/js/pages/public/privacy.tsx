import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Shield, Calendar, Lock, Eye, Database, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function Privacy() {
    const lastUpdated = "15 de Noviembre de 2024";

    return (
        <>
            <Head title="Política de Privacidad - Ticketera RG" />
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
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                                Política de Privacidad
                            </h1>
                            <p className="text-foreground/80 text-lg mb-2">
                                Cómo protegemos y utilizamos su información personal
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
                                    <Eye className="w-5 h-5 mr-2 text-green-500" />
                                    1. Introducción
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="prose prose-gray max-w-none">
                                <p className="text-foreground/80 leading-relaxed">
                                    En Ticketera RG, valoramos y respetamos su privacidad. Esta Política de Privacidad describe 
                                    cómo recopilamos, utilizamos, almacenamos y protegemos su información personal cuando utiliza 
                                    nuestros servicios.
                                </p>
                                <p className="text-foreground/80 leading-relaxed mt-4">
                                    Al utilizar nuestra plataforma, usted consiente las prácticas descritas en esta política. 
                                    Si no está de acuerdo con alguna parte de esta política, no debe utilizar nuestros servicios.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Información que Recopilamos */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center">
                                    <Database className="w-5 h-5 mr-2 text-blue-500" />
                                    2. Información que Recopilamos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">2.1 Información Personal</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Nombre completo y apellido</li>
                                        <li>Dirección de correo electrónico</li>
                                        <li>Número de teléfono</li>
                                        <li>Documento de identidad (DNI/Pasaporte)</li>
                                        <li>Dirección postal</li>
                                        <li>Información de pago (procesada de forma segura)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">2.2 Información de Uso</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Direcciones IP y datos de ubicación</li>
                                        <li>Información del navegador y dispositivo</li>
                                        <li>Páginas visitadas y tiempo de navegación</li>
                                        <li>Patrones de uso y preferencias</li>
                                        <li>Cookies y tecnologías similares</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">2.3 Información de Eventos</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Historial de compras de entradas</li>
                                        <li>Preferencias de eventos</li>
                                        <li>Evaluaciones y comentarios</li>
                                        <li>Información de asistencia a eventos</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cómo Utilizamos la Información */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">3. Cómo Utilizamos su Información</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">3.1 Prestación de Servicios</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Procesar y confirmar compras de entradas</li>
                                        <li>Enviar entradas digitales y confirmaciones</li>
                                        <li>Proporcionar soporte al cliente</li>
                                        <li>Gestionar su cuenta de usuario</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">3.2 Comunicación</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Enviar confirmaciones de compra</li>
                                        <li>Notificar cambios en eventos</li>
                                        <li>Responder consultas y solicitudes</li>
                                        <li>Enviar actualizaciones del servicio (con su consentimiento)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">3.3 Mejora del Servicio</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Analizar patrones de uso para mejorar la plataforma</li>
                                        <li>Personalizar recomendaciones de eventos</li>
                                        <li>Desarrollar nuevas funcionalidades</li>
                                        <li>Realizar estudios de mercado</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Compartir Información */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">4. Compartir su Información</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">4.1 Con Organizadores de Eventos</h4>
                                    <p>Compartimos información limitada (nombre, email) con organizadores para facilitar 
                                    la comunicación sobre eventos específicos que ha comprado.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">4.2 Proveedores de Servicios</h4>
                                    <p>Trabajamos con terceros de confianza para procesamiento de pagos, envío de emails 
                                    y análisis. Estos proveedores están obligados contractualmente a proteger su información.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">4.3 Requisitos Legales</h4>
                                    <p>Podemos divulgar información cuando sea requerido por ley, orden judicial, 
                                    o para proteger nuestros derechos y los de nuestros usuarios.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">4.4 No Vendemos sus Datos</h4>
                                    <p className="font-semibold text-green-600">Nunca vendemos, alquilamos o comercializamos 
                                    su información personal a terceros para fines de marketing.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Seguridad */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center">
                                    <Lock className="w-5 h-5 mr-2 text-yellow-500" />
                                    5. Seguridad de la Información
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">5.1 Medidas de Protección</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Encriptación SSL/TLS para todas las transmisiones</li>
                                        <li>Servidores seguros con acceso restringido</li>
                                        <li>Monitoreo continuo de seguridad</li>
                                        <li>Actualizaciones regulares de seguridad</li>
                                        <li>Verificación en dos pasos disponible</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">5.2 Procesamiento de Pagos</h4>
                                    <p>Utilizamos procesadores de pago certificados PCI DSS. No almacenamos información 
                                    completa de tarjetas de crédito en nuestros servidores.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">5.3 Retención de Datos</h4>
                                    <p>Conservamos su información personal mientras mantenga una cuenta activa y durante 
                                    el tiempo necesario para cumplir con obligaciones legales y fiscales.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Derechos del Usuario */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">6. Sus Derechos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">6.1 Acceso y Rectificación</h4>
                                    <p>Puede acceder, actualizar o corregir su información personal desde su cuenta 
                                    o contactando nuestro soporte.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">6.2 Eliminación</h4>
                                    <p>Puede solicitar la eliminación de su cuenta y datos personales, sujeto a 
                                    obligaciones legales de retención.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">6.3 Portabilidad</h4>
                                    <p>Puede solicitar una copia de sus datos personales en formato estructurado y 
                                    legible por máquina.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">6.4 Oposición al Marketing</h4>
                                    <p>Puede optar por no recibir comunicaciones promocionales en cualquier momento 
                                    utilizando el enlace de cancelación en nuestros emails.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cookies */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">7. Cookies y Tecnologías Similares</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">7.1 Tipos de Cookies</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li><strong>Esenciales:</strong> Necesarias para el funcionamiento del sitio</li>
                                        <li><strong>Funcionales:</strong> Mejoran la experiencia del usuario</li>
                                        <li><strong>Analíticas:</strong> Nos ayudan a entender cómo usa el sitio</li>
                                        <li><strong>Marketing:</strong> Para personalizar anuncios (requiere consentimiento)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">7.2 Gestión de Cookies</h4>
                                    <p>Puede gestionar sus preferencias de cookies a través de la configuración de su navegador 
                                    o nuestro panel de preferencias de cookies.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Menores de Edad */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">8. Menores de Edad</CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p>Nuestros servicios están dirigidos a personas mayores de 16 años. No recopilamos 
                                intencionalmente información personal de menores de 16 años sin el consentimiento parental. 
                                Si tiene conocimiento de que un menor ha proporcionado información personal, 
                                contáctenos inmediatamente.</p>
                            </CardContent>
                        </Card>

                        {/* Cambios en la Política */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">9. Cambios en esta Política</CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p>Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre 
                                cambios significativos por email o mediante un aviso prominente en nuestro sitio web. 
                                La fecha de "última actualización" indica cuándo se realizaron los cambios más recientes.</p>
                            </CardContent>
                        </Card>

                        {/* Contacto */}
                        <Card className="bg-green-50 border-green-200 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2 text-green-500" />
                                    10. Contacto sobre Privacidad
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p className="mb-4">Para consultas sobre esta política de privacidad o para ejercer sus derechos:</p>
                                <div className="space-y-2">
                                    <p><strong>Email de Privacidad:</strong> privacy@ticketera-rg.com</p>
                                    <p><strong>Teléfono:</strong> +54 2966 123456</p>
                                    <p><strong>Dirección:</strong> La Plata, Buenos Aires, Argentina</p>
                                </div>
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