import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { 
    Calendar, 
    Users, 
    Ticket, 
    UserPlus, 
    Mail, 
    BarChart3,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const StepList = ({ steps }: { steps: string[] }) => (
    <ol className="space-y-2">
        {steps.map((step, index) => (
            <li key={index} className="flex gap-3 text-gray-700">
                <span className="font-semibold text-teal-600 flex-shrink-0">{index + 1}.</span>
                <span>{step}</span>
            </li>
        ))}
    </ol>
);

export default function HelpGuide() {
    const [expandedSections, setExpandedSections] = useState<string[]>(["eventos"]);

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId) 
                ? prev.filter((id) => id !== sectionId) 
                : [...prev, sectionId]
        );
    };

    const guideSections = [
        {
            id: "eventos",
            title: "Gestión de Eventos",
            icon: <Calendar className="w-5 h-5" />,
            subsections: [
                {
                    title: "Crear un Evento",
                    steps: [
                        "Ve a 'Eventos' en el menú lateral",
                        "Haz clic en el botón '+ Crear Evento'",
                        "Completa la información básica (Los campos marcados con * son obligatorios)",
                        "Guarda el evento"
                    ]
                },
                {
                    title: "Gestionar Evento Específico",
                    steps: [
                        "Ve a 'Eventos' en el menú lateral",
                        "Selecciona el evento que deseas gestionar tocando el botón 'Gestionar'",
                        "Tendrás acceso a todas las configuraciones del evento como Información, Funciones, Tipos de Entradas, Asistentes, etc."
                    ]
                }
            ]
        },
        {
            id: "funciones",
            title: "Funciones",
            icon: <Clock className="w-5 h-5" />,
            subsections: [
                {
                    title: "Gestionar Funciones",
                    steps: [
                        "Accede a tu evento y ve a la pestaña 'Funciones'",
                        "Crea funciones para diferentes fechas/horarios tocando el botón '+ Crear Función'",
                        "Completa la información básica (Los campos marcados con * son obligatorios)",
                        "Guarda la función con el botón 'Crear Función'"
                    ]
                }
            ]
        },
        {
            id: "entradas",
            title: "Tipos de Entradas",
            icon: <Ticket className="w-5 h-5" />,
            subsections: [
                {
                    title: "Configurar Tipos de Entradas Básicas",
                    steps: [
                        "Accede a tu evento y ve a la pestaña 'Entradas'",
                        "Crea diferentes tipos de entradas (General, VIP, Estudiante, etc.) con el botón '+ Crear Entrada'",
                        "Completa el nombre y selecciona el sector correspondiente",
                        "Define el precio y la cantidad disponible",
                        "Configura fechas de venta (inicio y fin)",
                        "Establece la cantidad máxima por compra",
                        "Guarda la entrada con el botón 'Crear Tipo de Entrada'"
                    ]
                },
                {
                    title: "Lotes de Entradas (Packs)",
                    steps: [
                        "En el formulario de creación, marca la opción 'Este es un lote de entradas'",
                        "Define cuántas entradas incluye cada lote (ej: 4 para pack x4)",
                        "El precio que definas será por todo el lote completo",
                        "El sistema calculará automáticamente el precio por entrada individual",
                    ]
                },
                {
                    title: "Sistema de Tandas (Early Bird)",
                    steps: [
                        "Marca la opción 'Crear entrada por tandas'",
                        "Define el número de tandas (máximo 10)",
                        "Establece el porcentaje de incremento entre tandas",
                        "El sistema creará automáticamente múltiples entradas con precios escalonados",
                        "Solo la primera tanda estará visible; las siguientes se activarán cuando se agote la anterior",
                        "Vista previa te mostrará cómo quedarán los precios de cada tanda"
                    ]
                },
                {
                    title: "Gestión de Capacidad por Sectores",
                    steps: [
                        "Al seleccionar un sector, verás la capacidad total disponible",
                        "El sistema te muestra cuántas entradas ya están asignadas",
                        "Puedes ver las entradas disponibles en tiempo real",
                        "Si intentas superar la capacidad, recibirás una advertencia de sobreventa",
                        "Para lotes: el sistema calcula automáticamente las entradas reales que se generarán"
                    ]
                },
            ]
        },
        {
            id: "asistentes",
            title: "Gestión de Asistentes",
            icon: <Users className="w-5 h-5" />,
            subsections: [
                {
                    title: "Invitar Asistentes",
                    steps: [
                        "Ve a la pestaña 'Asistentes' de tu evento",
                        "Haz clic en 'Invitar asistente'",
                        "Selecciona la función y tipos de entrada",
                        "Ingresa los datos del asistente",
                        "El sistema enviará automáticamente la invitación por email"
                    ]
                },
                {
                    title: "Gestionar Compradores",
                    steps: [
                        "Los compradores aparecen automáticamente cuando adquieren entradas. Puedes:",
                        "Ver sus tickets y detalles de compra",
                        "Reenviar emails con sus entradas",
                        "Monitorear el estado de uso de sus tickets"
                    ]
                }
            ]
        },
        {
            id: "usuarios",
            title: "Usuarios de tu Organización",
            icon: <UserPlus className="w-5 h-5" />,
            subsections: [
                {
                    title: "Agregar Colaboradores",
                    steps: [
                        "Ve a 'Usuarios' en el menú lateral",
                        "Haz clic en 'Crear Usuario'",
                        "Completa los datos del colaborador",
                        "Define una contraseña temporal",
                        "El usuario recibirá acceso a tu organización"
                    ]
                },
                {
                    title: "Importante",
                    steps: [
                        "Los usuarios que crees tendrán acceso a todos los eventos de tu organización."
                    ],
                    isWarning: true
                }
            ]
        },
        {
            id: "reportes",
            title: "Monitoreo y Reportes",
            icon: <BarChart3 className="w-5 h-5" />,
            subsections: [
                {
                    title: "Dashboard de Evento",
                    steps: [
                        "Desde el dashboard de cada evento puedes ver:",
                        "Estadísticas de ventas en tiempo real",
                        "Cantidad de asistentes por función",
                        "Ingresos generados",
                        "Estado de las entradas (vendidas, usadas, disponibles)"
                    ]
                }
            ]
        },
        {
            id: "comunicacion",
            title: "Comunicación con Asistentes",
            icon: <Mail className="w-5 h-5" />,
            subsections: [
                {
                    title: "Reenvío de Invitaciones",
                    steps: [
                        "Puedes reenviar invitaciones y entradas desde la lista de asistentes:",
                        "Para invitados: reenvía la invitación con los tickets",
                        "Para compradores: reenvía el email con las entradas compradas",
                        "Útil cuando los asistentes no recibieron el email original"
                    ]
                }
            ]
        }
    ];

    return (
        <AppLayout>
            <Head title="Guía de Ayuda - Organizador" />
            
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-5xl mx-auto px-6 py-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            Guía para Organizadores
                        </h1>
                        <p className="text-lg text-gray-600">
                            Todo lo que necesitas saber para gestionar tus eventos exitosamente
                        </p>
                    </div>

                    {/* Guide Sections */}
                    <div className="space-y-4">
                        {guideSections.map((section) => {
                            const isExpanded = expandedSections.includes(section.id);

                            return (
                                <div
                                    key={section.id}
                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all"
                                >
                                    {/* Section Header */}
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-gray-700">{section.icon}</div>
                                            <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                        )}
                                    </button>

                                    {/* Section Content */}
                                    {isExpanded && (
                                        <div className="p-6 space-y-6">
                                            {section.subsections.map((subsection, idx) => (
                                                <div key={idx} className="border-l-4 border-teal-500 pl-4">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                                        {subsection.title}
                                                    </h3>
                                                    
                                                    {subsection.isAdvice ? (
                                                        <div className="bg-blue-50 p-4 rounded-lg">
                                                            <div className="flex items-start gap-2">
                                                                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                                                <div>
                                                                    <p className="text-blue-800 text-sm">
                                                                        {subsection.steps[0]}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : subsection.isWarning ? (
                                                        <div className="bg-amber-50 p-4 rounded-lg">
                                                            <div className="flex items-start gap-2">
                                                                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                                                <div>
                                                                    <p className="text-amber-800 text-sm">
                                                                        {subsection.steps[0]}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <StepList steps={subsection.steps} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Help Footer */}
                    <div className="mt-12 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-8 text-center border border-blue-100">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">¿Necesitas más ayuda?</h3>
                        <p className="text-gray-600 mb-4">
                            Si tienes dudas específicas o necesitas soporte técnico, no dudes en contactarnos.
                        </p>
                        <div className="space-y-2 text-sm text-gray-700 mb-6">
                            <p><strong>Email de soporte:</strong> soporte@tuticketera.com</p>
                            <p><strong>Teléfono:</strong> +1234567890</p>
                            <p><strong>Horarios:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</p>
                        </div>
                        <div className="flex gap-4 justify-center">
                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                Contactar Soporte
                            </button>
                            <button className="px-6 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-300">
                                Ver Tutoriales en Video
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
