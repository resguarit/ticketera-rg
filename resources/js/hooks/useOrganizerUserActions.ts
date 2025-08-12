import { useState } from 'react';
import { router } from '@inertiajs/react';
import { CredentialsFlash } from '@/types/organizer';
import { toast } from 'sonner';

interface AddNewUserPayload {
  email: string;
  person: { name: string; last_name: string; dni?: string | null; phone?: string | null; address?: string | null };
}

export function useOrganizerUserActions(organizerId: number) {
  const [adding, setAdding] = useState(false);
  const [removingIds, setRemovingIds] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdCredentials, setCreatedCredentials] = useState<CredentialsFlash | null>(null);

  const addUserExisting = (userId: number, onSuccess?: () => void) => {
    setAdding(true);
    setErrors({});
    setCreatedCredentials(null);
    router.post(route('admin.organizers.add-user', organizerId), { mode: 'existing', user_id: userId }, {
      preserveScroll: true,
      onSuccess: (page) => {
        setAdding(false);
        // @ts-ignore
        const flashSuccess = page.props.flash?.success;
        // Cierre modal se maneja arriba; solo reseteamos estado
        if (flashSuccess) onSuccess && onSuccess();
      },
      onError: (errs: any) => {
        setAdding(false);
        setErrors(errs);
        toast.error('Corrige los errores del formulario');
      }
    });
  };

  const addUserNew = (payload: AddNewUserPayload, onSuccess?: () => void) => {
    setAdding(true);
    setErrors({});
    setCreatedCredentials(null);
    router.post(route('admin.organizers.add-user', organizerId), { mode: 'new', ...payload }, {
      preserveScroll: true,
      onSuccess: (page) => {
        setAdding(false);
        // @ts-ignore
        const creds = page.props.credentials as any;
        if (creds && typeof creds.email === 'string' && typeof creds.password === 'string') {
          setCreatedCredentials({ email: creds.email, password: creds.password });
        } else {
          onSuccess && onSuccess();
        }
      },
      onError: (errs: any) => {
        setAdding(false);
        setErrors(errs);
        toast.error('Corrige los errores del formulario');
      }
    });
  };

  const removeUser = (userId: number, onSuccess?: (flashMsg?: string) => void) => {
    setRemovingIds(prev => ({ ...prev, [userId]: true }));
    router.delete(route('admin.organizers.remove-user', { organizerId, userId }), {
      preserveScroll: true,
      onSuccess: (page: any) => {
        setRemovingIds(prev => ({ ...prev, [userId]: false }));
        // @ts-ignore
        const flashMsg = page.props.flash?.success;
        onSuccess && onSuccess(flashMsg); // no toast aquí para evitar duplicado
      },
      onError: () => {
        setRemovingIds(prev => ({ ...prev, [userId]: false }));
        toast.error('Error al remover el usuario');
      }
    });
  };

  const resetCreatedCredentials = () => setCreatedCredentials(null);

  return { addUserExisting, addUserNew, removeUser, adding, removingIds, errors, createdCredentials, resetCreatedCredentials, setErrors };
}
