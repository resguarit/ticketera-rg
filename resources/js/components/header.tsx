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
        <header className={`bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 ${className}`}>
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href={route('home')} className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">T</span>
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                            TicketMax
                        </h1>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href={route('events')} className="text-white hover:text-cyan-400 transition-colors">
                            Eventos
                        </Link>
                        {auth.user && (
                            <Link href={route('my-tickets')} className="text-white hover:text-cyan-400 transition-colors">
                                Mis Tickets
                            </Link>
                        )}

                        <Link href={route('help')} className="text-white hover:text-cyan-400 transition-colors">
                            Ayuda
                        </Link>
                        {auth.user ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={route('my-account')}
                                    className="text-white/80 hover:text-cyan-400 transition-colors cursor-pointer"
                                >
                                    Hola, {auth.user.name}
                                </Link>
                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    size="sm"
                                    className="border-white/30 text-white hover:bg-white/20 bg-transparent"
                                >
                                    Cerrar Sesión
                                </Button>
                            </div>
                        ) : (
                            <Link href={route('login')}>
                                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white">
                                    Iniciar Sesión
                                </Button>
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}