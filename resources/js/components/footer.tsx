import { Link } from '@inertiajs/react';
import {MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Calendar, Ticket, HelpCircle, Shield, FileText, House} from 'lucide-react';
import logoResguarit from '../../../public/favicon.ico'

interface FooterProps {
    className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`bg-dark text-white ${className}`}>
            {/* Main Footer Content */}
            <div className="px-6 sm:px-16 py-8 sm:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold mb-3">
                                RG <span className="font-medium">ENTRADAS</span>
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Tu plataforma de confianza para los mejores eventos de música, teatro, deportes y entretenimiento en Argentina.
                            </p>
                        </div>
                        
                        {/* Contact Info */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-gray-300">
                                <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
                                <span className="text-sm">La Plata, Buenos Aires</span>
                            </div>
                            <div className="flex items-center hover:text-secondary space-x-2 text-gray-300">
                                <Phone className="w-4 h-4 text-secondary flex-shrink-0" />
                                <a href="tel:+542216914649"><span className="text-sm">+54 2966 123456</span></a>
                            </div>
                            <div className="flex items-center hover:text-secondary space-x-2 text-gray-300">
                                <Mail className="w-4 h-4 text-secondary flex-shrink-0" />
                                <a href="mailto:info@rg-entradas.com"><span className="text-sm">info@rg-entradas.com</span></a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Enlaces Rápidos</h4>
                        <nav className="space-y-2">
                            <Link 
                                href={route('home')} 
                                className="flex items-center space-x-2 text-gray-300 hover:text-secondary transition-colors text-sm"
                            >
                                <House className="w-4 h-4" />
                                <span>Inicio</span>
                            </Link>
                            <Link 
                                href={route('events')} 
                                className="flex items-center space-x-2 text-gray-300 hover:text-secondary transition-colors text-sm"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>Eventos</span>
                            </Link>
                            <Link 
                                href={route('help')} 
                                className="flex items-center space-x-2 text-gray-300 hover:text-secondary transition-colors text-sm"
                            >
                                <HelpCircle className="w-4 h-4" />
                                <span>Centro de Ayuda</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Legal & Support */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Legal y Soporte</h4>
                        <nav className="space-y-2">
                            <Link 
                                href={route('terms')}
                                className="flex items-center space-x-2 text-gray-300 hover:text-secondary transition-colors text-sm"
                            >
                                <FileText className="w-4 h-4" />
                                <span>Términos y Condiciones</span>
                            </Link>
                            <Link 
                                href={route('privacy')}
                                className="flex items-center space-x-2 text-gray-300 hover:text-secondary transition-colors text-sm"
                            >
                                <Shield className="w-4 h-4" />
                                <span>Política de Privacidad</span>
                            </Link>
                            <Link 
                                href={route('refunds')}
                                className="flex items-center space-x-2 text-gray-300 hover:text-secondary transition-colors text-sm"
                            >
                                <FileText className="w-4 h-4" />
                                <span>Botón de Arrepentimiento</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Social Media & Newsletter */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Síguenos</h4>
                        
                        {/* Social Links */}
                        <div className="flex space-x-3">
                            <a 
                                href="https://www.facebook.com/share/17N6jjxJvY/?mibextid=wwXIfr" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-gray-700 hover:bg-primary hover:scale-110 rounded-full flex items-center justify-center transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a 
                                href="https://www.instagram.com/rgentradas.com.ar/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-gray-700 hover:bg-primary hover:scale-110 rounded-full flex items-center justify-center transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a 
                                href="https://www.youtube.com/@RGEntradas" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-gray-700 hover:bg-primary hover:scale-110  rounded-full flex items-center justify-center transition-colors"
                                aria-label="YouTube"
                            >
                                <Youtube className="w-4 h-4" />
                            </a>
                        </div>

                        {/* Newsletter */}
                        <div className="space-y-2">
                            <p className="text-gray-300 text-sm">
                                Seguinos en nuestras redes para enterarte las últimas noticias sobre eventos
                            </p>

                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700">
                <div className="px-16 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                        <div className="text-gray-400 text-sm text-center sm:text-left">
                            © {currentYear} RG ENTRADAS. Todos los derechos reservados.
                        </div>
                        <a href="https://resguarit.com.ar/" target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center text-gray-400 text-sm gap-2">
                            <img src={logoResguarit} width={20} height={20} />
                            <span className='hover:underline'>Desarrollado por Resguar IT</span>
                        </div>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}