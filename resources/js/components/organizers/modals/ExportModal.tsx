import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileSpreadsheet } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (type: 'tickets' | 'service_fee') => void;
}

export default function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
    const [exportType, setExportType] = useState<'tickets' | 'service_fee'>('tickets');

    const handleConfirm = () => {
        onExport(exportType);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Exportar para Facturación</DialogTitle>
                    <DialogDescription>
                        Selecciona qué concepto deseas exportar a Excel. El archivo contendrá fecha, datos del cliente y el monto correspondiente.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <RadioGroup
                        defaultValue="tickets"
                        value={exportType}
                        onValueChange={(v) => setExportType(v as 'tickets' | 'service_fee')}
                        className="grid gap-4"
                    >
                        <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-gray-50">
                            <RadioGroupItem value="tickets" id="opt-tickets" />
                            <div className="grid gap-1.5 cursor-pointer flex-1" onClick={() => setExportType('tickets')}>
                                <Label htmlFor="opt-tickets" className="font-semibold cursor-pointer">Facturar Entradas</Label>
                                <span className="text-sm text-muted-foreground">Exporta el valor neto de los tickets (Subtotal).</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-gray-50">
                            <RadioGroupItem value="service_fee" id="opt-fee" />
                            <div className="grid gap-1.5 cursor-pointer flex-1" onClick={() => setExportType('service_fee')}>
                                <Label htmlFor="opt-fee" className="font-semibold cursor-pointer">Facturar Cargos por Servicio</Label>
                                <span className="text-sm text-muted-foreground">Exporta únicamente el valor del Service Fee.</span>
                            </div>
                        </div>
                    </RadioGroup>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Descargar Excel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}