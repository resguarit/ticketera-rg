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
    Eye
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
    tickets_sold: number;
}

interface EventWithDetails extends Event, EventRelations {
    functions: EventFunctionDetail[];
    total_revenue: number;
    tickets_sold: number;
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
        // Usar formatted_date (Y-m-d) y time para crear datetime completo
        const functionDateTime = `${f.formatted_date}T${f.time}:00`;
        return isDateAfter(functionDateTime, currentDateTime);
    }) || [];
    
    const nextFunction = upcomingFunctions.sort((a, b) => {
        const dateTimeA = `${a.formatted_date}T${a.time}:00`;
        const dateTimeB = `${b.formatted_date}T${b.time}:00`;
        return compareDates(dateTimeA, dateTimeB);
    })[0];

    return (
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
                            <p className="text-gray-600 mb-4 max-w-3xl">{event.description}</p>
                            
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Funciones</p>
                                <p className="text-2xl font-bold text-gray-900">{totalFunctions}</p>
                            </div>
                            <div className="bg-chart-2/20 p-3 rounded-full">
                                <Calendar className="w-6 h-6 text-chart-2" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Funciones Activas</p>
                                <p className="text-2xl font-bold text-gray-900">{activeFunctions}</p>
                            </div>
                            <div className="bg-chart-3/20 p-3 rounded-full">
                                <TrendingUp className="w-6 h-6 text-chart-3" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Entradas Vendidas</p>
                                <p className="text-2xl font-bold text-gray-900">{event.tickets_sold}</p>
                            </div>
                            <div className="bg-chart-4/20 p-3 rounded-full">
                                <Ticket className="w-6 h-6 text-chart-4" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(event.total_revenue)}</p>
                            </div>
                            <div className="bg-chart-5/20 p-3 rounded-full">
                                <DollarSign className="w-6 h-6 text-chart-5" />
                            </div>
                        </div>
                    </Card>
                </div>
                
                <div className='flex gap-4'>
                {/* Próxima función */}
                {nextFunction && (
                    <Card className="p-6 w-1/2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Próxima Función</h3>
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-indigo-900">{nextFunction.name}</h4>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-indigo-700">
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
                                        <p className="text-sm text-indigo-600 mt-2">{nextFunction.description}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className="border-indigo-300 text-indigo-700">
                                        {nextFunction.day_name}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Lista de todas las funciones */}
                <Card className="p-6 w-1/2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Todas las Funciones</h3>
                    <div className="space-y-3">
                        {event.functions && event.functions.length > 0 ? (
                            event.functions.map((func) => (
                                <div key={func.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-medium text-gray-900">{func.name}</h4>
                                            <Badge 
                                                variant={func.is_active ? "default" : "secondary"}
                                                className={func.is_active ? "bg-green-100 text-green-800" : ""}
                                            >
                                                {func.is_active ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                            <span>{func.date} • {func.time}</span>
                                            <span>{func.day_name}</span>
                                        </div>
                                        {func.description && (
                                            <p className="text-sm text-gray-500 mt-1">{func.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">{func.tickets_sold} entradas vendidas</span>
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
    );
}
