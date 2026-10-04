"use client";

import type { ReactNode } from "react";
import { 
  Modal as NextUIModal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button
} from "@nextui-org/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  return (
    <NextUIModal 
      isOpen={isOpen} 
      onOpenChange={(open) => !open && onClose()}
      backdrop="blur"
      scrollBehavior="inside"
      placement="top-center"
      classNames={{
        base: "bg-white",
        header: "border-b border-zinc-100 font-brand text-xl text-primary-900",
        footer: "border-t border-zinc-100",
        closeButton: "hover:bg-zinc-100 active:bg-zinc-200",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody className="py-6">
              {children}
            </ModalBody>
            {footer && (
              <ModalFooter>
                {footer}
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </NextUIModal>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "تأكيد",
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button color="default" variant="light" onPress={onClose} isDisabled={loading}>
            إلغاء
          </Button>
          <Button color="danger" onPress={onConfirm} isLoading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-zinc-600 text-sm">{message}</p>
    </Modal>
  );
}
