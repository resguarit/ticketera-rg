import { useState } from 'react';
import { router } from '@inertiajs/react';
import { LoaderCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InputError from '@/components/input-error';

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    showDisclaimer?: boolean;
    required?: boolean;
}

export default function ChangePasswordDialog({ 
    open, 
    onOpenChange,
    showDisclaimer = false,
    required = false
}: ChangePasswordDialogProps) {
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validación local
        if (formData.newPassword !== formData.confirmPassword) {
            setErrors({ confirmPassword: 'Las contraseñas no coinciden' });
            return;
        }

        if (formData.newPassword.length < 8) {
            setErrors({ newPassword: 'La contraseña debe tener al menos 8 caracteres' });
            return;
        }

        setProcessing(true);

        try {
            router.put(
                route('password.updateFromModal'),
                {
                    password: formData.newPassword,
                    password_confirmation: formData.confirmPassword,
                },
                {
                    onSuccess: () => {
                        setFormData({
                            newPassword: '',
                            confirmPassword: '',
                        });
                        setProcessing(false);
                        onOpenChange(false);
                        
                    },
                    onError: (responseErrors) => {
                        setProcessing(false);
                        setErrors(responseErrors as Record<string, string>);
                    },
                }
            );
        } catch (error) {
            setProcessing(false);
            console.error('Error:', error);
            setErrors({ general: 'Error al actualizar la contraseña' });
        }
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpiar error del campo cuando el usuario empieza a escribir
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={required ? undefined : onOpenChange}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => required && e.preventDefault()} onEscapeKeyDown={(e) => required && e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Cambiar Contraseña</DialogTitle>
                    <DialogDescription>
                        Ingresa tu nueva contraseña a continuación
                    </DialogDescription>
                </DialogHeader>

                {showDisclaimer && (
                    <Alert className="bg-amber-50 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                            Tu contraseña fue generada automáticamente. Para continuar usando tu cuenta,
                            deberás cambiarla por una de tu preferencia.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <div className="grid gap-2">
                        <Label htmlFor="new_password">Nueva Contraseña</Label>
                        <Input
                            id="new_password"
                            type="password"
                            required
                            value={formData.newPassword}
                            onChange={(e) => handleChange('newPassword', e.target.value)}
                            disabled={processing}
                            placeholder="Nueva contraseña"
                        />
                        <InputError message={errors.password || errors.newPassword} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="confirm_password">Confirmar Nueva Contraseña</Label>
                        <Input
                            id="confirm_password"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            disabled={processing}
                            placeholder="Confirmar nueva contraseña"
                        />
                        <InputError message={errors.password_confirmation || errors.confirmPassword} />
                    </div>

                    {errors.general && (
                        <InputError message={errors.general} />
                    )}

                    <div className="flex gap-3 mt-2">
                        {!required && (
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => onOpenChange(false)}
                                disabled={processing}
                            >
                                Cancelar
                            </Button>
                        )}
                        <Button
                            type="submit"
                            className={required ? "w-full" : "flex-1"}
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Cambiar Contraseña
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}