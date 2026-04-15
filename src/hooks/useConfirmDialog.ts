import { useState, useCallback } from 'react';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isDangerous: boolean;
  isLoading: boolean;
  onConfirmCallback?: () => void | Promise<void>;
}

export const useConfirmDialog = () => {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDangerous: false,
    isLoading: false,
  });

  const openConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmText?: string;
      cancelText?: string;
      isDangerous?: boolean;
    }
  ) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      isDangerous: options?.isDangerous || false,
      isLoading: false,
      onConfirmCallback: onConfirm,
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(async () => {
    setConfirmState(prev => ({ ...prev, isLoading: true }));
    try {
      if (confirmState.onConfirmCallback) {
        await confirmState.onConfirmCallback();
      }
    } finally {
      closeConfirm();
    }
  }, [confirmState, closeConfirm]);

  return {
    confirmState: {
      isOpen: confirmState.isOpen,
      title: confirmState.title,
      message: confirmState.message,
      confirmText: confirmState.confirmText,
      cancelText: confirmState.cancelText,
      isDangerous: confirmState.isDangerous,
      isLoading: confirmState.isLoading,
    },
    openConfirm,
    closeConfirm,
    handleConfirm,
  };
};
