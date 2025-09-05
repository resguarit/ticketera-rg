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
import Footer from '@/components/footer';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Faq, FaqCategory as FaqCategoryModel } from '@/types/models';

// Mapa para convertir el nombre del icono (string) en un componente de React
const iconMap: { [key: string]: React.ElementType } = {
    Ticket,
    CreditCard,
    Users,
    Shield,
};

const DynamicIcon = ({ name, ...props }: { name: string | null } & React.ComponentProps<typeof Shield>) => {
    if (!name) return <HelpCircle {...props} />;
    const Icon = iconMap[name] || HelpCircle;
    return <Icon {...props} />;
};

interface FaqCategory extends FaqCategoryModel {
    faqs: Faq[];
}

interface HelpPageProps extends PageProps {
    faqCategories: FaqCategory[];
}

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
    // Obtener las categorías desde las props pasadas por el controlador
    const { faqCategories } = usePage<HelpPageProps>().props;

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
            
            <div className="min-h-screen bg-gradient-to-br from-gray-200 to-secondary">
                {/* Header */}
                <Header />

                <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
                    {/* Page Header */}
                    <div className="text-center mb-2 sm:mb-4 lg:mb-6">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-4">
                            Centro de Ayuda
                        </h1>
                        <p className="text-foreground text-sm sm:text-base lg:text-lg  mx-auto px-4">
                            Encuentra respuestas rápidas a tus preguntas o contacta con nuestro equipo de soporte
                        </p>
                    </div>

                    {/* Search */}
                    <div className="max-w-2xl mx-auto mb-4 sm:mb-6 lg:mb-10">
                        <div className="relative">
                            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <Input
                                placeholder="Buscar en preguntas frecuentes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="py-3 sm:py-4 text-sm sm:text-base lg:text-lg pl-10 sm:pl-12 bg-white border-gray-100 border text-gray-400 placeholder:text-gray-400 shadow-md h-8 sm:h-10"
                            />
                        </div>
                    </div>

                    {/* Contact Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-12">
                        {contactOptions.map((option, index) => (
                            <Card
                                key={index}
                                className="bg-white py-2 text-foreground overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-md sm:shadow-lg"
                            >
                                <CardContent className="p-3 sm:p-6 text-center">
                                    <div
                                        className={`w-10 h-10 sm:w-16 sm:h-16 bg-${option.color} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4`}
                                    >
                                        <option.icon className="w-4 h-4 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1 sm:mb-2">{option.title}</h3>
                                    <p className="text-foreground/80 mb-2 sm:mb-3 text-sm sm:text-base">{option.description}</p>
                                    <Badge className="mb-3 sm:mb-4 bg-gray-100 text-foreground border-0 text-xs sm:text-sm">{option.available}</Badge>
                                    <div>
                                        <Button className={`bg-${option.color} hover:opacity-90 text-white w-full text-sm sm:text-base h-9 sm:h-10`}>
                                            {option.action}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* FAQ Section */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-6">
                                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                                <h2 className="text-xl sm:text-3xl text-foreground font-bold">Preguntas Frecuentes</h2>
                            </div>

                            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                                {filteredFAQs.map((category) => (
                                    <Card key={category.id} className="bg-white shadow-md sm:shadow-lg py-4 lg:py-6 lg:gap-6 gap-2">
                                        <CardHeader className="pb-3 sm:pb-4">
                                            <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-foreground">
                                                <div
                                                    style={{ backgroundColor: category.color || '#64748b' }}
                                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center`}
                                                >
                                                    <DynamicIcon name={category.icon} className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                </div>
                                                <span className="text-lg sm:text-xl">{category.title}</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1 sm:space-y-2">
                                            {category.faqs.map((faq, index) => {
                                                const itemId = `${category.id}-${index}`;
                                                const isOpen = openItems.includes(itemId);

                                                return (
                                                    <Collapsible key={index}>
                                                        <CollapsibleTrigger
                                                            onClick={() => toggleItem(itemId)}
                                                            className="flex items-center justify-between w-full p-3 sm:p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                        >
                                                            <span className="text-foreground font-medium text-sm sm:text-base pr-4">{faq.question}</span>
                                                            {isOpen ? (
                                                                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-foreground flex-shrink-0" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-foreground flex-shrink-0" />
                                                            )}
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                                                            <p className="text-foreground leading-relaxed text-sm sm:text-base">{faq.answer}</p>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                );
                                            })}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {searchTerm && filteredFAQs.length === 0 && (
                                <Card className="bg-white border-gray-200 shadow-md sm:shadow-lg py-4 lg:py-6 lg:gap-6 gap-2">
                                    <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
                                        <Search className="w-12 h-12 sm:w-16 sm:h-16 text-foreground/80 mx-auto mb-3 sm:mb-4" />
                                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No se encontraron resultados</h3>
                                        <p className="text-foreground/60 mb-4 sm:mb-6 text-sm sm:text-base">No encontramos preguntas que coincidan con "{searchTerm}"</p>
                                        <Button
                                            onClick={() => setSearchTerm("")}
                                            className="bg-primary hover:bg-primary-hover text-white text-sm sm:text-base"
                                        >
                                            Ver todas las preguntas
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Contact Form */}
                        <div className="space-y-4 sm:space-y-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground">¿No encontraste lo que buscas?</h2>
                            <Card className="bg-white shadow-md sm:shadow-lg py-4 lg:py-6 lg:gap-6 gap-2">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="text-foreground text-lg sm:text-xl">Contáctanos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleContactSubmit} className="space-y-3 sm:space-y-4">
                                        <div>
                                            <Input
                                                placeholder="Tu nombre"
                                                value={contactForm.name}
                                                onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))
                                                }
                                                className="bg-white border-gray-200 shadow-sm border text-foreground placeholder:text-foreground/60 h-9 sm:h-10 text-sm sm:text-base"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="email"
                                                placeholder="Tu email"
                                                value={contactForm.email}
                                                onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))
                                                }
                                                className="bg-white border-gray-200 shadow-sm border text-foreground placeholder:text-foreground/60 h-9 sm:h-10 text-sm sm:text-base"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                placeholder="Asunto"
                                                value={contactForm.subject}
                                                onChange={(e) => setContactForm((prev) => ({ ...prev, subject: e.target.value }))
                                                }
                                                className="bg-white border-gray-200 shadow-sm border text-foreground placeholder:text-foreground/60 h-9 sm:h-10 text-sm sm:text-base"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Textarea
                                                placeholder="Describe tu consulta..."
                                                value={contactForm.message}
                                                onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))
                                                }
                                                className="bg-white border-gray-200 shadow-sm border text-foreground placeholder:text-foreground/60 min-h-[100px] sm:min-h-[120px] text-sm sm:text-base resize-none"
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full bg-primary hover:bg-primary-hover text-white h-9 sm:h-10 text-sm sm:text-base"
                                        >
                                            Enviar Mensaje
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Quick Links */}
                            <Card className="bg-white shadow-md sm:shadow-lg py-4 lg:py-6 lg:gap-6 gap-2">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="text-foreground text-lg sm:text-xl">Enlaces Útiles</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 sm:space-y-3">
                                    <Link href="/terms" className="block text-foreground/80 hover:text-primary transition-colors text-sm sm:text-base py-1">
                                        Términos y Condiciones
                                    </Link>
                                    <Link href="/privacy" className="block text-foreground/80 hover:text-primary transition-colors text-sm sm:text-base py-1">
                                        Política de Privacidad
                                    </Link>
                                    <Link href="/refunds" className="block text-foreground/80 hover:text-primary transition-colors text-sm sm:text-base py-1">
                                        Política de Reembolsos
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Add Footer */}
            <Footer />
        </>
    );
}