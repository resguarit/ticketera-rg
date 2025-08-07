import React, { useState } from 'react';
import {
    Search,
    MessageCircle,
    Phone,
    Mail,
    ChevronDown,
    ChevronRight,
    HelpCircle,
    BookOpen,
    Shield,
    CreditCard,
    Ticket,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/header';
import { Head, Link } from '@inertiajs/react';

const faqCategories = [
    {
        id: "tickets",
        title: "Compra de Tickets",
        icon: Ticket,
        color: "primary",
        faqs: [
            {
                question: "¿Cómo puedo comprar tickets?",
                answer:
                    "Puedes comprar tickets navegando por nuestros eventos, seleccionando el que te interese y siguiendo el proceso de compra. Aceptamos tarjetas de crédito, débito y transferencias bancarias.",
            },
            {
                question: "¿Puedo cancelar mi compra?",
                answer:
                    "Sí, puedes cancelar tu compra hasta 24 horas antes del evento. El reembolso se procesará en 5-7 días hábiles a tu método de pago original.",
            },
            {
                question: "¿Los precios incluyen impuestos?",
                answer: "Sí, todos los precios mostrados incluyen impuestos y tasas de servicio. No hay costos ocultos.",
            },
            {
                question: "¿Hay límite de tickets por persona?",
                answer:
                    "Sí, generalmente hay un límite de 10 tickets por persona por evento para garantizar disponibilidad para todos.",
            },
        ],
    },
    {
        id: "payment",
        title: "Pagos y Facturación",
        icon: CreditCard,
        color: "red-500",
        faqs: [
            {
                question: "¿Qué métodos de pago aceptan?",
                answer:
                    "Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express), transferencias bancarias y billeteras digitales como MercadoPago.",
            },
            {
                question: "¿Es seguro pagar en línea?",
                answer:
                    "Absolutamente. Utilizamos encriptación SSL de 256 bits y cumplimos con los estándares PCI DSS para proteger tu información financiera.",
            },
            {
                question: "¿Puedo obtener una factura?",
                answer:
                    "Sí, recibirás automáticamente una factura por email después de completar tu compra. También puedes descargarla desde tu cuenta.",
            },
        ],
    },
    {
        id: "events",
        title: "Eventos",
        icon: Users,
        color: "orange-500",
        faqs: [
            {
                question: "¿Qué pasa si se cancela un evento?",
                answer:
                    "Si un evento se cancela, recibirás un reembolso completo automáticamente. Te notificaremos por email y SMS sobre la cancelación.",
            },
            {
                question: "¿Puedo transferir mis tickets a otra persona?",
                answer:
                    "Sí, puedes transferir tus tickets a través de tu cuenta. La persona que recibe debe tener una cuenta en TicketMax.",
            },
            {
                question: "¿Qué pasa si llego tarde al evento?",
                answer:
                    "Esto depende de la política del organizador del evento. Algunos eventos permiten entrada tardía, otros no. Revisa los detalles del evento.",
            },
        ],
    },
    {
        id: "account",
        title: "Cuenta y Perfil",
        icon: Shield,
        color: "green-500",
        faqs: [
            {
                question: "¿Cómo creo una cuenta?",
                answer:
                    "Puedes crear una cuenta haciendo clic en 'Iniciar Sesión' y luego en 'Crear cuenta'. Solo necesitas tu email y una contraseña segura.",
            },
            {
                question: "¿Olvidé mi contraseña, qué hago?",
                answer:
                    "Haz clic en '¿Olvidaste tu contraseña?' en la página de inicio de sesión. Te enviaremos un enlace para restablecerla.",
            },
            {
                question: "¿Puedo cambiar mi información personal?",
                answer:
                    "Sí, puedes actualizar tu información personal en cualquier momento desde la configuración de tu cuenta.",
            },
        ],
    },
];

const contactOptions = [
    {
        title: "Chat en Vivo",
        description: "Habla con nuestro equipo de soporte",
        icon: MessageCircle,
        color: "primary",
        available: "24/7",
        action: "Iniciar Chat",
    },
    {
        title: "Teléfono",
        description: "Llámanos para soporte inmediato",
        icon: Phone,
        color: "green-500",
        available: "Lun-Vie 9:00-18:00",
        action: "+54 11 1234-5678",
    },
    {
        title: "Email",
        description: "Envíanos un mensaje detallado",
        icon: Mail,
        color: "red-500",
        available: "Respuesta en 24hs",
        action: "soporte@ticketmax.com",
    },
];

export default function Help() {
    const [searchTerm, setSearchTerm] = useState("");
    const [openItems, setOpenItems] = useState<string[]>([]);
    const [contactForm, setContactForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const toggleItem = (itemId: string) => {
        setOpenItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]));
    };

    const filteredFAQs = faqCategories
        .map((category) => ({
            ...category,
            faqs: category.faqs.filter(
                (faq) =>
                    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        }))
        .filter((category) => category.faqs.length > 0);

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log("Contact form submitted:", contactForm);
        // Reset form
        setContactForm({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <>
            <Head title="Centro de Ayuda - TicketMax" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200  to-secondary">
                {/* Header */}
                <Header />

                <div className="container mx-auto px-4 py-6">
                    {/* Page Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-5xl font-bold text-foreground mb-4">
                            Centro de Ayuda
                        </h2>
                        <p className="text-foreground text-lg max-w-2xl mx-auto">
                            Encuentra respuestas rápidas a tus preguntas o contacta con nuestro equipo de soporte
                        </p>
                    </div>

                    {/* Search */}
                    <div className="max-w-2xl mx-auto mb-12">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Buscar en preguntas frecuentes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className=" py-4 text-lg pl-10 bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md"
                            />
                        </div>
                    </div>

                    {/* Contact Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {contactOptions.map((option, index) => (
                            <Card
                                key={index}
                                className="bg-white text-foreground overflow-hidden hover:transform hover:scale-105 transition-all duration-300"
                            >
                                <CardContent className="p-6 text-center">
                                    <div
                                        className={`w-16 h-16 bg-gradient-to-r bg-${option.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                                    >
                                        <option.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">{option.title}</h3>
                                    <p className="text-foreground/80 mb-3">{option.description}</p>
                                    <Badge className="mb-4 bg-white/20 text-foreground border-0">{option.available}</Badge>
                                    <div>
                                        <Button className={`bg-gradient-to-r bg-${option.color} hover:opacity-90 text-white w-full`}>
                                            {option.action}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* FAQ Section */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center space-x-3 mb-6">
                                <BookOpen className="w-6 h-6 text-primary" />
                                <h2 className="text-3xl text-foreground">Preguntas Frecuentes</h2>
                            </div>

                            <div className="space-y-6">
                                {filteredFAQs.map((category) => (
                                    <Card key={category.id} className="bg-white">
                                        <CardHeader>
                                            <CardTitle className="flex items-center space-x-3 text-foreground">
                                                <div
                                                    className={`w-10 h-10 bg-gradient-to-r bg-${category.color} rounded-lg flex items-center justify-center`}
                                                >
                                                    <category.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <span>{category.title}</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {category.faqs.map((faq, index) => {
                                                const itemId = `${category.id}-${index}`;
                                                const isOpen = openItems.includes(itemId);

                                                return (
                                                    <Collapsible key={index}>
                                                        <CollapsibleTrigger
                                                            onClick={() => toggleItem(itemId)}
                                                            className="flex items-center justify-between w-full p-4 text-left bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                                        >
                                                            <span className="text-foreground font-medium">{faq.question}</span>
                                                            {isOpen ? (
                                                                <ChevronDown className="w-5 h-5 text-foreground" />
                                                            ) : (
                                                                <ChevronRight className="w-5 h-5 text-foreground" />
                                                            )}
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent className="px-4 pb-4">
                                                            <p className="text-foreground leading-relaxed">{faq.answer}</p>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                );
                                            })}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {searchTerm && filteredFAQs.length === 0 && (
                                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                    <CardContent className="p-12 text-center">
                                        <Search className="w-16 h-16 text-foreground/80 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-foreground mb-2">No se encontraron resultados</h3>
                                        <p className="text-foreground/60 mb-6">No encontramos preguntas que coincidan con "{searchTerm}"</p>
                                        <Button
                                            onClick={() => setSearchTerm("")}
                                            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                                        >
                                            Ver todas las preguntas
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Contact Form */}
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-8">¿No encontraste lo que buscas?</h2>
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle className="text-foreground">Contáctanos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleContactSubmit} className="space-y-4">
                                        <div>
                                            <Input
                                                placeholder="Tu nombre"
                                                value={contactForm.name}
                                                onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                                                className="bg-white border-gray-200 shadow-md border text-foreground placeholder:text-foreground/60"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="email"
                                                placeholder="Tu email"
                                                value={contactForm.email}
                                                onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                                                className="bg-white border-gray-200 shadow-md border text-foreground placeholder:text-foreground/60"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                placeholder="Asunto"
                                                value={contactForm.subject}
                                                onChange={(e) => setContactForm((prev) => ({ ...prev, subject: e.target.value }))}
                                                className="bg-white border-gray-200 shadow-md border text-foreground placeholder:text-foreground/60"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Textarea
                                                placeholder="Describe tu consulta..."
                                                value={contactForm.message}
                                                onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                                                className="bg-white border-gray-200 shadow-md border text-foreground placeholder:text-foreground/60 min-h-[120px]"
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full bg-primary hover:bg-primary-hover text-white"
                                        >
                                            Enviar Mensaje
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Quick Links */}
                            <Card className="bg-white mt-6">
                                <CardHeader>
                                    <CardTitle className="text-foreground">Enlaces Útiles</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Link href="/terms" className="block text-foreground/80 hover:text-primary transition-colors">
                                        Términos y Condiciones
                                    </Link>
                                    <Link href="/privacy" className="block text-foreground/80 hover:text-primary transition-colors">
                                        Política de Privacidad
                                    </Link>
                                    <Link href="/refunds" className="block text-foreground/80 hover:text-primary transition-colors">
                                        Política de Reembolsos
                                    </Link>
                                    <Link href="/accessibility" className="block text-foreground/80 hover:text-primary transition-colors">
                                        Accesibilidad
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}