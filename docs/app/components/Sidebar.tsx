"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export function Sidebar({ onClick }: { onClick?: () => void }) {
  const path = usePathname();

  return (
    <>
      <div className="flex flex-col gap-1 self-stretch">
        <SidebarLink currentPath={path} onClick={onClick} href="/">
          Home
        </SidebarLink>
        <SidebarLink currentPath={path} onClick={onClick} href="/blog">
          Blog
        </SidebarLink>
        <SidebarLink currentPath={path} onClick={onClick} href="/getting-started">
          Getting Started
        </SidebarLink>
        <SidebarLink currentPath={path} onClick={onClick} href="/examples">
          Examples
        </SidebarLink>
        <SidebarLink currentPath={path} onClick={onClick} href="/roadmap">
          Roadmap
        </SidebarLink>
        <SidebarLink currentPath={path} onClick={onClick} href="/styling">
          Styling
        </SidebarLink>
        <SidebarLink currentPath={path} onClick={onClick} href="/text-rendering">
          Text Rendering
        </SidebarLink>
        <SidebarLink currentPath={path} onClick={onClick} href="/layout-engine">
          Layout Engine
        </SidebarLink>
        <SidebarLink currentPath={path} onClick={onClick} href="/interactivity">
          Interactivity
        </SidebarLink>
        <SidebarLink currentPath={path} onClick={onClick} href="/renderer">
          Renderer
        </SidebarLink>
        <SidebarLink currentPath={path} onClick={onClick} href="/math-library">
          Math Library
        </SidebarLink>
      </div>
    </>
  );
}

function SidebarLink({
  href,
  currentPath,
  onClick,
  children,
}: PropsWithChildren<{ currentPath: string; href: string; onClick?: () => void }>) {
  const isExternal = href.startsWith("http");
  const isCurrent = getIsCurrent(currentPath, href);

  return (
    <Link
      className={twMerge(
        "flex h-8 shrink-0 items-center gap-1 rounded-md border border-transparent px-3 text-sm text-mauvedark11 outline-none focus-visible:ring-2 focus-visible:ring-tomatodark9",
        isCurrent ? "bg-mauvedark3 text-mauvedark12" : "bg-transparent hover:border-mauvedark5 ",
      )}
      onClick={onClick}
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
      {isExternal && <span className="ml-0.5">↗</span>}
    </Link>
  );
}

function getIsCurrent(path: string, href: string) {
  if (href === "/") {
    return path === "/";
  }

  return path.startsWith(href);
}
