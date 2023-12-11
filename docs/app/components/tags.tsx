import { Children, cloneElement, isValidElement } from "react";
import type { ReactNode, PropsWithChildren, AnchorHTMLAttributes } from "react";
import { JetBrains_Mono } from "next/font/google";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

export const jetBrainsMono = JetBrains_Mono({
  display: "swap",
  preload: true,
  style: "normal",
  subsets: ["latin"],
});

export const outline =
  "rounded-sm focus-visible:ring-tomatodark9 outline-none focus-visible:ring-2";
export const underline = "decoration-1 underline-offset-4 decoration-mauvedark8 hover:underline";

export function Code({ children, className }: PropsWithChildren<{ className?: string }>) {
  if (typeof children === "string" && children.length === 0) {
    return null;
  }

  return (
    <code
      className={twMerge(
        jetBrainsMono.className,
        "whitespace-nowrap rounded-md border border-mauvedark5 bg-mauvedark3 px-1 text-[14px]",
        className,
      )}
    >
      {children}
    </code>
  );
}

export function H1({
  children,
  noLink,
  id,
  className,
}: PropsWithChildren<{ className?: string; id?: string; noLink?: boolean }>) {
  if (noLink) {
    return (
      <h1
        className={twMerge("mb-4 scroll-mt-16 text-3xl font-semibold text-mauvedark12", className)}
      >
        {children}
      </h1>
    );
  }

  const slug =
    (id ? `${id.replaceAll(".", "-")}-` : "") +
    slugify(typeof children === "string" ? children : "");
  return (
    <h1
      id={slug}
      className={twMerge("mb-4 scroll-mt-16 text-3xl font-semibold text-mauvedark12", className)}
    >
      <a href={`#${slug}`} className={twMerge(outline, underline)}>
        {children}
      </a>
    </h1>
  );
}

export function H2({
  children,
  noLink,
  id,
  className,
}: PropsWithChildren<{ className?: string; id?: string; noLink?: boolean }>) {
  if (noLink) {
    return (
      <h2
        className={twMerge(
          "mb-2 mt-6 scroll-mt-16 text-2xl font-semibold text-mauvedark12",
          className,
        )}
      >
        {children}
      </h2>
    );
  }

  const slug =
    (id ? `${id.replaceAll(".", "-")}-` : "") +
    slugify(typeof children === "string" ? children : "");
  return (
    <h2
      id={slug}
      className={twMerge(
        "mb-2 mt-6 scroll-mt-16 text-2xl font-semibold text-mauvedark12",
        className,
      )}
    >
      <a href={`#${slug}`} className={twMerge(outline, underline)}>
        {children}
      </a>
    </h2>
  );
}

export function H3({
  children,
  id,
  className,
}: PropsWithChildren<{ className?: string; id?: string }>) {
  const slug =
    (id ? `${id.replaceAll(".", "-")}-` : "") +
    slugify(typeof children === "string" ? children : "");
  return (
    <h3
      id={slug}
      className={twMerge(
        "mb-2 mt-6 scroll-mt-16 text-xl font-semibold text-mauvedark12",
        className,
      )}
    >
      <a href={`#${slug}`} className={twMerge(outline, underline)}>
        {children}
      </a>
    </h3>
  );
}

export function H4({
  children,
  id,
  className,
}: PropsWithChildren<{ className?: string; id?: string }>) {
  const slug =
    (id ? `${id.replaceAll(".", "-")}-` : "") +
    slugify(typeof children === "string" ? children : "");
  return (
    <h4
      id={slug}
      className={twMerge(
        "mb-2 mt-6 scroll-mt-16 text-lg font-semibold text-mauvedark12",
        className,
      )}
    >
      <a href={`#${slug}`} className={twMerge(outline, underline)}>
        {children}
      </a>
    </h4>
  );
}

