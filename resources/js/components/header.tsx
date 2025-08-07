import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';

interface HeaderProps {
    className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
    const { auth } = usePage<SharedData>().props;

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <header className={`bg-white backdrop-blur-md border-b border-white/10 justify-center flex sticky top-0 z-50 w-full ${className}`}>
            <div className="container py-4 px-0 justify-center w-full">
                <div className="flex items-center justify-between w-full">
                    <Link href={route('home')} className="flex items-center space-x-2">
                        <div className="w-13 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">TRG</span>
                        </div>
                        <h1 className="text-2xl font-bold bg-primary bg-clip-text text-transparent">
                            Ticketera-RG
                        </h1>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6"> 
                        <Link href={route('events')} className="text-gray-500 font-medium hover:text-primary transition-colors">
                            Eventos
                        </Link>
                        {auth.user && (
                            <Link href={route('my-tickets')} className="text-gray-500  font-medium hover:text-primary transition-colors">
                                Mis Tickets
                            </Link>
                        )}

                        <Link href={route('help')} className="text-gray-500 font-medium hover:text-primary transition-colors">
                            Ayuda
                        </Link>
                        {auth.user ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={route('my-account')}
                                    className="text-gray-500 hover:text-primary font-medium transition-colors cursor-pointer"
                                >
                                    Hola, {auth.user.person.name}
                                </Link>
                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    size="sm"
                                    className="bg-primary text-white hover:bg-primary-hover"
                                >
                                    Cerrar Sesión
                                </Button>
                            </div>
                        ) : (
                            <>
                            <Link href={route('login')}>
                                <button className="text-gray-500 font-medium  hover:text-primary transition-colors">
                                    Iniciar Sesión
                                </button>
                            </Link>
                            <Link href={route('register')}>
                                <button className="bg-primary px-3 py-2 rounded-lg font-medium hover:bg-primary/80 text-white">
                                    Registrarse
                                </button>
                            </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}