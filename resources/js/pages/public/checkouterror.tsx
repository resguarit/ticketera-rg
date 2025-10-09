import { X, AlertTriangle, RefreshCw, ArrowLeft, Home, CreditCard, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/header';
import { Head, Link, router } from '@inertiajs/react';

interface ErrorData {
    title: string;
    message: string;
    errorCode?: string;
    canRetry: boolean;
    retryUrl?: string;
    eventId?: number;
    eventName?: string;
    timestamp?: string;
}

interface CheckoutErrorProps {
    errorData: ErrorData;
}

export default function CheckoutError({ errorData }: CheckoutErrorProps) {
    const handleRetry = () => {
        if (errorData.retryUrl) {
            router.visit(errorData.retryUrl);
        }
    };

    const getErrorIcon = () => {
        return <X className="w-12 h-12 text-red-500" />;
    };

    const getErrorColor = () => {
        return {
            bg: 'from-red-100 to-red-50',
            border: 'border-red-200',
            text: 'text-red-800'
        };
    };

    const colors = getErrorColor();

    return (
        <>
            <Head title="Error en la Compra" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-background relative overflow-hidden">
                {/* Error particles effect */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-red-400 rounded-full animate-ping"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>

                <Header />

                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-2xl mx-auto">
                        {/* Error Message */}
                        <div className="text-center mb-8">
                            <div className={`w-20 h-20 bg-gradient-to-r ${colors.bg} ${colors.border} border-2 rounded-full flex items-center justify-center mx-auto mb-6`}>
                                {getErrorIcon()}
                            </div>
                            <h1 className={`text-4xl font-bold ${colors.text} mb-4`}>
                                {errorData.title}
                            </h1>
                            <p className="text-foreground/80 text-lg">
                                {errorData.message}
                            </p>
                            {errorData.errorCode && (
                                <p className="text-foreground/60 text-sm mt-2">
                                    Código de error: {errorData.errorCode}
                                </p>
                            )}
                        </div>

                        {/* Error Details Card */}
                        <Card className={`bg-white ${colors.border} shadow-lg mb-6`}>
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center">
                                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                                    Detalles del Error
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {errorData.eventName && (
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">Evento:</h4>
                                        <p className="text-foreground/70">{errorData.eventName}</p>
                                    </div>
                                )}
                                
                                <div>
                                    <h4 className="font-medium text-foreground mb-2">¿Qué pasó?</h4>
                                    <p className="text-foreground/70">
                                        Tu pago no pudo ser procesado correctamente. Esto puede deberse a varios factores como problemas con el método de pago, información incorrecta, o fallas temporales del sistema.
                                    </p>
                                </div>

                                {errorData.timestamp && (
                                    <div className="text-foreground/60 text-sm pt-2 border-t">
                                        Ocurrido el: {errorData.timestamp}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Action Buttons - Ahora el usuario decide cuándo continuar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {errorData.canRetry && errorData.retryUrl && (
                                <Button 
                                    onClick={handleRetry}
                                    className="bg-primary hover:bg-primary-hover text-white"
                                    size="lg"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reintentar Compra
                                </Button>
                            )}

                            {errorData.eventId ? (
                                <Link href={route('event.detail', errorData.eventId)}>
                                    <Button 
                                        variant="outline" 
                                        className="w-full border-gray-300 text-foreground hover:bg-gray-50"
                                        size="lg"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Volver al Evento
                                    </Button>
                                </Link>
                            ) : (
                                <Link href={route('home')}>
                                    <Button 
                                        variant="outline" 
                                        className="w-full border-gray-300 text-foreground hover:bg-gray-50"
                                        size="lg"
                                    >
                                        <Home className="w-4 h-4 mr-2" />
                                        Ir al Inicio
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Possible Solutions */}
                        <Card className="bg-orange-50 border-orange-200 shadow-lg mb-6">
                            <CardContent className="p-6">
                                <h4 className="text-foreground font-bold mb-4 flex items-center space-x-2">
                                    <HelpCircle className="w-5 h-5 text-orange-500" />
                                    <span>Posibles Soluciones</span>
                                </h4>
                                <ul className="text-foreground/80 space-y-2 text-sm">
                                    <li>• <strong>Verifica tu método de pago:</strong> Asegúrate de que los datos de tu tarjeta sean correctos</li>
                                    <li>• <strong>Saldo suficiente:</strong> Confirma que tienes fondos disponibles en tu cuenta</li>
                                    <li>• <strong>Límites de compra:</strong> Algunos bancos tienen límites para compras online</li>
                                    <li>• <strong>Intentar más tarde:</strong> Si es un problema temporal, intenta nuevamente en unos minutos</li>
                                    <li>• <strong>Contactar al banco:</strong> Tu entidad financiera puede haber bloqueado la transacción</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Alternative Payment Methods */}
                        <Card className="bg-blue-50 border-blue-200 shadow-lg mb-6">
                            <CardContent className="p-6">
                                <h4 className="text-foreground font-bold mb-4 flex items-center space-x-2">
                                    <CreditCard className="w-5 h-5 text-blue-500" />
                                    <span>Métodos de Pago Alternativos</span>
                                </h4>
                                <p className="text-foreground/80 text-sm mb-3">
                                    Si continúas teniendo problemas, puedes intentar con:
                                </p>
                                <ul className="text-foreground/80 space-y-1 text-sm">
                                    <li>• Otra tarjeta de crédito o débito</li>
                                    <li>• MercadoPago o billeteras digitales</li>
                                    <li>• Transferencia bancaria (contacta soporte)</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Support Contact */}
                        <div className="text-center mt-8">
                            <p className="text-foreground/60 mb-4">¿Necesitas ayuda adicional?</p>
                            <div className="flex justify-center space-x-4">
                                <Link href={route('help')}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-300 text-foreground hover:bg-gray-50"
                                    >
                                        Centro de Ayuda
                                    </Button>
                                </Link>
                                <Link href="mailto:soporte@ticketeraRG.com">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-300 text-foreground hover:bg-gray-50"
                                    >
                                        Contactar Soporte
                                    </Button>
                                </Link>
                            </div>
                            <p className="text-foreground/50 text-xs mt-4">
                                Horario de atención: Lunes a Viernes de 9:00 a 18:00 hs
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}