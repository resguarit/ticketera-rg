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
    HelpCircle
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

const footerNavItems: NavItem[] = [
    {
        title: 'Ayuda',
        href: '/help',
        icon: BookOpen,
    },
    {
        title: 'Soporte',
        href: '/support',
        icon: Shield,
    },
];

export function AppSidebar() {
    // Obtener los datos del usuario autenticado
    const page = usePage();
    const auth = (page.props as any).auth as { user: User | null };
    
    // Determinar el rol del usuario (por defecto 'client' si no está autenticado)
    const userRole = auth.user?.role || 'client';
    
    // Obtener elementos de navegación según el rol
    const mainNavItems = getNavItemsByRole(userRole);
    
    // Obtener URL del dashboard según el rol
    const dashboardUrl = getDashboardUrl(userRole);

    // Determinar el título y logo según el rol
    const getLogoProps = () => {
        switch (userRole) {
            case 'admin':
                return {
                    title: 'Panel Admin',
                    logoUrl: undefined // Mantiene el logo de Laravel
                };
            case 'organizer':
                return {
                    title: auth.user?.organizer?.name || 'Organizador',
                    logoUrl: auth.user?.organizer?.image_url
                };
            default:
                return {
                    title: 'Laravel Starter Kit',
                    logoUrl: undefined
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
