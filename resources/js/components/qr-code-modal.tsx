import QRCode from 'react-qr-code'

interface ModalQRProps {
    open: boolean;
    onClose: () => void;
    value: string;
}

export default function ModalQR({ open, onClose, value }: ModalQRProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
                <h3 className="text-lg font-semibold mb-4">
                    QR del ticket
                </h3>

                <div className="flex justify-center mb-4 bg-white p-3 rounded">
                    <QRCode value={value} size={180} />
                </div>

                <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-red-500 rounded text-white hover:bg-red-600 transition"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}