import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/currencyHelpers';
import { router } from '@inertiajs/react';

interface Settlement {
    id: number;
    transfer_date: string;
    quantity: number;
    amount_unit_gross: number;
    amount_total_gross: number;
    amount_unit_net: number;
    amount_total_net: number;
    discounts: number;
    discount_observation: string | null;
    total_transfer: number;
    attachment_path: string | null;
    attachment_url: string | null;
}

interface SettlementTableProps {
    settlements: Settlement[];
    isReadOnly?: boolean;
    onEdit?: (settlement: Settlement) => void;
    onDelete?: (settlementId: number) => void;
}

export default function SettlementTable({
    settlements,
    isReadOnly = false,
    onEdit,
    onDelete
}: SettlementTableProps) {

    // Calcular totales
    const totals = settlements.reduce((acc, settlement) => ({
        quantity: acc.quantity + settlement.quantity,
        amount_total_gross: acc.amount_total_gross + settlement.amount_total_gross,
        amount_total_net: acc.amount_total_net + settlement.amount_total_net,
        discounts: acc.discounts + settlement.discounts,
        total_transfer: acc.total_transfer + settlement.total_transfer,
    }), {
        quantity: 0,
        amount_total_gross: 0,
        amount_total_net: 0,
        discounts: 0,
        total_transfer: 0,
    });

    const formatDate = (dateString: string) => {
        // dateString should be in format "YYYY-MM-DDTHH:mm"
        if (!dateString) return '';

        const parts = dateString.split('T');
        if (parts.length !== 2) return dateString; // Return as-is if format is unexpected

        const [datePart, timePart] = parts;
        const [year, month, day] = datePart.split('-');

        // timePart should be "HH:mm"
        return `${day}/${month}/${year} ${timePart || ''}`;
    };

    if (settlements.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay liquidaciones</h3>
                <p className="text-gray-600">
                    {isReadOnly
                        ? 'No se han registrado liquidaciones para esta función.'
                        : 'Comienza agregando una nueva liquidación.'}
                </p>
            </div>
        );
    }

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold text-gray-900">Fecha</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-center">Cantidad</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-right">Unitario Bruto</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-right">Subtotal Bruto</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-right">Unitario Neto</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-right">Subtotal Neto</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-right">Descuentos</TableHead>
                            <TableHead className="font-semibold text-gray-900">Observaciones</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-right">Total Transferencia</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-center">Archivo</TableHead>
                            {!isReadOnly && <TableHead className="font-semibold text-gray-900 text-center">Acciones</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {settlements.map((settlement) => (
                            <TableRow key={settlement.id} className="hover:bg-gray-50">
                                <TableCell className="font-medium">{formatDate(settlement.transfer_date)}</TableCell>
                                <TableCell className="text-center">{settlement.quantity}</TableCell>
                                <TableCell className="text-right">{formatCurrency(settlement.amount_unit_gross)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(settlement.amount_total_gross)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(settlement.amount_unit_net)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(settlement.amount_total_net)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(settlement.discounts)}</TableCell>
                                <TableCell className="max-w-xs truncate" title={settlement.discount_observation || ''}>
                                    {settlement.discount_observation || '-'}
                                </TableCell>
                                <TableCell className="text-right font-semibold">{formatCurrency(settlement.total_transfer)}</TableCell>
                                <TableCell className="text-center">
                                    {settlement.attachment_url ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(settlement.attachment_url!, '_blank')}
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </TableCell>
                                {!isReadOnly && (
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEdit?.(settlement)}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDelete?.(settlement.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                        {/* Fila de totales */}
                        <TableRow className="bg-gray-100 font-semibold border-t-2 border-gray-300">
                            <TableCell className="font-bold">TOTALES</TableCell>
                            <TableCell className="text-center font-bold">{totals.quantity}</TableCell>
                            <TableCell className="text-right">-</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(totals.amount_total_gross)}</TableCell>
                            <TableCell className="text-right">-</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(totals.amount_total_net)}</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(totals.discounts)}</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell className="text-right font-bold text-green-700">{formatCurrency(totals.total_transfer)}</TableCell>
                            <TableCell>-</TableCell>
                            {!isReadOnly && <TableCell>-</TableCell>}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
