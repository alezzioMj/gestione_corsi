import { useState } from "react";

export function useModalForm<T extends object>(initialValues: T) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<T>(initialValues);

    const openModal = () => setOpen(true);
    const closeModal = () => {
        setOpen(false);
        setFormData(initialValues);
    };

    const setField = <K extends keyof T>(field: K, value: T[K]) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

    return { open, openModal, closeModal, formData, setFormData, setField };
}