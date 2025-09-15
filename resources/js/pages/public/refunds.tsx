import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function Refunds() {
    const lastUpdated = "15 de Noviembre de 2024";

    return (
        <>
            <Head title="Política de Reembolsos - Ticketera RG" />
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
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
                                <RotateCcw className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                                Política de Reembolsos
                            </h1>
                            <p className="text-foreground/80 text-lg mb-2">
                                Botón de Arrepentimiento y condiciones de devolución
                            </p>
                            <p className="text-foreground/60 text-sm flex items-center justify-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Última actualización: {lastUpdated}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Derecho de Arrepentimiento */}
                        <Card className="bg-orange-50 border-orange-200 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center">
                                    <RotateCcw className="w-5 h-5 mr-2 text-orange-500" />
                                    Derecho de Arrepentimiento
                                    <Badge className="ml-2 bg-orange-500 text-white">Ley 24.240</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p className="mb-4">
                                    En cumplimiento con el <strong>Artículo 34 de la Ley de Defensa del Consumidor (Ley 24.240)</strong>, 
                                    usted tiene derecho a revocar su compra dentro de los <strong>10 días corridos</strong> posteriores 
                                    a la confirmación de la operación.
                                </p>
                                <div className="bg-white rounded-lg p-4 border border-orange-200">
                                    <h4 className="font-semibold text-orange-700 mb-2">⚠️ Importante:</h4>
                                    <p className="text-sm">
                                        El derecho de arrepentimiento <strong>NO aplica</strong> para eventos que se realicen 
                                        dentro de los 10 días posteriores a la compra, conforme al marco legal vigente.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Casos de Reembolso */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">Casos que Aplican para Reembolso</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Reembolso Completo
                                        </h4>
                                        <ul className="text-sm text-green-700 space-y-1">
                                            <li>• Evento cancelado por el organizador</li>
                                            <li>• Evento pospuesto sin nueva fecha</li>
                                            <li>• Cambio significativo de artista principal</li>
                                            <li>• Error en el procesamiento del pago</li>
                                            <li>• Derecho de arrepentimiento (aplican condiciones)</li>
                                        </ul>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Sin Reembolso
                                        </h4>
                                        <ul className="text-sm text-red-700 space-y-1">
                                            <li>• Cambio de opinión después del período de arrepentimiento</li>
                                            <li>• Imposibilidad personal de asistir</li>
                                            <li>• Condiciones climáticas (eventos al aire libre)</li>
                                            <li>• Cambios menores en la programación</li>
                                            <li>• Pérdida o robo de entradas</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Proceso de Reembolso */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">Proceso de Reembolso</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Paso 1: Solicitud</h4>
                                    <p>Envíe un email a <strong>reembolsos@ticketera-rg.com</strong> con:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                        <li>Número de orden de compra</li>
                                        <li>Nombre del titular de la compra</li>
                                        <li>Motivo del reembolso</li>
                                        <li>Documentación de respaldo (si aplica)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Paso 2: Evaluación</h4>
                                    <p>Nuestro equipo evaluará su solicitud en un plazo máximo de <strong>5 días hábiles</strong> 
                                    y le comunicará la decisión por email.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Paso 3: Procesamiento</h4>
                                    <p>Si la solicitud es aprobada, el reembolso se procesará en:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                        <li>Tarjeta de crédito: 3-5 días hábiles</li>
                                        <li>Tarjeta de débito: 1-3 días hábiles</li>
                                        <li>Transferencia bancaria: 1-2 días hábiles</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Eventos Pospuestos */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">Eventos Pospuestos o Reprogramados</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Nueva Fecha Confirmada</h4>
                                    <p>Si el evento se reprograma con nueva fecha confirmada:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                        <li>Sus entradas seguirán siendo válidas para la nueva fecha</li>
                                        <li>Puede solicitar reembolso si no puede asistir en la nueva fecha</li>
                                        <li>Tendrá 30 días desde el anuncio para decidir</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Sin Nueva Fecha</h4>
                                    <p>Si el evento se pospone indefinidamente:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                        <li>Reembolso automático después de 90 días</li>
                                        <li>Puede solicitar reembolso inmediato</li>
                                        <li>Opción de crédito para futuros eventos</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Créditos y Vouchers */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">Créditos y Vouchers</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Crédito para Futuros Eventos</h4>
                                    <p>En algunos casos, ofrecemos crédito como alternativa al reembolso:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                        <li>Válido por 12 meses desde la emisión</li>
                                        <li>Transferible a otra persona</li>
                                        <li>Aplicable a cualquier evento de la plataforma</li>
                                        <li>No fraccionable (debe usarse completo)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Bonificaciones por Inconvenientes</h4>
                                    <p>Por cancelaciones de último momento, podemos ofrecer:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                        <li>Reembolso completo + 10% adicional en crédito</li>
                                        <li>Acceso prioritario a eventos futuros</li>
                                        <li>Descuentos especiales en próximas compras</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Gastos de Servicio */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">Gastos de Servicio y Comisiones</CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-2">Reembolso por Cancelación del Organizador</h4>
                                        <p>Se reembolsa el <strong>100% del valor pagado</strong>, incluyendo gastos de servicio y comisiones.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-2">Derecho de Arrepentimiento</h4>
                                        <p>Se reembolsa el valor de las entradas. Los gastos de servicio son <strong>no reembolsables</strong> 
                                        según términos y condiciones.</p>
                                    </div>
                                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                        <p className="text-sm text-yellow-700">
                                            <strong>Nota:</strong> Los gastos bancarios o de procesamiento de pago 
                                            pueden ser deducidos del reembolso según las políticas del banco emisor.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Casos Especiales */}
                        <Card className="bg-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground">Casos Especiales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-foreground/80">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Eventos al Aire Libre</h4>
                                    <p>Para eventos al aire libre, el mal clima no constituye motivo de reembolso a menos que:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                        <li>Autoridades competentes prohíban el evento</li>
                                        <li>El organizador cancele por razones de seguridad</li>
                                        <li>Se declare emergencia meteorológica</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Cambios de Artista</h4>
                                    <p>Para eventos con múltiples artistas:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                        <li>Cambio del artista principal: reembolso disponible</li>
                                        <li>Cambio de artista secundario: sin reembolso</li>
                                        <li>Cambio de más del 50% del lineup: reembolso disponible</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contacto */}
                        <Card className="bg-orange-50 border-orange-200 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                                    Contacto para Reembolsos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-foreground/80">
                                <p className="mb-4">Para solicitudes de reembolso o consultas:</p>
                                <div className="space-y-2">
                                    <p><strong>Email de Reembolsos:</strong> reembolsos@ticketera-rg.com</p>
                                    <p><strong>Teléfono:</strong> +54 2966 123456</p>
                                    <p><strong>Horario de Atención:</strong> Lunes a Viernes 9:00 - 18:00</p>
                                    <p><strong>Tiempo de Respuesta:</strong> Máximo 5 días hábiles</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-orange-200">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Link href={route('help')}>
                                            <Button className="bg-primary hover:bg-primary-hover text-white">
                                                Centro de Ayuda
                                            </Button>
                                        </Link>
                                        <Link href={route('terms')}>
                                            <Button variant="outline" className="border-gray-300 text-foreground hover:bg-gray-50">
                                                Términos y Condiciones
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