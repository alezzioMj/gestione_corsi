"use client";

import React, { useState, useEffect } from "react";
import Loading from "./Loading"; // Il tuo componente originale

interface DelayedLoadingProps {
    delay?: number;
}

export default function DelayedLoading({ delay = 300 }: DelayedLoadingProps) {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldRender(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    // Se il tempo non è ancora passato, non renderizza nulla
    if (!shouldRender) return null;

    return <Loading />;
}