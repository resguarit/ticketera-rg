import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, User, Mail, Phone, CreditCard, Gift, Calendar } from 'lucide-react';
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
    if (!data && !loading) return null;

    const renderPersonInfo = (person: any) => (
        <Card className="mb-4">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                    <User className="w-5 h-5 mr-2" />
                    Información Personal
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Nombre Completo</p>
                        <p className="font-semibold">{person.full_name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">DNI</p>
                        <p className="font-semibold">{person.dni || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <p className="font-semibold flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {person.email || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Teléfono</p>
                        <p className="font-semibold flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {person.phone || 'N/A'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderTicketsTable = (perType: any[], type: 'buyer' | 'invited') => (
        <Card className="mb-4">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                    {type === 'buyer' ? (
                        <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Tickets Comprados
                        </>
                    ) : (
                        <>
                            <Gift className="w-5 h-5 mr-2" />
                            Tickets Asignados
                        </>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tipo de Ticket</TableHead>
                            <TableHead className="text-center">Cantidad</TableHead>
                            <TableHead className="text-right">
                                {type === 'buyer' ? 'Precio Unit.' : 'Valor Unit.'}
                            </TableHead>
                            <TableHead className="text-right">
                                {type === 'buyer' ? 'Subtotal' : 'Valor Total'}
                            </TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {perType.map((item) => (
                            <TableRow key={item.ticket_type_id}>
                                <TableCell className="font-medium">
                                    {item.ticket_type_name}
                                </TableCell>
                                <TableCell className="text-center">
                                    {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                    {type === 'buyer' ? 
                                        formatCurrency(item.price) : 
                                        formatCurrency(item.courtesy_value)
                                    }
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                    {type === 'buyer' ? 
                                        formatCurrency(item.subtotal) : 
                                        formatCurrency(item.total_courtesy_value)
                                    }
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col gap-1">
                                        {item.tickets_used > 0 && (
                                            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                {item.tickets_used} usado{item.tickets_used > 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                        {item.tickets_available > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {item.tickets_available} disponible{item.tickets_available > 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    const renderBuyerSummary = (data: OrderDetails) => (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Resumen de Compra
                </CardTitle>
                <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Comprado el: {data.order.order_date}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(data.totals.subtotal)}</span>
                </div>
                
                {data.totals.discount_amount > 0 && (
                    <>
                        <div className="flex justify-between text-green-600">
                            <span>Descuento ({data.totals.discount_percentage}%):</span>
                            <span className="font-semibold">-{formatCurrency(data.totals.discount_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Subtotal con descuento:</span>
                            <span className="font-semibold">{formatCurrency(data.totals.subtotal_after_discount)}</span>
                        </div>
                    </>
                )}
                
                {data.totals.service_fee_amount > 0 && (
                    <div className="flex justify-between">
                        <span>Service Fee:</span>
                        <span className="font-semibold">{formatCurrency(data.totals.service_fee_amount)}</span>
                    </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL PAGADO:</span>
                    <span className="text-green-600">{formatCurrency(data.totals.total_paid)}</span>
                </div>

                {data.discount_code && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                            Código de descuento aplicado: <strong>{data.discount_code.code}</strong>
                        </p>
                        <p className="text-xs text-green-600">{data.discount_code.description}</p>
                    </div>
                )}

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                        <strong>Estado:</strong> {data.order.status}
                        {data.order.transaction_id && (
                            <>
                                <br />
                                <strong>ID Transacción:</strong> {data.order.transaction_id}
                            </>
                        )}
                    </p>
                </div>
            </CardContent>
        </Card>
    );

    const renderInvitedSummary = (data: AssistantDetails) => (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                    <Gift className="w-5 h-5 mr-2" />
                    Resumen de Invitación
                </CardTitle>
                <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Invitado el: {data.assistant.invited_at}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between">
                    <span>Total de tickets:</span>
                    <span className="font-semibold">{data.totals.total_tickets}</span>
                </div>
                
                <div className="flex justify-between text-green-600">
                    <span>Tickets usados:</span>
                    <span className="font-semibold">{data.totals.tickets_used}</span>
                </div>
                
                <div className="flex justify-between">
                    <span>Tickets disponibles:</span>
                    <span className="font-semibold">{data.totals.tickets_available}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                    <span>VALOR EN CORTESÍA:</span>
                    <span className="text-blue-600">{formatCurrency(data.totals.total_courtesy_value)}</span>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                        Función: <strong>{data.function.name}</strong>
                    </p>
                    <p className="text-xs text-blue-600">
                        Fecha y hora: {data.function.start_time}
                    </p>
                </div>

                {data.assistant.sended_at && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-600">
                            <strong>Invitación enviada:</strong> {data.assistant.sended_at}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {loading ? 'Cargando detalles...' : (
                            data?.type === 'buyer' ? 
                                `📊 Detalle de Compra - Orden #${(data as OrderDetails).order.id}` :
                                `🎫 Tickets Asignados - ${(data as AssistantDetails).person.full_name}`
                        )}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3">Cargando detalles...</span>
                    </div>
                ) : data && (
                    <div className="space-y-6">
                        {renderPersonInfo(data.person)}
                        {renderTicketsTable(data.per_type, data.type)}
                        {data.type === 'buyer' ? 
                            renderBuyerSummary(data as OrderDetails) : 
                            renderInvitedSummary(data as AssistantDetails)
                        }
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
