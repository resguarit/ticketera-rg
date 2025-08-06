import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
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
    UserCheck
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
                    title: 'Mis Eventos',
                    href: '/organizer/events',
                    icon: Calendar,
                },
                {
                    title: 'Crear Evento',
                    href: '/organizer/events/create',
                    icon: Ticket,
                },
                {
                    title: 'Ventas',
                    href: '/organizer/sales',
                    icon: BarChart3,
                },
                {
                    title: 'Mi Perfil',
                    href: '/organizer/profile',
                    icon: UserCheck,
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
    const { auth } = usePage<{ auth: { user: { role: string } | null } }>().props;
    
    // Determinar el rol del usuario (por defecto 'client' si no está autenticado)
    const userRole = auth.user?.role || 'client';
    
    // Obtener elementos de navegación según el rol
    const mainNavItems = getNavItemsByRole(userRole);
    
    // Obtener URL del dashboard según el rol
    const dashboardUrl = getDashboardUrl(userRole);

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
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
