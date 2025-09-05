import { Link } from '@inertiajs/react';
import { 
    MapPin, 
    Phone, 
    Mail, 
    Facebook, 
    Twitter, 
    Instagram, 
    Youtube,
    Calendar,
    Ticket,
    HelpCircle,
    Shield,
    FileText
} from 'lucide-react';

interface FooterProps {
    className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`bg-gradient-to-br from-gray-900 to-gray-800 text-white ${className}`}>
            {/* Main Footer Content */}
            <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold mb-3">
                                Ticketera-RG
                            </h3>
                            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                Tu plataforma de confianza para los mejores eventos de música, teatro, deportes y entretenimiento en Argentina.
                            </p>
                        </div>
                        
                        {/* Contact Info */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-gray-300">
                                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-sm">Río Gallegos, Santa Cruz</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-300">
                                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-sm">+54 2966 123456</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-300">
                                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-sm">info@ticketera-rg.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Enlaces Rápidos</h4>
                        <nav className="space-y-2">
                            <Link 
                                href={route('home')} 
                                className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors text-sm"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>Inicio</span>
                            </Link>
                            <Link 
                                href={route('events')} 
                                className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors text-sm"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>Eventos</span>
                            </Link>
                            <Link 
                                href={route('help')} 
                                className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors text-sm"
                            >
                                <HelpCircle className="w-4 h-4" />
                                <span>Centro de Ayuda</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Legal & Support */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Legal y Soporte</h4>
                        <nav className="space-y-2">
                            <Link 
                                href="/terms" 
                                className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors text-sm"
                            >
                                <FileText className="w-4 h-4" />
                                <span>Términos y Condiciones</span>
                            </Link>
                            <Link 
                                href="/privacy" 
                                className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors text-sm"
                            >
                                <Shield className="w-4 h-4" />
                                <span>Política de Privacidad</span>
                            </Link>
                            <Link 
                                href="/refunds" 
                                className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors text-sm"
                            >
                                <FileText className="w-4 h-4" />
                                <span>Botón de Arrepentimiento</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Social Media & Newsletter */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Síguenos</h4>
                        
                        {/* Social Links */}
                        <div className="flex space-x-3">
                            <a 
                                href="https://facebook.com/ticketera-rg" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a 
                                href="https://twitter.com/ticketera-rg" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a 
                                href="https://instagram.com/ticketera-rg" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a 
                                href="https://youtube.com/ticketera-rg" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                                aria-label="YouTube"
                            >
                                <Youtube className="w-4 h-4" />
                            </a>
                        </div>

                        {/* Newsletter */}
                        <div className="space-y-2">
                            <p className="text-gray-300 text-sm">
                                Suscríbete para recibir las últimas noticias sobre eventos
                            </p>
                            <div className="flex space-x-2">
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors">
                                    Suscribir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700">
                <div className="container mx-auto px-3 sm:px-4 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                        <div className="text-gray-400 text-sm text-center sm:text-left">
                            © {currentYear} Ticketera-RG. Todos los derechos reservados.
                        </div>
                        
                        <div className="flex items-center space-x-4 text-gray-400 text-sm">
                            <span>Hecho con ❤️ en Santa Cruz</span>
                            <div className="flex items-center space-x-1">
                                <span>Powered by</span>
                                <span className="text-primary font-medium">Laravel + React</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}