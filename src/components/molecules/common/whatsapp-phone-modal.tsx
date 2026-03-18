"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/atoms/button";
import { Modal } from "@/components/atoms/modal";
import { PhoneWhatsappInput } from "@/components/atoms/phone-whatsapp-input";
import { useI18n } from "@/i18n/provider";

interface WhatsappPhoneModalProps {
  open: boolean;
  title: string;
  description: string;
  initialValue?: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: (phone: string) => Promise<void> | void;
}

export function WhatsappPhoneModal({
  open,
  title,
  description,
  initialValue = "",
  isLoading = false,
  onCancel,
  onConfirm
}: WhatsappPhoneModalProps) {
  const { t } = useI18n();
  const [phone, setPhone] = useState(initialValue);

  useEffect(() => {
    if (!open) return;
    setPhone(initialValue);
  }, [initialValue, open]);

  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="mb-3 text-sm text-slate-300">{description}</p>
      <PhoneWhatsappInput value={phone} onChange={setPhone} placeholder={t("orders.whatsappPlaceholder")} />
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={() => void onConfirm(phone)}
          disabled={isLoading || phone.trim().length < 8}
        >
          {isLoading ? t("common.loading") : t("common.save")}
        </Button>
      </div>
    </Modal>
  );
}
