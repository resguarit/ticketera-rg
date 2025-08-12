import { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface Props { onConfirm(): void; trigger?: ReactNode }

export function RemoveUserDialog({ onConfirm, trigger }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || <Button size="sm" variant="outline" className="border-border">Quitar</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-popover border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-popover-foreground">¿Quitar usuario?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">Esto lo desvinculará del organizador y volverá a tener rol de cliente.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Quitar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default RemoveUserDialog;
