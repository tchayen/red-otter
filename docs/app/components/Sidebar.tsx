"use client";
import { packageJson } from "./PackageJson";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "./Search";
import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

export function Sidebar() {
  const path = usePathname();

  return (
    <>
      <Link href="/" className="outline-none">
        <Image width={96} height={96} src="/logo.svg" alt="Red Otter logo" />
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-bold text-white">Red Otter</div>
          <div className="text-xs text-mauvedark10">{packageJson.version}</div>
        </div>
      </Link>
      <Search />
      <div className="flex flex-col items-start gap-2">
        <SidebarLink currentPath={path} href="/">
          Home
        </SidebarLink>
        <SidebarLink currentPath={path} href="/getting-started">
          Getting Started
        </SidebarLink>
        <SidebarLink currentPath={path} href="/examples">
          Examples
        </SidebarLink>
        <SidebarLink currentPath={path} href="/roadmap">
          Roadmap
        </SidebarLink>
        <SidebarLink currentPath={path} href="/styling">
          Styling
        </SidebarLink>
        <SidebarLink currentPath={path} href="/text-rendering">
          Text Rendering
        </SidebarLink>
        <SidebarLink currentPath={path} href="/layout-engine">
          Layout Engine
        </SidebarLink>
        <SidebarLink currentPath={path} href="/renderer">
          Renderer
        </SidebarLink>
        <SidebarLink currentPath={path} href="/math-library">
          Math Library
        </SidebarLink>
        <div className="flex gap-4 px-3 py-3">
          <Link
            href="https://github.com/tchayen/red-otter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="24" height="24" fill="currentColor" viewBox="3 3 18 18">
              <title>GitHub</title>
              <path d="M12 3C7.0275 3 3 7.12937 3 12.2276C3 16.3109 5.57625 19.7597 9.15374 20.9824C9.60374 21.0631 9.77249 20.7863 9.77249 20.5441C9.77249 20.3249 9.76125 19.5982 9.76125 18.8254C7.5 19.2522 6.915 18.2602 6.735 17.7412C6.63375 17.4759 6.19499 16.6569 5.8125 16.4378C5.4975 16.2647 5.0475 15.838 5.80124 15.8264C6.51 15.8149 7.01625 16.4954 7.18499 16.7723C7.99499 18.1679 9.28875 17.7758 9.80625 17.5335C9.885 16.9337 10.1212 16.53 10.38 16.2993C8.3775 16.0687 6.285 15.2728 6.285 11.7432C6.285 10.7397 6.63375 9.9092 7.20749 9.26326C7.1175 9.03257 6.8025 8.08674 7.2975 6.81794C7.2975 6.81794 8.05125 6.57571 9.77249 7.76377C10.4925 7.55615 11.2575 7.45234 12.0225 7.45234C12.7875 7.45234 13.5525 7.55615 14.2725 7.76377C15.9937 6.56418 16.7475 6.81794 16.7475 6.81794C17.2424 8.08674 16.9275 9.03257 16.8375 9.26326C17.4113 9.9092 17.76 10.7281 17.76 11.7432C17.76 15.2843 15.6563 16.0687 13.6537 16.2993C13.98 16.5877 14.2613 17.1414 14.2613 18.0065C14.2613 19.2407 14.25 20.2326 14.25 20.5441C14.25 20.7863 14.4188 21.0746 14.8688 20.9824C16.6554 20.364 18.2079 19.1866 19.3078 17.6162C20.4077 16.0457 20.9995 14.1611 21 12.2276C21 7.12937 16.9725 3 12 3Z"></path>
            </svg>
          </Link>
          <Link href="https://x.com/tchayen" target="_blank" rel="noopener noreferrer">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <title>X</title>
              <g>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </g>
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}

function SidebarLink({
  href,
  currentPath,
  children,
}: PropsWithChildren<{ currentPath: string; href: string }>) {
  const isExternal = href.startsWith("http");
  const isCurrent = currentPath === href;

  return (
    <Link
      className={twMerge(
        "flex h-8 shrink-0 items-center gap-1 rounded-full border border-transparent px-3 text-sm outline-none hover:border-mauvedark5 focus-visible:ring-2 focus-visible:ring-tomatodark9",
        isCurrent ? "border-mauvedark5 bg-mauvedark3" : "bg-transparent",
      )}
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
      {isExternal && <span className="ml-0.5">↗</span>}
    </Link>
  );
}
