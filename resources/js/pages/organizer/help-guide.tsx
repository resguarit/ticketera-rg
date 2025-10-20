import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { 
    Calendar, 
    Users, 
    Ticket, 
    Settings, 
    UserPlus, 
    Mail, 
    BarChart3,
    CheckCircle,
    Clock,
    MapPin,
    CreditCard,
    FileText,
    AlertCircle
} from 'lucide-react';

const GuideSection = ({ icon: Icon, title, children, badge }: { 
    icon: any, 
    title: string, 
    children: React.ReactNode,
    badge?: string 
}) => (
    <Card className="mb-6">
        <CardHeader>
            <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{title}</CardTitle>
                {badge && <Badge variant="secondary">{badge}</Badge>}
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            {children}
        </CardContent>
    </Card>
);

const StepList = ({ steps }: { steps: string[] }) => (
    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
        {steps.map((step, index) => (
            <li key={index}>{step}</li>
        ))}
    </ol>
);

export default function HelpGuide() {
    return (
        <AppLayout>
            <Head title="Guía de Ayuda - Organizador" />
            
            <div className="max-w-4xl mx-auto space-y-6 p-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Guía para Organizadores
                    </h1>
                    <p className="text-lg text-gray-600">
                        Todo lo que necesitas saber para gestionar tus eventos exitosamente
                    </p>
                </div>

                <GuideSection icon={Calendar} title="Gestión de Eventos" badge="Básico">
                    <div>
                        <h4 className="font-semibold mb-2">Crear un Evento</h4>
                        <StepList steps={[
                            "Ve a 'Eventos' en el menú lateral",
                            "Haz clic en 'Crear Evento'",
                            "Completa la información básica (nombre, descripción, fechas)",
                            "Selecciona la categoría y recinto",
                            "Configura la visibilidad y estado del evento",
                            "Guarda el evento"
                        ]} />
                    </div>
                    <Separator />
                    <div>
                        <h4 className="font-semibold mb-2">Gestionar Funciones</h4>
                        <StepList steps={[
                            "Accede a tu evento y ve a la pestaña 'Funciones'",
                            "Crea funciones para diferentes fechas/horarios",
                            "Define la capacidad máxima por función",
                            "Configura sectores si tu recinto los tiene"
                        ]} />
                    </div>
                </GuideSection>

                <GuideSection icon={Ticket} title="Tipos de Entradas" badge="Intermedio">
                    <div>
                        <h4 className="font-semibold mb-2">Configurar Tipos de Entradas</h4>
                        <StepList steps={[
                            "Dentro de una función, ve a 'Tipos de Entrada'",
                            "Crea diferentes tipos (General, VIP, Estudiante, etc.)",
                            "Define precios y cantidades disponibles",
                            "Configura fechas de venta (inicio y fin)",
                            "Activa/desactiva la visibilidad según necesites"
                        ]} />
                    </div>
                    <Separator />
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h5 className="font-semibold text-blue-900">Consejo</h5>
                                <p className="text-blue-800 text-sm">
                                    Puedes duplicar tipos de entrada a todas las funciones para ahorrar tiempo.
                                </p>
                            </div>
                        </div>
                    </div>
                </GuideSection>

                <GuideSection icon={Users} title="Gestión de Asistentes" badge="Avanzado">
                    <div>
                        <h4 className="font-semibold mb-2">Invitar Asistentes</h4>
                        <StepList steps={[
                            "Ve a la pestaña 'Asistentes' de tu evento",
                            "Haz clic en 'Invitar asistente'",
                            "Selecciona la función y tipos de entrada",
                            "Ingresa los datos del asistente",
                            "El sistema enviará automáticamente la invitación por email"
                        ]} />
                    </div>
                    <Separator />
                    <div>
                        <h4 className="font-semibold mb-2">Gestionar Compradores</h4>
                        <p className="text-sm text-gray-700 mb-2">
                            Los compradores aparecen automáticamente cuando adquieren entradas. Puedes:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                            <li>Ver sus tickets y detalles de compra</li>
                            <li>Reenviar emails con sus entradas</li>
                            <li>Monitorear el estado de uso de sus tickets</li>
                        </ul>
                    </div>
                </GuideSection>

                <GuideSection icon={UserPlus} title="Usuarios de tu Organización">
                    <div>
                        <h4 className="font-semibold mb-2">Agregar Colaboradores</h4>
                        <StepList steps={[
                            "Ve a 'Usuarios' en el menú lateral",
                            "Haz clic en 'Crear Usuario'",
                            "Completa los datos del colaborador",
                            "Define una contraseña temporal",
                            "El usuario recibirá acceso a tu organización"
                        ]} />
                    </div>
                    <Separator />
                    <div className="bg-amber-50 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                                <h5 className="font-semibold text-amber-900">Importante</h5>
                                <p className="text-amber-800 text-sm">
                                    Los usuarios que crees tendrán acceso a todos los eventos de tu organización.
                                </p>
                            </div>
                        </div>
                    </div>
                </GuideSection>

                <GuideSection icon={BarChart3} title="Monitoreo y Reportes">
                    <div>
                        <h4 className="font-semibold mb-2">Dashboard de Evento</h4>
                        <p className="text-sm text-gray-700 mb-2">
                            Desde el dashboard de cada evento puedes ver:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                            <li>Estadísticas de ventas en tiempo real</li>
                            <li>Cantidad de asistentes por función</li>
                            <li>Ingresos generados</li>
                            <li>Estado de las entradas (vendidas, usadas, disponibles)</li>
                        </ul>
                    </div>
                </GuideSection>

                <GuideSection icon={Mail} title="Comunicación con Asistentes">
                    <div>
                        <h4 className="font-semibold mb-2">Reenvío de Invitaciones</h4>
                        <p className="text-sm text-gray-700 mb-2">
                            Puedes reenviar invitaciones y entradas desde la lista de asistentes:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                            <li>Para invitados: reenvía la invitación con los tickets</li>
                            <li>Para compradores: reenvía el email con las entradas compradas</li>
                            <li>Útil cuando los asistentes no recibieron el email original</li>
                        </ul>
                    </div>
                </GuideSection>

                <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <CardTitle className="text-green-900">¿Necesitas más ayuda?</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-green-800 mb-4">
                            Si tienes dudas específicas o necesitas soporte técnico, no dudes en contactarnos.
                        </p>
                        <div className="space-y-2 text-sm">
                            <p><strong>Email de soporte:</strong> soporte@tuticketera.com</p>
                            <p><strong>Teléfono:</strong> +1234567890</p>
                            <p><strong>Horarios:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
