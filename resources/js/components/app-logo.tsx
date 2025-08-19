import AppLogoIcon from './app-logo-icon';
import { useSidebar } from '@/components/ui/sidebar';
import { useState } from 'react';

interface AppLogoProps {
    title?: string;
    logoUrl?: string;
}

export default function AppLogo({ title = 'Laravel Starter Kit', logoUrl }: AppLogoProps) {
    const [imageError, setImageError] = useState(false);
    const { state } = useSidebar();
    
    const handleImageError = () => {
        setImageError(true);
    };

    const showFallbackIcon = !logoUrl || imageError;
    const isCollapsed = state === 'collapsed';
    
    // Construir la URL completa de la imagen siguiendo la misma lógica que en show.tsx
    const getImageSrc = (url: string) => {
        return url.startsWith('/') ? url : `/images/organizers/${url}`;
    };

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                {showFallbackIcon ? (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                ) : (
                    <img 
                        src={getImageSrc(logoUrl)} 
                        alt="Logo" 
                        className="size-full object-cover rounded-md"
                        onError={handleImageError}
                        onLoad={() => setImageError(false)}
                    />
                )}
            </div>
            {!isCollapsed && (
                <div className="ml-1 grid flex-1 text-left text-sm">
                    <span className="mb-0.5 truncate leading-tight font-semibold">{title}</span>
                </div>
            )}
        </>
    );
}
