import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Menu, X, User, LogOut, Calendar, Ticket, HelpCircle, ChevronRight } from 'lucide-react';

interface HeaderProps {
    className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        setIsOpen(false);
        router.post(route('logout'));
    };

    const handleLinkClick = () => {
        setIsOpen(false);
    };

    return (
        <header className={`bg-white backdrop-blur-md border-b border-white/10 justify-center flex sticky top-0 z-50 w-full ${className}`}>
            <div className="container py-3 sm:py-4 px-3 sm:px-4 justify-center w-full">
                <div className="flex items-center justify-between w-full">
                    {/* Logo */}
                    <Link href={route('home')} className="flex items-center space-x-2">
                        <div className="w-10 h-8 sm:w-13 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg sm:text-xl">TRG</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold bg-primary bg-clip-text text-transparent">
                            <span className="hidden sm:inline">Ticketera-RG</span>
                            <span className="sm:hidden">Ticketera</span>
                        </h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6"> 
                        <Link href={route('events')} className="text-gray-500 font-medium hover:text-primary transition-colors">
                            Eventos
                        </Link>
                        {auth.user && (
                            <Link href={route('my-tickets')} className="text-gray-500 font-medium hover:text-primary transition-colors">
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
                                    className="bg-primary text-white hover:bg-primary-hover border-primary"
                                >
                                    Cerrar Sesión
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link href={route('login')}>
                                    <button className="text-gray-500 font-medium hover:text-primary transition-colors">
                                        Iniciar Sesión
                                    </button>
                                </Link>
                                <Link href={route('register')}>
                                    <button className="bg-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/90 text-white transition-colors">
                                        Registrarse
                                    </button>
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-2 h-9 w-9 text-primary hover:text-primary hover:bg-gray-100"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Abrir menú</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent 
                                side="right" 
                                className="w-[280px] sm:w-[320px] bg-white border-l border-gray-200 p-0"
                            >
                                <SheetHeader className="px-4 py-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <SheetTitle className="text-lg font-bold tracking-tight text-pretty leading-tight text-foreground">
                                            Ticketera-RG
                                        </SheetTitle>
                                    </div>
                                </SheetHeader>

                                <div className="flex flex-col h-full">
                                    <div className="flex-1 ">
                                        {/* User Section */}
                                        {auth.user && (
                                            <Link className=""                                                     
                                            href={route('my-account')}
                                                    onClick={handleLinkClick}>
                                                <div className="mx-6 mb-2 flex items-center space-x-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-foreground text-sm truncate">
                                                            {auth.user.person.name}
                                                        </p>
                                                        <p className="text-xs text-foreground/60 truncate ">
                                                            {auth.user.email}
                                                        </p>
                                                        <p className="flex items-center text-xs text-foreground/70">Mi Cuenta
                                                            <ChevronRight size={14} />
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        )}

                                        {/* Navigation Links */}
                                        <nav className="px-2 space-y-2">
                                            <Link
                                                href={route('events')}
                                                onClick={handleLinkClick}
                                                className="flex items-center space-x-3 p-2 rounded-lg text-foreground hover:bg-gray-50 hover:text-primary transition-colors group"
                                            >
                                                <Calendar className="w-5 h-5 text-primary group-hover:text-primary" />
                                                <span className="font-medium">Eventos</span>
                                            </Link>

                                            {auth.user && (
                                                <Link
                                                    href={route('my-tickets')}
                                                    onClick={handleLinkClick}
                                                    className="flex items-center space-x-3 p-2 rounded-lg text-foreground hover:bg-gray-50 hover:text-primary transition-colors group"
                                                >
                                                    <Ticket className="w-5 h-5 text-primary group-hover:text-primary" />
                                                    <span className="font-medium">Mis Tickets</span>
                                                </Link>
                                            )}

                                            <Link
                                                href={route('help')}
                                                onClick={handleLinkClick}
                                                className="flex items-center space-x-3 p-2 rounded-lg text-foreground hover:bg-gray-50 hover:text-primary transition-colors group"
                                            >
                                                <HelpCircle className="w-5 h-5 text-primary group-hover:text-primary" />
                                                <span className="font-medium">Ayuda</span>
                                            </Link>
                                        </nav>
                                    </div>

                                    {/* Bottom Section */}
                                    <div className="border-t border-gray-100 p-6">
                                        {auth.user ? (
                                            <Button
                                                onClick={handleLogout}
                                                variant="outline"
                                                className="w-full flex items-center justify-center space-x-2 bg-primary text-white hover:bg-primary-hover border-primary h-11"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Cerrar Sesión</span>
                                            </Button>
                                        ) : (
                                            <div className="flex-col flex space-y-3">
                                                <Link href={route('login')} onClick={handleLinkClick}>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full text-foreground border-gray-300 hover:bg-gray-50 "
                                                    >
                                                        Iniciar Sesión
                                                    </Button>
                                                </Link>
                                                <Link href={route('register')} onClick={handleLinkClick}>
                                                    <Button className="w-full bg-primary hover:bg-primary-hover text-white">
                                                        Registrarse
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}