export function A({
  children,
  forceExternal,
  href,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { forceExternal?: boolean }) {
  const isExternal = forceExternal || href?.startsWith("http");

  if (!href) {
    return children;
  }

  return (
    <Link
      className={twMerge(
        "font-semibold text-white underline decoration-mauvedark8 decoration-1 underline-offset-4 hover:decoration-mauve12 focus-visible:no-underline",
        outline,
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

export function P({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <p className={twMerge("my-2 text-base leading-[26px] text-mauvedark11", className)}>
      {children}
    </p>
  );
}

export function Ul({ children }: PropsWithChildren) {
  return (
    <ul className="mx-8 my-4 list-disc text-base md:mx-0 md:ml-4 [&>li>ul]:my-2">{children}</ul>
  );
}

export function Ol({ children }: PropsWithChildren) {
  return <ol className="mx-8 my-4 list-decimal md:mx-0">{children}</ol>;
}

export function Li({ children }: PropsWithChildren) {
  return <li className="my-2 leading-[26px] text-mauvedark11">{children}</li>;
}

export function Strong({ children }: PropsWithChildren) {
  return <strong className="text-white">{children}</strong>;
}

export function Em({ children }: PropsWithChildren) {
  return <strong className="font-normal italic">{children}</strong>;
}

export function Hr() {
  return <hr className="my-6 border-t border-mauvedark5" />;
}

export function Box({
  children,
  overrideType,
  className,
}: PropsWithChildren<{ className?: string; overrideType?: string }>) {
  let boxType = "";

  const modifiedChildren = Children.map(children, (child) => {
    if (typeof child === "string") {
      const match = child.match(/\[!(WARNING|IMPORTANT|NOTE)]/);
      if (match) {
        boxType = match[1] ?? ""; // Capture the box type
        return child.replace(/\[!(WARNING|IMPORTANT|NOTE)]/, ""); // Remove the pattern
      }
      return child;
    } else if (isValidElement(child)) {
      return cloneElement(child, {
        ...child.props,
        children: replaceAnnotatedTag(child.props.children, (type) => (boxType = type || boxType)),
      });
    }
    return child;
  });

  if (overrideType) {
    boxType = overrideType;
  }

  const styling = "[&>*]:text-mauvedark12 bg-mauvedark3 border-mauvedark5";
  // switch (boxType) {
  //   case "WARNING":
  //     styling = "[&>*]:text-amberdark12 bg-amberdark3 border-amberdark5";
  //     break;
  //   case "IMPORTANT":
  //     styling = "[&>*]:text-purpledark12 bg-purpledark3 border-purpledark5";
  //     break;
  //   case "NOTE":
  //     styling = "[&>*]:text-bluedark12 bg-bluedark3 border-bluedark5";
  //     break;
  // }

  return (
    <blockquote
      className={twMerge(
        styling,
        "relative my-6 overflow-hidden rounded-md border px-4",
        className,
      )}
    >
      {boxType && (
        <>
          <div className="-mb-2 mt-3 text-xs font-semibold">{boxType}</div>
          <span className="absolute -left-4 top-1 select-none text-[48px] font-bold leading-[36px] opacity-[15%]">
            
          </span>
        </>
      )}
      {!boxType && (
        <span className="absolute -left-4 top-12 select-none text-[200px] leading-[36px] opacity-10">
          &rdquo;
        </span>
      )}
      {modifiedChildren}
    </blockquote>
  );
}

function replaceAnnotatedTag(children: ReactNode, setType: (type: string) => void): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      const match = child.match(/\[!(WARNING|IMPORTANT|NOTE)]/);
      if (match) {
        setType(match[1] ?? ""); // Set the box type
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

export function slugify(value: string) {
  return (
    value
      .toLocaleLowerCase()
      // Change diacritics to their base character.
      .normalize("NFD")
      // Remove all non-alphanumeric characters.
      .replaceAll(/[^\d A-Za-z-]/g, "")
      // In case the text had leading or trailing spaces after removal.
      .trim()
      // Replace spaces with dashes.
      .replaceAll(/\s/g, "-")
  );
}
