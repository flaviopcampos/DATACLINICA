'use client';

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
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  children: ReactNode;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
  disabled?: boolean;
}

export function ConfirmDialog({
  children,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'default',
  isLoading = false,
  disabled = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Erro ao executar ação:', error);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={disabled}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Componente específico para confirmação de logout
interface LogoutConfirmDialogProps {
  children: ReactNode;
  onConfirm: () => void | Promise<void>;
}

export function LogoutConfirmDialog({ children, onConfirm }: LogoutConfirmDialogProps) {
  return (
    <ConfirmDialog
      title="Confirmar Logout"
      description="Tem certeza que deseja sair do sistema?"
      confirmText="Sair"
      cancelText="Cancelar"
      onConfirm={onConfirm}
      variant="destructive"
    >
      {children}
    </ConfirmDialog>
  );
}

export default ConfirmDialog;