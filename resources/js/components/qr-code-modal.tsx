import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import QRCode from "react-qr-code";

interface ModalQRProps {
    open: boolean;
    onClose: () => void;
    value: string;
}

export default function ModalQR({ open, onClose, value }: ModalQRProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-sm flex flex-col items-center justify-center p-6">
                <DialogHeader>
                    <DialogTitle className="text-center">Código de Acceso</DialogTitle>
                    <DialogDescription className="text-center">
                        Presenta este código en la entrada del evento.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-4 bg-white rounded-lg border shadow-sm my-4">
                    <QRCode value={value} size={200} />
                </div>
                <div className="text-center bg-gray-50 p-3 rounded-md w-full">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Código Único</p>
                    <p className="font-mono text-lg font-bold tracking-wider">{value}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}