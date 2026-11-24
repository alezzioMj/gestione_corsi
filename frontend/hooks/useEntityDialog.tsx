import { useState } from "react";

export function useEntityDialog<T>() {
    const [state, setState] = useState<{ open: boolean; entity: T | null }>({
        open: false,
        entity: null,
    });

    return {
        open: state.open,
        entity: state.entity,
        openCreate: () => setState({ open: true, entity: null }),
        openEdit: (entity: T) => setState({ open: true, entity }),
        close: () => setState((s) => ({ ...s, open: false })),
    };
}