import { Head } from '@inertiajs/react';
import EventManagementLayout from '@/layouts/event-management-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    MapPin,
    Users,
    DollarSign,
    TrendingUp,
    Clock,
    Ticket,
    Eye,
    EyeOff
} from 'lucide-react';
import { Event, EventRelations } from '@/types/models/event';
import { EventFunction } from '@/types/models/eventFunction';
import { compareDates, isDateAfter } from '@/lib/dateHelpers';
import { formatCurrency } from '@/lib/currencyHelpers';

interface EventFunctionDetail extends EventFunction {
    date: string;
    time: string;
    formatted_date: string;
    day_name: string;
    status: string;
    status_label: string;
    status_color: string;
    entradas_vendidas: number;
    tickets_emitidos: number;
}

interface EventWithDetails extends Event, EventRelations {
    functions: EventFunctionDetail[];
    total_revenue: number;
    entradas_vendidas: number;
    tickets_emitidos: number;
}

interface EventManageProps {
    auth: any;
    event: EventWithDetails;
    currentDateTime: string;
}

export default function EventManage({ auth, event, currentDateTime }: EventManageProps) {
    // Calcular estadísticas básicas
    const totalFunctions = event.functions?.length || 0;
    const activeFunctions = event.functions?.filter(f => f.is_active)?.length || 0;

    // Obtener la próxima función usando el currentDateTime del backend
    const upcomingFunctions = event.functions?.filter(f => {
        const functionDateTime = `${f.formatted_date}T${f.time}:00`;
        return isDateAfter(functionDateTime, currentDateTime);
    }) || [];

    const nextFunction = upcomingFunctions.sort((a, b) => {
        const dateTimeA = `${a.formatted_date}T${a.time}:00`;
        const dateTimeB = `${b.formatted_date}T${b.time}:00`;
        return compareDates(dateTimeA, dateTimeB);
    })[0];

    // Función para obtener badge de estado de función
    const getFunctionStatusBadge = (func: EventFunctionDetail) => {
        const colorMap: Record<string, string> = {
            'green': 'bg-green-500 hover:bg-green-600',
            'blue': 'bg-blue-500 hover:bg-blue-600',
            'red': 'bg-red-500 hover:bg-red-600',
            'gray': 'bg-gray-500 hover:bg-gray-600',
            'yellow': 'bg-yellow-500 hover:bg-yellow-600',
            'orange': 'bg-orange-500 hover:bg-orange-600',
        };

        const badgeColor = colorMap[func.status_color] || 'bg-gray-500 hover:bg-gray-600';

        return (
            <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${badgeColor} text-white border-0 text-xs`}>
                    {func.status_label}
                </Badge>
                {!func.is_active && (
                    <Badge className="bg-gray-400 hover:bg-gray-500 text-white border-0 text-xs">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Oculto
                    </Badge>
                )}
            </div>
        );
    };

    return (
        <>
            <Head title={`Gestionar: ${event.name}`} />

            <EventManagementLayout event={event} activeTab="overview">
                <div className="space-y-6">
                    {/* Header del evento */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
                                    {event.featured && (
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                            Destacado
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-gray-600 mb-4 max-w-3xl line-clamp-3 md:line-clamp-none">{event.description}</p>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>{event.category.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{event.venue.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{totalFunctions} función{totalFunctions !== 1 ? 'es' : ''}</span>
                                    </div>
                                </div>
                            </div>

                            {event.image_url && (
                                <div className="ml-6">
                                    <img
                                        src={event.image_url}
                                        alt={`Banner de ${event.name}`}
                                        className="w-32 h-20 object-cover rounded border"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Estadísticas rápidas */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <Card className="p-6 bg-gradient-to-br from-white to-blue-50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <p className="text-sm font-medium text-gray-700">Total Funciones</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{totalFunctions}</p>
                            </div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-white to-green-50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <p className="text-sm font-medium text-gray-700">Funciones Activas</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{activeFunctions}</p>
                            </div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-white to-red-50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <p className="text-sm font-medium text-gray-700">Entradas Vendidas</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{event.entradas_vendidas}</p>
                                <p className="text-xs text-gray-500">lotes + individuales</p>
                            </div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-white to-purple-50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <p className="text-sm font-medium text-gray-700">Tickets Emitidos</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{event.tickets_emitidos}</p>
                                <p className="text-xs text-gray-500">entradas físicas</p>
                            </div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-white to-yellow-50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <p className="text-sm font-medium text-gray-700">Ingresos</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{formatCurrency(event.total_revenue)}</p>
                            </div>
                        </Card>
                    </div>

                    <div className='flex flex-col md:flex-row gap-4'>
                        {/* Próxima función */}
                        {nextFunction && (
                            <Card className="p-6 w-full md:w-1/2">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Próxima Función</h3>
                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-indigo-900 mb-2">{nextFunction.name}</h4>
                                            <div className="flex items-center gap-4 mb-3 text-sm text-indigo-700">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{nextFunction.date}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{nextFunction.time}</span>
                                                </div>
                                            </div>
                                            {nextFunction.description && (
                                                <p className="text-sm text-indigo-600 mb-3">{nextFunction.description}</p>
                                            )}
                                            {getFunctionStatusBadge(nextFunction)}
                                        </div>
                                        <div className="text-left sm:text-right sm:ml-4">
                                            <Badge variant="outline" className="border-indigo-300 text-indigo-700">
                                                {nextFunction.day_name}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Lista de todas las funciones */}
                        <Card className="p-6 w-full md:w-1/2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Todas las Funciones</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {event.functions && event.functions.length > 0 ? (
                                    event.functions.map((func) => (
                                        <div key={func.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <h4 className="font-medium text-gray-900">{func.name}</h4>
                                                    {getFunctionStatusBadge(func)}
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                                    <span>{func.date} • {func.time}</span>
                                                    <span>{func.day_name}</span>
                                                </div>
                                                {func.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{func.description}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-row sm:flex-col items-start sm:items-end gap-x-4 gap-y-1 sm:text-right sm:ml-4">
                                                <span className="text-sm text-gray-700 font-medium">{func.entradas_vendidas} entradas</span>
                                                <span className="text-xs text-purple-600">{func.tickets_emitidos} tickets emitidos</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>No hay funciones configuradas para este evento</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </EventManagementLayout>
        </>
    );
}
