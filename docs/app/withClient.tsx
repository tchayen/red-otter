"use client";
import type { ComponentProps, ComponentType } from "react";
import { useEffect, useState } from "react";

export function withClient<T extends ComponentType<any>>(Component: T) {
  return function ClientComponent(props: ComponentProps<T>) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return null;
    }

    return <Component {...props} />;
  };
}
