import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { CredentialsFlash } from '@/types/organizer';

interface FlashProps { success?: string; error?: string }

export function useFlashToasts(flash?: FlashProps, credentials?: CredentialsFlash | null, createdCredentials?: CredentialsFlash | null) {
  const lastShownRef = useRef<{ success?: string; error?: string }>({});

  useEffect(() => {
    if (flash?.success && !createdCredentials) {
      const credsObj: any = credentials;
      const hasCreds = credsObj && typeof credsObj.email === 'string' && typeof credsObj.password === 'string';
      if (flash.success !== lastShownRef.current.success) {
        if (hasCreds) {
          toast.success(flash.success, { description: `Email: ${credsObj.email} | Contraseña: ${credsObj.password}` });
        } else {
          toast.success(flash.success);
        }
        lastShownRef.current.success = flash.success;
      }
    }
    if (flash?.error && flash.error !== lastShownRef.current.error) {
      toast.error(flash.error);
      lastShownRef.current.error = flash.error;
    }
  }, [flash?.success, flash?.error, credentials, createdCredentials]);

  return { lastShownRef };
}
