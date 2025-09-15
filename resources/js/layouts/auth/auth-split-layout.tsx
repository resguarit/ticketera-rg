import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { type PropsWithChildren } from 'react';
import fondoLayout from '../../../../public/images/fondo_layout.png';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Botón Volver al Inicio - Siempre visible en la esquina superior izquierda */}
            <div className="absolute top-4 left-4 z-30">
                <Link href={route('home')}>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-white hover:bg-white/20 lg:text-gray-400 lg:hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Inicio
                    </Button>
                </Link>
            </div>

            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <img 
                    src={fondoLayout} 
                    alt="Fondo" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Overlay para mejorar la legibilidad del botón en desktop */}
                <div className="absolute inset-0 bg-black/20"></div>
            </div>
            
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <AppLogoIcon className="h-10 fill-current text-black sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
