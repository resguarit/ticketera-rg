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
    const [expandedSection, setExpandedSection] = useState<string | null>("eventos");
    const [expandedSubsection, setExpandedSubsection] = useState<string | null>(null);

    const toggleSection = (sectionId: string) => {
        if (expandedSection === sectionId) {
            // Si es la misma sección, la cerramos
            setExpandedSection(null);
            setExpandedSubsection(null);
        } else {
            // Si es una sección diferente, cerramos todo y abrimos esta
            setExpandedSection(sectionId);
            setExpandedSubsection(null);
        }
    };

    const toggleSubsection = (subsectionId: string) => {
        if (expandedSubsection === subsectionId) {
            // Si es la misma subsección, la cerramos
            setExpandedSubsection(null);
        } else {
            // Si es una subsección diferente, cerramos la anterior y abrimos esta
            setExpandedSubsection(subsectionId);
        }
    };

    const guideSections = [
        {
            id: "eventos",
            title: "Gestión de Eventos",
            icon: <Calendar className="w-5 h-5" />,
            subsections: [
                {
                    id: "eventos-crear",
                    title: "Crear un Evento",
                    steps: [
                        "Ve a 'Eventos' en el menú lateral",
                        "Haz clic en el botón '+ Crear Evento'",
                        "Completa la información básica (Los campos marcados con * son obligatorios)",
                        "Guarda el evento"
                    ]
                },
                {
                    id: "eventos-gestionar",
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
                    id: "funciones-gestionar",
                    title: "Gestionar Funciones",
                    steps: [
                        "Accede a tu evento y ve a la pestaña 'Funciones'",
                        "Verás la lista de todas las funciones creadas para este evento",
                        "Si no hay funciones, aparecerá un mensaje invitándote a crear la primera",
                    ]
                },
                {
            id: "funciones-crear",
            title: "Crear una Nueva Función",
            steps: [
                "Desde la página de funciones, haz clic en '+ Crear Función'",
                "Completa la información básica (Los campos marcados con * son obligatorios)",
                "Marca el switch 'Función Activa' (viene activado por defecto)",
                "Haz clic en 'Crear Función' para guardar"
            ]
        },
        {
            id: "funciones-acciones",
            title: "Acciones sobre Funciones",
            steps: [
                "Dentro de cada función en la lista, encontrarás varias acciones disponibles:",
                "Editar: Haz clic en el ícono de lápiz para modificar nombre, descripción, fechas y estado de la función",
                "Eliminar: Haz clic en el ícono de papelera (rojo) para eliminar permanentemente la función. No puedes eliminar funciones con entradas vendidas.",
                "Activar/Desactivar: Haz clic en el ícono de ojo para cambiar el estado de la función entre activa e inactiva.",
                "Las funciones activas muestran badge azul 'Activa', las inactivas muestran badge gris 'Inactiva'",
                "Las funciones inactivas no aparecen en la venta pública pero conservan sus datos"
            ]
        },
        {
            id: "funciones-eliminar",
            title: "Eliminar una Función",
            steps: [
                "Haz clic en el ícono de papelera (rojo) junto a la función",
                "Aparecerá un modal de confirmación de eliminación",
                "No se puede eliminar funciones con entradas vendidas",
                "Confirma la eliminación si estás seguro",
                "La función y todos sus datos asociados serán eliminados permanentemente",
                "Esta acción no se puede deshacer"
            ]
        },
            ]
        },
        {
            id: "entradas",
            title: "Tipos de Entradas",
            icon: <Ticket className="w-5 h-5" />,
            subsections: [
                {
                    id: "entradas-vista",
                    title: "Vista General de Entradas",
                    steps: [
                        "Accede a tu evento y ve a la pestaña 'Entradas'",
                        "Verás pestañas por cada función de tu evento con fecha y nombre",
                        "Cada función muestra estadísticas: entradas totales, vendidas, ingresos y entradas visibles",
                        "Si no hay funciones, deberás crearlas"
                    ]
                },
                {
                    id: "entradas-crear",
                    title: "Crear Tipos de Entradas Básicas",
                    steps: [
                        "Accede a tu evento y ve a la pestaña 'Entradas'",
                        "Dentro de una función, haz clic en '+ Crear Entrada' y crea diferentes tipos de entradas (General, VIP, Estudiante, etc.)",
                        "Completa el nombre y selecciona el sector correspondiente",
                        "Define el precio y la cantidad disponible",
                        "Configura fechas de venta (inicio y fin)",
                        "Establece la cantidad máxima por compra",
                        "Guarda la entrada con el botón 'Crear Entrada'"
                    ]
                },
                {
                    id: "entradas-lotes",
                    title: "Lotes de Entradas (Packs)",
                    steps: [
                        "En el formulario de creación, marca la opción 'Este es un lote de entradas'",
                        "Define cuántas entradas incluye cada lote (ej: 4 para pack x4)",
                        "El precio que definas será por todo el lote completo",
                        "El sistema calculará automáticamente el precio por entrada individual",
                        "El sistema mostrará tanto lotes vendidos como entradas emitidas totales",
                    ]
                },
                {
                    id: "entradas-tandas",
                    title: "Sistema de Tandas (Early Bird)",
                    steps: [
                        "Marca la opción 'Crear entrada por tandas'",
                        "Define el número de tandas (máximo 10)",
                        "Establece el porcentaje de incremento del precio entre tandas",
                        "El sistema creará automáticamente múltiples entradas con precios escalonados",
                        "Solo la primera tanda estará visible; las siguientes se activarán cuando se agote la anterior",
                        "Vista previa te mostrará cómo quedarán los precios de cada tanda"
                    ]
                },
                {
                    id: "entradas-capacidad",
                    title: "Gestión de Capacidad por Sectores",
                    steps: [
                        "Al seleccionar un sector, verás la capacidad total disponible",
                        "El sistema te muestra cuántas entradas ya están asignadas",
                        "Puedes ver las entradas disponibles en tiempo real",
                        "Si intentas superar la capacidad, recibirás una advertencia de sobreventa",
                        "Para lotes: el sistema calcula automáticamente las entradas reales que se generarán"
                    ]
                },
                {
                    id: "entradas-acciones",
                    title: "Acciones sobre Entradas",
                    steps: [
                        "Dentro de la tarjeta de cada tipo de entrada, encontrarás varias acciones:",
                        "Cambiar visibilidad: Botón principal para mostrar/ocultar la entrada de la venta",
                        "Editar: Desde el menú de tres puntos, puedes seleccionar la opción 'Editar' que te permitirá modificar todos los campos menos el precio",
                        "Duplicar: Desde el menú de tres puntos, puedes seleccionar la opción 'Duplicar en funciones' que copiará la entrada a otras funciones seleccionadas",
                        "Eliminar: Botón rojo elimina la entrada (requiere confirmación). No se puede eliminar entradas ya vendidas.",
                        "Las entradas ocultas aparecen con botón rojo 'Oculta', las visibles con 'A la venta'"
                    ]
                },
                {
                    id: "entradas-duplicar",
                    title: "Duplicar Entradas entre Funciones",
                    steps: [
                        "Desde el menú de tres puntos, selecciona 'Duplicar en funciones'",
                        "Aparecerá un modal mostrando todas las funciones disponibles",
                        "Las funciones que ya tienen esta entrada estarán marcadas y deshabilitadas",
                        "Selecciona las funciones donde quieres duplicar la entrada",
                        "Confirma y la entrada se creará con los mismos datos en todas las funciones seleccionadas",
                    ]
                }
            ]
        },
        {
            id: "asistentes",
            title: "Gestión de Asistentes",
            icon: <Users className="w-5 h-5" />,
            subsections: [
                {
                    id: "asistentes-vista",
                    title: "Vista General de Asistentes",
                    steps: [
                        "Accede a tu evento y ve a la pestaña 'Asistentes'",
                        "Verás una tabla con todos los asistentes del evento (invitados y compradores)",
                        "Usa el filtro 'Filtrar por función' para ver asistentes de una función específica",
                        "Haz clic en 'Actualizar' para refrescar la información en tiempo real",
                        "Si no hay asistentes, aparecerá un mensaje invitándote a invitar al primero"
                    ]
                },
                {
                    id: "asistentes-tipos",
                    title: "Tipos de Asistentes",
                    steps: [
                        "Invitados: Personas que invitaste directamente (badge azul 'Invitado')",
                        "Compradores: Personas que compraron entradas por su cuenta (badge verde 'Comprador')",
                        "Cada tipo tiene diferentes opciones de gestión disponibles",
                        "Los invitados pueden ser eliminados, los compradores no",
                        "Ambos tipos pueden recibir reenvíos de sus entradas"
                    ]
                },
                {
                    id: "asistentes-invitar",
                    title: "Invitar Nuevos Asistentes",
                    steps: [
                        "Haz clic en '+ Invitar asistente' desde la lista de asistentes",
                        "Completa los datos personales (Los campos marcados con * son obligatorios)",
                        "En la sección 'Entradas', haz clic en 'Agregar Entrada'",
                        "Selecciona la función deseada del menú desplegable",
                        "Elige el tipo de entrada (solo aparecen los que tienen disponibilidad)",
                        "Define la cantidad con los botones + y - o escribiendo directamente",
                        "Puedes agregar múltiples entradas para diferentes funciones",
                        "El sistema calculará automáticamente el total (valor de cortesía)",
                        "Haz clic en 'Invitar Asistente' para enviar la invitación por email"
                    ]
                },
                {
                    id: "asistentes-acciones",
                    title: "Acciones sobre Asistentes",
                    steps: [
                        "Todas las acciones están en el menú de tres puntos de cada fila",
                        "Ver tickets: Abre modal detallado con toda la información del asistente",
                        "Reenviar invitación: Para invitados, reenvía email con sus tickets gratuitos",
                        "Reenviar tickets: Para compradores, reenvía email con entradas compradas",
                        "Eliminar: Solo disponible para invitados (requiere confirmación)",
                    ]
                },
                {
                    id: "asistentes-detalles",
                    title: "Detalles de Tickets",
                    steps: [
                        "Selecciona en el menú de tres puntos 'Ver tickets' y se abrirá un modal",
                        "Muestra información personal completa del asistente",
                        "Tabla detallada con todos los tipos de tickets asignados",
                        "Para invitados: muestra valor de cortesía y badges 'GRATIS'",
                        "Para compradores: muestra precios, descuentos y total pagado",
                        "Estado de cada ticket: disponible o usado",
                        "Información de la función y fechas relevantes",
                    ]
                },
                {
                    id: "asistentes-reenvios",
                    title: "Sistema de Reenvíos",
                    steps: [
                        "Para invitados: reenvía invitación con todos los tickets gratuitos disponibles",
                        "Para compradores: reenvía email original con tickets comprados",
                        "Aparece modal de confirmación antes del reenvío",
                        "El sistema valida automáticamente que existan tickets para reenviar",
                    ]
                },
            ]
        },
        {
            id: "usuarios",
            title: "Usuarios de tu Organización",
            icon: <UserPlus className="w-5 h-5" />,
            subsections: [
                {
                    id: "usuarios-vista",
                    title: "Vista General de Usuarios",
                    steps: [
                        "Ve a 'Usuarios' en el menú lateral para acceder a la gestión de usuarios",
                        "Verás una tabla con todos los usuarios de tu organización",
                        "Usa los filtros de búsqueda y estado para encontrar usuarios específicos",
                        "Si no hay usuarios, aparecerá un mensaje invitándote a crear el primero"
                    ]
                },
                {
                    id: "usuarios-crear",
                    title: "Crear Nuevo Usuario",
                    steps: [
                        "Haz clic en '+ Crear Usuario' desde la lista de usuarios",
                        "Completa los datos personales (Los campos marcados con * son obligatorios)",
                        "Define una contraseña segura (mínimo 8 caracteres)",
                        "Confirma la contraseña en el campo correspondiente",
                        "Haz clic en 'Crear Usuario' para completar el proceso"
                    ]
                },
                {
                    id: "usuarios-acciones",
                    title: "Acciones sobre Usuarios",
                    steps: [
                        "Editar: Aunque aún no está implementado, podrás modificar la información de usuarios existentes",
                        "Eliminar: Botón rojo con ícono de papelera para eliminar permanentemente el usuario",
                        "Una vez eliminado, el usuario y sus datos se borran permanentemente",
                        "No se pueden eliminar usuarios que tengan actividad en eventos activos"
                    ]
                },
            ]
        },
        {
            id: "reportes",
            title: "Monitoreo y Reportes",
            icon: <BarChart3 className="w-5 h-5" />,
            subsections: [
                {
                    id: "reportes-dashboard-general",
                    title: "Dashboard General del Organizador",
                    steps: [
                        "Accede al Dashboard desde el menú principal",
                        "Verás 4 métricas principales de todos tus eventos:",
                        "Ingresos Totales: suma de todos los ingresos de tus eventos",
                        "Entradas Vendidas: total de lotes + entradas individuales vendidas",
                        "Tickets Emitidos: cantidad real de entradas físicas generadas",
                        "Eventos Activos: eventos que están actualmente en venta",
                        "Gráfico de ingresos de los últimos 30 días con línea de tendencia",
                        "Lista de eventos con mayor rendimiento ordenados por ingresos",
                        "Sección de Eventos Recientes que muestra tus últimos eventos creados",

                    ]
                },
                {
                    id: "reportes-dashboard-evento",
                    title: "Dashboard Específico de un Evento",
                    steps: [
                        "Accede haciendo clic en la tarjeta de un evento o desde el botón 'Gestionar'",
                        "Visualizarás información básica del evento",
                        "Badge 'Destacado' si el evento está marcado como featured",
                        "5 métricas específicas del evento:",
                        "Total Funciones creadas para el evento",
                        "Funciones Activas (visibles para venta)",
                        "Entradas Vendidas (lotes + individuales sin multiplicar)",
                        "Tickets Emitidos (entradas físicas reales generadas)",
                        "Ingresos totales generados por el evento"
                    ]
                },
                {
                    id: "reportes-diferencias-metricas",
                    title: "Diferencia entre Entradas y Tickets",
                    steps: [
                        "Entradas Vendidas: cuenta lotes y entradas individuales (1 lote x4 = 1 entrada vendida)",
                        "Tickets Emitidos: cuenta entradas físicas reales (1 lote x4 = 4 tickets emitidos)",
                        "Esta diferencia es importante para entender el impacto real de los lotes",
                        "Los lotes generan menos 'entradas vendidas' pero más 'tickets emitidos'",
                        "Ambas métricas son importantes para diferentes análisis de negocio"
                    ]
                },
            ]
        },
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
                            const isExpanded = expandedSection === section.id;

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
                                            <h2 className="text-xl font-medium text-gray-900">{section.title}</h2>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                        )}
                                    </button>

                                    {/* Section Content */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6 space-y-2">
                                            {section.subsections.map((subsection, idx) => {
                                                const isSubExpanded = expandedSubsection === subsection.id;
                                                
                                                return (
                                                    <div key={idx} className="border border-gray-100 rounded-lg overflow-hidden">
                                                        {/* Subsection Header */}
                                                        <button
                                                            onClick={() => toggleSubsection(subsection.id)}
                                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-l-4 border-teal-500"
                                                        >
                                                            <h3 className="text-lg font-medium text-gray-800">
                                                                {subsection.title}
                                                            </h3>
                                                            {isSubExpanded ? (
                                                                <ChevronUp className="w-4 h-4 text-gray-500" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                                            )}
                                                        </button>

                                                        {/* Subsection Content */}
                                                        {isSubExpanded && (
                                                            <div className="p-4">
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
                                                        )}
                                                    </div>
                                                );
                                            })}
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
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
