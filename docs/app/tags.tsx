import { Children, cloneElement, isValidElement } from "react";
import type { ReactNode, PropsWithChildren } from "react";
import { JetBrains_Mono } from "next/font/google";
import { twMerge } from "tailwind-merge";
import type { LinkProps } from "next/link";
import Link from "next/link";

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
        "bg-mauvedark4 rounded-sm px-1",
        className,
      )}
    >
      {children}
    </code>
  );
}

export function H1({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <h2
      className={twMerge(
        "text-mauvedark12 my-2 text-2xl font-semibold",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function H2({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <h2
      className={twMerge(
        "text-mauvedark12 my-2 text-xl font-semibold",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function H3({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <h2
      className={twMerge(
        "text-mauvedark12 my-2 text-lg font-semibold",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function H4({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <h2
      className={twMerge(
        "text-mauvedark12 my-2 text-base font-semibold",
        className,
      )}
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
        "decoration-mauvedark8 hover:decoration-mauve12 font-semibold text-white underline decoration-1 underline-offset-4 focus-visible:no-underline",
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
        "text-mauvedark11 my-4 text-base leading-6",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Ul({ children }: PropsWithChildren) {
  return <ul className="mx-8 my-4 list-disc text-base md:mx-4">{children}</ul>;
}

export function Ol({ children }: PropsWithChildren) {
  return <ol className="mx-8 my-4 list-decimal md:mx-4">{children}</ol>;
}

export function Li({ children }: PropsWithChildren) {
  return <li className="text-mauvedark11 my-1 leading-6">{children}</li>;
}

export function Strong({ children }: PropsWithChildren) {
  return <strong className="text-white">{children}</strong>;
}

export function Em({ children }: PropsWithChildren) {
  return <strong className="font-normal italic">{children}</strong>;
}

export function Box({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  let boxType = "";

  const modifiedChildren = Children.map(children, (child) => {
    if (typeof child === "string") {
      const match = child.match(/\[!(WARNING|IMPORTANT|NOTE)]/);
      if (match) {
        boxType = match[1]; // Capture the box type
        return child.replace(/\[!(WARNING|IMPORTANT|NOTE)]/, ""); // Remove the pattern
      }
      return child;
    } else if (isValidElement(child)) {
      return cloneElement(child, {
        ...child.props,
        children: replaceAnnotatedTag(
          child.props.children,
          (type) => (boxType = type || boxType),
        ),
      });
    }
    return child;
  });

  let styling = "[&>*]:text-mauvedark12 bg-mauvedark2 border-mauvedark5";
  switch (boxType) {
    case "WARNING":
      styling = "[&>*]:text-orangedark12 bg-orangedark2 border-orangedark5";
      break;
    case "IMPORTANT":
      styling = "[&>*]:text-purpledark12 bg-purpledark2 border-purpledark5";
      break;
    case "NOTE":
      styling = "[&>*]:text-bluedark12 bg-bluedark2 border-bluedark5";
      break;
  }

  return (
    <blockquote
      className={twMerge(styling, "my-4 rounded-md border px-4", className)}
    >
      {boxType && <div className="-mb-2 mt-3 font-bold">{boxType}</div>}
      {modifiedChildren}
    </blockquote>
  );
}

function replaceAnnotatedTag(
  children: ReactNode,
  setType: (type: string) => void,
) {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      const match = child.match(/\[!(WARNING|IMPORTANT|NOTE)]/);
      if (match) {
        setType(match[1]); // Set the box type
        return child.replace(/\[!(WARNING|IMPORTANT|NOTE)]/, "");
      }
      return child;
    } else if (isValidElement(child) && child.props.children) {
      return cloneElement(child, {
        ...child.props,
        children: replaceAnnotatedTag(child.props.children, setType),
      });
    }
    return child;
  });
}
