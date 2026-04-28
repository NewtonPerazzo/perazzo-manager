"use client";

import { Button } from "@/components/atoms/button";
import { Modal } from "@/components/atoms/modal";
import { useI18n } from "@/i18n/provider";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false
}: ConfirmDeleteModalProps) {
  const { t } = useI18n();

  return (
    <Modal open={open} onClose={onClose} title={title ?? t("common.confirmDeleteTitle")}>
      <p className="mb-4 text-sm text-slate-300">{description ?? t("common.confirmDeleteDescription")}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          {t("common.cancel")}
        </Button>
        <Button variant="danger" onClick={() => void onConfirm()} isLoading={isLoading}>
          {t("common.confirmDelete")}
        </Button>
      </div>
    </Modal>
  );
}
