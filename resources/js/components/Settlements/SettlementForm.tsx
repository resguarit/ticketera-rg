import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';

interface Settlement {
    id?: number;
    transfer_date: string;
    quantity: number;
    amount_unit_gross: number;
    amount_total_gross: number;
    amount_unit_net: number;
    amount_total_net: number;
    discounts: number;
    discount_observation: string | null;
    total_transfer: number;
    attachment_path?: string | null;
}

interface SettlementFormProps {
    isOpen: boolean;
    onClose: () => void;
    settlement?: Settlement | null;
    functionId: number;
}

export default function SettlementForm({ isOpen, onClose, settlement, functionId }: SettlementFormProps) {
    const isEditing = !!settlement;

    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        event_function_id: functionId,
        transfer_date: '',
        quantity: '' as any,
        amount_unit_gross: '' as any,
        amount_total_gross: 0,
        amount_unit_net: '' as any,
        amount_total_net: 0,
        discounts: '' as any,
        discount_observation: '',
        total_transfer: 0,
        attachment: null as File | null,
    });

    const [fileName, setFileName] = useState<string | null>(null);

    // Reset form when modal opens or settlement changes
    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (settlement) {
                // Editing mode - populate with settlement data
                // Convert datetime to datetime-local format (YYYY-MM-DDTHH:mm)
                const transferDate = settlement.transfer_date
                    ? settlement.transfer_date.substring(0, 16)
                    : '';

                setData({
                    event_function_id: functionId,
                    transfer_date: transferDate,
                    quantity: settlement.quantity as any,
                    amount_unit_gross: settlement.amount_unit_gross as any,
                    amount_total_gross: settlement.amount_total_gross,
                    amount_unit_net: settlement.amount_unit_net as any,
                    amount_total_net: settlement.amount_total_net,
                    discounts: settlement.discounts as any,
                    discount_observation: settlement.discount_observation || '',
                    total_transfer: settlement.total_transfer,
                    attachment: null,
                });
            } else {
                // Creating mode - reset to empty
                setData({
                    event_function_id: functionId,
                    transfer_date: '',
                    quantity: '' as any,
                    amount_unit_gross: '' as any,
                    amount_total_gross: 0,
                    amount_unit_net: '' as any,
                    amount_total_net: 0,
                    discounts: '' as any,
                    discount_observation: '',
                    total_transfer: 0,
                    attachment: null,
                });
            }
            setFileName(null);
        }
    }, [isOpen, settlement]);

    // Recalcular totales cuando cambian los valores
    useEffect(() => {
        const qty = Number(data.quantity) || 0;
        const unitGross = Number(data.amount_unit_gross) || 0;
        const unitNet = Number(data.amount_unit_net) || 0;
        const disc = Number(data.discounts) || 0;

        const totalGross = qty * unitGross;
        const totalNet = qty * unitNet;
        const totalTransfer = totalNet - disc;

        setData(prev => ({
            ...prev,
            amount_total_gross: totalGross,
            amount_total_net: totalNet,
            total_transfer: totalTransfer,
        }));
    }, [data.quantity, data.amount_unit_gross, data.amount_unit_net, data.discounts]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && settlement) {
            put(route('admin.settlements.update', settlement.id), {
                onSuccess: () => {
                    onClose();
                },
            });
        } else {
            post(route('admin.settlements.store'), {
                onSuccess: () => {
                    onClose();
                },
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('attachment', file);
            setFileName(file.name);
        }
    };

    const removeFile = () => {
        setData('attachment', null);
        setFileName(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Liquidación' : 'Nueva Liquidación'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Fecha de Transferencia */}
                        <div>
                            <Label htmlFor="transfer_date">Fecha de Transferencia *</Label>
                            <Input
                                id="transfer_date"
                                type="datetime-local"
                                value={data.transfer_date}
                                onChange={e => setData('transfer_date', e.target.value)}
                                required
                            />
                            {errors.transfer_date && <p className="text-sm text-red-600 mt-1">{errors.transfer_date}</p>}
                        </div>

                        {/* Cantidad */}
                        <div>
                            <Label htmlFor="quantity">Cantidad *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={data.quantity}
                                onChange={e => setData('quantity', e.target.value as any)}
                                required
                            />
                            {errors.quantity && <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>}
                        </div>

                        {/* Entrada Unitario Bruto */}
                        <div>
                            <Label htmlFor="amount_unit_gross">Entrada Unitario (Bruto) *</Label>
                            <Input
                                id="amount_unit_gross"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.amount_unit_gross}
                                onChange={e => setData('amount_unit_gross', e.target.value as any)}
                                required
                            />
                            {errors.amount_unit_gross && <p className="text-sm text-red-600 mt-1">{errors.amount_unit_gross}</p>}
                        </div>

                        {/* Subtotal Bruto (calculado) */}
                        <div>
                            <Label htmlFor="amount_total_gross">Subtotal Importes Brutos</Label>
                            <Input
                                id="amount_total_gross"
                                type="number"
                                step="0.01"
                                value={data.amount_total_gross.toFixed(2)}
                                disabled
                                className="bg-gray-100"
                            />
                        </div>

                        {/* Entrada Unitario Neto */}
                        <div>
                            <Label htmlFor="amount_unit_net">Importe Entrada Neto *</Label>
                            <Input
                                id="amount_unit_net"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.amount_unit_net}
                                onChange={e => setData('amount_unit_net', e.target.value as any)}
                                required
                            />
                            {errors.amount_unit_net && <p className="text-sm text-red-600 mt-1">{errors.amount_unit_net}</p>}
                        </div>

                        {/* Subtotal Neto (calculado) */}
                        <div>
                            <Label htmlFor="amount_total_net">Subtotal Importe Netos</Label>
                            <Input
                                id="amount_total_net"
                                type="number"
                                step="0.01"
                                value={data.amount_total_net.toFixed(2)}
                                disabled
                                className="bg-gray-100"
                            />
                        </div>

                        {/* Descuentos */}
                        <div>
                            <Label htmlFor="discounts">Descuentos</Label>
                            <Input
                                id="discounts"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.discounts}
                                onChange={e => setData('discounts', e.target.value as any)}
                            />
                            {errors.discounts && <p className="text-sm text-red-600 mt-1">{errors.discounts}</p>}
                        </div>

                        {/* Total Transferencia (calculado) */}
                        <div>
                            <Label htmlFor="total_transfer">Importe Total de la Transferencia</Label>
                            <Input
                                id="total_transfer"
                                type="number"
                                step="0.01"
                                value={data.total_transfer.toFixed(2)}
                                disabled
                                className="bg-gray-100 font-semibold"
                            />
                        </div>
                    </div>

                    {/* Observaciones del Descuento */}
                    <div>
                        <Label htmlFor="discount_observation">Observaciones del Descuento</Label>
                        <Textarea
                            id="discount_observation"
                            value={data.discount_observation || ''}
                            onChange={e => setData('discount_observation', e.target.value)}
                            rows={3}
                            placeholder="Detalles sobre los descuentos aplicados..."
                        />
                        {errors.discount_observation && <p className="text-sm text-red-600 mt-1">{errors.discount_observation}</p>}
                    </div>

                    {/* Archivo Adjunto */}
                    <div>
                        <Label htmlFor="attachment">Archivo Adjunto</Label>
                        <div className="mt-2">
                            {fileName ? (
                                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                    <span className="flex-1 text-sm text-gray-700 truncate">{fileName}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={removeFile}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors">
                                    <Upload className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-600">Seleccionar archivo (PDF, JPG, PNG, DOC)</span>
                                    <input
                                        id="attachment"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                        {errors.attachment && <p className="text-sm text-red-600 mt-1">{errors.attachment}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
