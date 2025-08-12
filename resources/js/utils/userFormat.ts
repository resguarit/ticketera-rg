import { UserItem } from '@/types/organizer';

export const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

export const getUserFullName = (user: UserItem) => `${user.person.name} ${user.person.last_name}`;

export const getRoleText = (role: string) => ({ admin: 'Administrador', organizer: 'Organizador', user: 'Usuario' } as Record<string, string>)[role] || role;
