import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';

interface WelcomePopupProps {
    imageUrl: string;
    mobileImageUrl?: string;
    cookieName?: string;
    expirationDays?: number;
}

export default function WelcomePopup({ 
    imageUrl, 
    mobileImageUrl,
    cookieName = 'welcome_popup_seen',
    expirationDays = 30
}: WelcomePopupProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Verificar si la cookie existe
        const hasSeenPopup = getCookie(cookieName);
        
        if (!hasSeenPopup) {
            // Mostrar el popup después de un pequeño delay para mejor UX
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [cookieName]);

    const handleClose = () => {
        // Crear cookie que expira en X días
        setCookie(cookieName, 'true', expirationDays);
        setIsOpen(false);
    };

    // Función para obtener una cookie
    const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null;
        }
        return null;
    };

    // Función para crear una cookie
    const setCookie = (name: string, value: string, days: number) => {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent 
                className="max-w-[90vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 bg-transparent border-none shadow-2xl"
                onInteractOutside={handleClose}
            >
                {/* Botón de cerrar */}
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-2.5 shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                    aria-label="Cerrar"
                >
                    <X className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                </button>

                {/* Imagen del popup */}
                <div className="relative w-full">
                    <picture>
                        {mobileImageUrl && (
                            <source media="(max-width: 640px)" srcSet={mobileImageUrl} />
                        )}
                        <img
                            src={imageUrl}
                            alt="Bienvenida"
                            className="w-full h-auto rounded-lg"
                            style={{ maxHeight: '80vh', objectFit: 'contain' }}
                        />
                    </picture>
                </div>
            </DialogContent>
        </Dialog>
    );
}