import type { PropsWithChildren } from "react";
import { JetBrains_Mono } from "next/font/google";
import { twMerge } from "tailwind-merge";
import Link, { LinkProps } from "next/link";

const jetBrainsMono = JetBrains_Mono({
  display: "swap",
  preload: true,
  style: "normal",
  subsets: ["latin"],
});

export function Code({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  if (typeof children === "string" && children.length === 0) {
    return null;
  }

  return (
    <code
      className={twMerge(
        jetBrainsMono.className,
        "rounded-sm bg-slatedark4 px-1",
        className,
      )}
    >
      {children}
    </code>
  );
}

export function H2({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <h2
      className={twMerge("text-xl font-semibold text-slatedark12", className)}
    >
      {children}
    </h2>
  );
}

export function A({
  children,
  forceExternal,
  href,
  ...rest
}: PropsWithChildren<{
  forceExternal?: boolean;
  href: string;
}> &
  LinkProps) {
  const isExternal = forceExternal || href.startsWith("http");

  return (
    <Link
      className={twMerge(
        "font-semibold text-white underline decoration-slatedark8 decoration-1 underline-offset-4 hover:decoration-slate12 focus-visible:no-underline",
        "focus-visible:ring-indigo9 rounded-sm outline-none focus-visible:ring-2",
      )}
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function P({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <p
      className={twMerge(
        "text-base leading-6 text-slate11 dark:text-slatedark11",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Ul({ children }: PropsWithChildren) {
  return <ul className="mx-8 list-disc text-base md:mx-4">{children}</ul>;
}

export function Ol({ children }: PropsWithChildren) {
  return <ol className="mx-8 list-decimal md:mx-4">{children}</ol>;
}

export function Li({ children }: PropsWithChildren) {
  return (
    <li className="leading-6 text-slate11 dark:text-slatedark11">{children}</li>
  );
}

export function Strong({ children }: PropsWithChildren) {
  return <strong className="text-black dark:text-white">{children}</strong>;
}

export function Em({ children }: PropsWithChildren) {
  return <strong className="font-normal italic">{children}</strong>;
}
