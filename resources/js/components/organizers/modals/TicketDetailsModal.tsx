import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, User, Mail, Phone, CreditCard, Gift, Calendar, X } from 'lucide-react';
import { TicketDetails, OrderDetails, AssistantDetails } from '@/types/models/assistant';
import { formatCurrency } from '@/lib/currencyHelpers';

interface TicketDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: TicketDetails | null;
    loading?: boolean;
}

export default function TicketDetailsModal({ 
    isOpen, 
    onClose, 
    data, 
    loading = false 
}: TicketDetailsModalProps) {
    
    // Manejar ESC key
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const renderPersonInfo = (person: any) => (
        <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                <User className="w-4 h-4 mr-2" />
                Información Personal
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                    <span className="text-gray-500">Nombre:</span>
                    <p className="font-medium">{person.full_name}</p>
                </div>
                <div>
                    <span className="text-gray-500">DNI:</span>
                    <p className="font-medium">{person.dni || 'N/A'}</p>
                </div>
                <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{person.email || 'N/A'}</p>
                </div>
            </div>
        </div>
    );

    const renderTicketsTable = (perType: any[], type: 'buyer' | 'invited') => (
        <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="flex items-center text-sm font-semibold text-gray-700">
                    {type === 'buyer' ? (
                        <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Tickets Comprados
                        </>
                    ) : (
                        <>
                            <Gift className="w-4 h-4 mr-2" />
                            Tickets Asignados
                        </>
                    )}
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-3 py-2 font-medium text-gray-600">Tipo</th>
                            <th className="text-center px-3 py-2 font-medium text-gray-600">Cant.</th>
                            <th className="text-right px-3 py-2 font-medium text-gray-600">
                                {type === 'buyer' ? 'Precio' : 'Valor (Cortesía)'}
                            </th>
                            <th className="text-right px-3 py-2 font-medium text-gray-600">Total</th>
                            <th className="text-center px-3 py-2 font-medium text-gray-600">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {perType.map((item) => (
                            <tr key={item.ticket_type_id} className="border-b last:border-b-0">
                                <td className="px-3 py-2 font-medium">{item.ticket_type_name}</td>
                                <td className="text-center px-3 py-2">{item.quantity}</td>
                                <td className="text-right px-3 py-2">
                                    {type === 'buyer' ? 
                                        formatCurrency(item.price) : 
                                        <div className="flex items-center justify-end">
                                            <Badge variant="default" className="bg-green-100 text-green-800 mr-1">GRATIS</Badge>
                                            <span className="text-gray-500 line-through">{formatCurrency(item.courtesy_value)}</span>
                                        </div>
                                    }
                                </td>
                                <td className="text-right px-3 py-2 font-semibold">
                                    {type === 'buyer' ? 
                                        formatCurrency(item.subtotal) : 
                                        <div className="flex items-center justify-end">
                                            <Badge variant="default" className="bg-green-100 text-green-800 mr-1">GRATIS</Badge>
                                            <span className="text-gray-500 line-through">{formatCurrency(item.total_courtesy_value)}</span>
                                        </div>
                                    }
                                </td>
                                <td className="text-center px-3 py-2">
                                    <div className="flex flex-col gap-1">
                                        {item.tickets_used > 0 && (
                                            <Badge variant="default" className="bg-green-100 text-green-800 text-xs px-2 py-1">
                                                {item.tickets_used} usado{item.tickets_used > 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                        {item.tickets_available > 0 && (
                                            <Badge variant="secondary" className="text-xs px-2 py-1">
                                                {item.tickets_available} disponible{item.tickets_available > 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderBuyerSummary = (data: OrderDetails) => (
        <div className="border rounded-lg bg-white">
            <div className="bg-gray-50 px-4 py-2 border-b rounded-t-lg">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center text-sm font-semibold text-gray-700">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Resumen de Compra
                    </h3>
                    <div className="flex items-center text-xs text-gray-600">
                        <Calendar className="w-3 h-3 mr-1" />
                        {data.order.order_date}
                    </div>
                </div>
            </div>
            
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Columna izquierda - Cálculos */}
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span className="font-medium">{formatCurrency(data.totals.subtotal)}</span>
                        </div>
                        
                        {data.totals.discount_amount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Descuento ({data.totals.discount_percentage}%):</span>
                                <span className="font-medium">-{formatCurrency(data.totals.discount_amount)}</span>
                            </div>
                        )}
                        
                        {data.totals.service_fee_amount > 0 && (
                            <div className="flex justify-between">
                                <span>Cargo servicio{data.totals.tax_percentage > 0 ? ` (+${data.totals.tax_percentage}%)` : ''}:</span>
                                <span className="font-medium">{formatCurrency(data.totals.service_fee_amount)}</span>
                            </div>
                        )}
                        
                        <div
                            className={`border-t pt-2 flex justify-between text-base font-bold ${
                                data.order.status === 'cancelled'
                                ? 'text-red-600 line-through'
                                : 'text-green-600'
                            }`}
                            >
                            <span>
                                {data.order.status === 'cancelled' ? 'TOTAL CANCELADO:' : 'TOTAL PAGADO:'}
                            </span>
                            <span>{formatCurrency(data.totals.total_paid)}</span>
                        </div>
                    </div>

                    {/* Columna derecha - Detalles */}
                    <div className="space-y-2">
                        {data.discount_code && (
                            <div className="bg-green-50 border border-green-200 rounded p-2">
                                <p className="text-xs font-medium text-green-800">
                                    Código: <strong>{data.discount_code.code}</strong>
                                </p>
                                <p className="text-xs text-green-600">{data.discount_code.description}</p>
                            </div>
                        )}

                        <div
                            className={`rounded p-2 border ${
                                data.order.status === 'cancelled'
                                ? 'border-red-400 bg-red-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                            >
                            <p className="text-xs">
                                <strong>Estado:</strong>{' '}
                                <span
                                className={
                                    data.order.status === 'cancelled' ? 'text-red-600 font-semibold' : ''
                                }
                                >
                                {data.order.status}
                                </span>
                                {data.order.transaction_id && (
                                <>
                                    <br />
                                    <strong>ID:</strong> {data.order.transaction_id}
                                </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderInvitedSummary = (data: AssistantDetails) => (
        <div className="border rounded-lg bg-white">
            <div className="bg-gray-50 px-4 py-2 border-b rounded-t-lg">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center text-sm font-semibold text-gray-700">
                        <Gift className="w-4 h-4 mr-2" />
                        Resumen de Invitación
                    </h3>
                    <div className="flex items-center text-xs text-gray-600">
                        <Calendar className="w-3 h-3 mr-1" />
                        {data.assistant.invited_at}
                    </div>
                </div>
            </div>
            
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Columna izquierda - Estadísticas */}
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Total tickets:</span>
                            <span className="font-medium">{data.totals.total_tickets}</span>
                        </div>
                        
                        <div className="flex justify-between text-green-600">
                            <span>Tickets usados:</span>
                            <span className="font-medium">{data.totals.tickets_used}</span>
                        </div>
                        
                        <div className="flex justify-between">
                            <span>Disponibles:</span>
                            <span className="font-medium">{data.totals.tickets_available}</span>
                        </div>
                        
                        <div className="border-t pt-2 flex justify-between text-base font-bold text-blue-600">
                            <span className="flex items-center">
                                VALOR CORTESÍA 
                                <Badge variant="default" className="bg-green-100 text-green-800 ml-2">GRATIS</Badge>
                            </span>
                            <span>{formatCurrency(data.totals.total_courtesy_value)}</span>
                        </div>
                    </div>

                    {/* Columna derecha - Detalles */}
                    <div className="space-y-2">
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                            <p className="text-xs font-medium text-blue-800">
                                Función: <strong>{data.function.name}</strong>
                            </p>
                            <p className="text-xs text-blue-600">{data.function.start_time}</p>
                        </div>

                        {data.assistant.sended_at && (
                            <div className="bg-green-50 border border-green-200 rounded p-2">
                                <p className="text-xs text-green-600">
                                    <strong>Enviado:</strong> {data.assistant.sended_at}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/50"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-[90vw] max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header con botón de cierre */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-lg font-semibold">
                        {loading ? 'Cargando detalles...' : (
                            data?.type === 'buyer' ? 
                                `Detalle de Compra - Orden #${(data as OrderDetails).order.id}` :
                                `Tickets Asignados - ${(data as AssistantDetails).person.full_name}`
                        )}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        type="button"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-4 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3">Cargando detalles...</span>
                        </div>
                    ) : data && (
                        <div className="space-y-4">
                            {renderPersonInfo(data.person)}
                            {renderTicketsTable(data.per_type, data.type)}
                            {data.type === 'buyer' ? 
                                renderBuyerSummary(data as OrderDetails) : 
                                renderInvitedSummary(data as AssistantDetails)
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
