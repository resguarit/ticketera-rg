import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Calendar,
    Users,
    Settings,
    BarChart3,
    Shield,
    Building,
    Ticket,
    UserCheck,
    Tag,
    Building2,
    HelpCircle,
    HandCoins,
    Image
} from 'lucide-react';
import AppLogo from './app-logo';

// Función para obtener los elementos de navegación según el rol
const getNavItemsByRole = (userRole: string): NavItem[] => {
    switch (userRole) {
        case 'admin':
            return [
                {
                    title: 'Panel Admin',
                    href: '/admin/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'Gestión de Eventos',
                    href: '/admin/events',
                    icon: Calendar,
                },
                {
                    title: 'Usuarios',
                    href: '/admin/users',
                    icon: Users,
                },
                {
                    title: 'Banners',
                    href: '/admin/banners',
                    icon: Image,
                },
                {
                    title: 'Organizadores',
                    href: '/admin/organizers',
                    icon: Building,
                },
                {
                    title: 'Categorías',
                    href: '/admin/categories',
                    icon: Tag,
                },
                {
                    title: 'Recintos',
                    href: '/admin/venues',
                    icon: Building2,
                },
                {
                    title: 'FAQs',
                    href: '/admin/faqs',
                    icon: HelpCircle,
                },
                {
                    title: 'Cuotas',
                    href: '/admin/cuotas',
                    icon: HandCoins,
                },
                {
                    title: 'Reportes',
                    href: '/admin/reports',
                    icon: BarChart3,
                },
                {
                    title: 'Configuración',
                    href: '/admin/settings',
                    icon: Settings,
                }
            ];

        case 'organizer':
            return [
                {
                    title: 'Mi Dashboard',
                    href: '/organizer/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'Eventos',
                    href: '/organizer/events',
                    icon: Calendar,
                },
                {
                    title: 'Usuarios',
                    href: '/organizer/users',
                    icon: Users,
                }
            ];

        default: // client o usuario normal
            return [
                {
                    title: 'Inicio',
                    href: '/',
                    icon: LayoutGrid,
                },
                {
                    title: 'Eventos',
                    href: '/events',
                    icon: Calendar,
                },
                {
                    title: 'Mis Tickets',
                    href: '/my-tickets',
                    icon: Ticket,
                },
                {
                    title: 'Mi Cuenta',
                    href: '/my-account',
                    icon: UserCheck,
                }
            ];
    }
};

// Función para obtener la URL del dashboard según el rol
const getDashboardUrl = (userRole: string): string => {
    switch (userRole) {
        case 'admin':
            return '/admin/dashboard';
        case 'organizer':
            return '/organizer/dashboard';
        default:
            return '/';
    }
};

// Función para obtener los elementos de navegación del footer según el rol
const getFooterNavItemsByRole = (userRole: string): NavItem[] => {
    switch (userRole) {
        case 'organizer':
            return [
                {
                    title: 'Guía de Ayuda',
                    href: '/organizer/help-guide',
                    icon: BookOpen,
                },
            ];

        default: // admin, client o usuario normal
            return [
                {
                    title: 'Ayuda',
                    href: '/help',
                    icon: BookOpen,
                },
            ];
    }
};

export function AppSidebar() {
    // Obtener los datos del usuario autenticado
    const page = usePage();
    const auth = (page.props as any).auth as {
        user: User | null;
        is_impersonating: boolean;
    };

    // Determinar el rol del usuario (por defecto 'client' si no está autenticado)
    const actualRole = auth.user?.role || 'client';
    const userRole = (actualRole == 'admin' && auth.is_impersonating)
        ? 'organizer'
        : actualRole;

    // Obtener elementos de navegación según el rol
    const mainNavItems = getNavItemsByRole(userRole);

    // Obtener elementos de navegación del footer según el rol
    const footerNavItems = getFooterNavItemsByRole(userRole);

    // Obtener URL del dashboard según el rol
    const dashboardUrl = getDashboardUrl(userRole);

    // Determinar el título y logo según el rol
    const getLogoProps = () => {
        switch (userRole) {
            case 'admin':
                return {
                    title: 'Panel Admin',
                    logoUrl: '/images/logo_sin_texto.png'
                };
            case 'organizer':
                return {
                    title: auth.user?.organizer?.name || 'Organizador',
                    logoUrl: auth.user?.organizer?.image_url
                };
            default:
                return {
                    title: 'RG Entradas',
                    logoUrl: '/images/logo_sin_texto.png'
                };
        }
    };

    const logoProps = getLogoProps();

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild tooltip={{ children: logoProps.title }}>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo {...logoProps} />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
