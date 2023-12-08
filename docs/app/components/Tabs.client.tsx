"use client";
import { type PropsWithChildren } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { twMerge } from "tailwind-merge";
import { outline } from "./tags";

export function Root({ defaultValue, children }: PropsWithChildren<{ defaultValue: string }>) {
  return <TabsPrimitive.Root defaultValue={defaultValue}>{children}</TabsPrimitive.Root>;
}

export function List({ children }: PropsWithChildren) {
  return (
    <TabsPrimitive.List className="flex border-b border-mauvedark5">{children}</TabsPrimitive.List>
  );
}

export function Trigger({ children, value }: PropsWithChildren<{ value: string }>) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={twMerge(
        outline,
        "rounded-md p-3 text-sm text-mauvedark10 data-[state=active]:text-mauvedark12",
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function Content({ children, value }: PropsWithChildren<{ value: string }>) {
  return (
    <TabsPrimitive.Content value={value} className="py-2" tabIndex={-1}>
      {children}
    </TabsPrimitive.Content>
  );
}
