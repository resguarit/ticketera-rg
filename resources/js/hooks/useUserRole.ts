import { usePage } from '@inertiajs/react';

interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
    organizer_id: number | null;
    person: any;
    organizer: any;
}

interface AuthProps {
    auth: {
        user: AuthUser | null;
        is_viewer: boolean;
        is_organizer: boolean;
        is_admin: boolean;
        is_impersonating: boolean;
    };
}

export function useUserRole() {
    const { auth } = usePage<AuthProps>().props;
    
    return {
        user: auth.user,
        isViewer: auth.is_viewer || false,
        isOrganizer: auth.is_organizer || false,
        isAdmin: auth.is_admin || false,
        isImpersonating: auth.is_impersonating || false,
        role: auth.user?.role,
        canEdit: !auth.is_viewer, // Shortcut para saber si puede editar
    };
}