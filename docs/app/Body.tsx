"use client";

import { useState, type PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import * as Tooltip from "@radix-ui/react-tooltip";
import { packageJson } from "./PackageJson";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "./Search";

export function Body({ children }: PropsWithChildren) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  return (
    <body className="selection:bg-mauvedark12 selection:text-black">
      <Tooltip.Provider>
        {/* <div className="from-tomatodark2 to-mauvedark1 absolute -top-32 h-[300px] w-full bg-gradient-to-b"></div> */}
        <main className="relative mx-auto w-full px-4 py-8 lg:w-[900px] lg:px-0 lg:pl-56">
          {children}
        </main>
        <div
          role="button"
          onClick={() => {
            setShowMobileMenu(true);
          }}
          className="absolute right-4 top-4 flex h-8 w-8 select-none items-center justify-center text-3xl text-mauvedark12 lg:hidden"
        >
          ⌘
        </div>
        {showMobileMenu && (
          <div className="fixed bottom-0 left-0 right-0 top-0 flex flex-col items-start gap-2 bg-mauvedark1 px-4">
            <Sidebar />
            <div
              role="button"
              onClick={() => {
                setShowMobileMenu(false);
              }}
              className="absolute right-4 top-4 flex h-8 w-8 select-none items-center justify-center text-3xl text-mauvedark12"
            >
              ✗
            </div>
          </div>
        )}
        <div className="sidebar fixed top-0 hidden h-[100dvh] w-56 flex-col items-start gap-2 overflow-auto p-6 pt-4 lg:flex">
          <Sidebar />
        </div>
      </Tooltip.Provider>
    </body>
  );
}

function Sidebar() {
  const path = usePathname();

  return (
    <>
      <img src="/logo.svg" className="h-24 w-24" alt="Red Otter logo" />
      <div className="flex items-baseline gap-1">
        <div className="text-2xl font-bold text-white">Red Otter</div>
        <div className="text-xs text-mauvedark10">{packageJson.version}</div>
      </div>
      <Search />
      <SidebarLink currentPath={path} href="/">
        Home
      </SidebarLink>
      <SidebarLink currentPath={path} href="/api">
        API reference
      </SidebarLink>
      <SidebarLink currentPath={path} href="/roadmap">
        Roadmap
      </SidebarLink>
      <SidebarLink currentPath={path} href="/renderer">
        Renderer
      </SidebarLink>
      <SidebarLink currentPath={path} href="/layout">
        Layout engine
      </SidebarLink>
      <SidebarLink currentPath={path} href="https://github.com/tchayen/red-otter">
        GitHub
      </SidebarLink>
      <SidebarLink currentPath={path} href="https://npmjs.com/package/red-otter">
        NPM
      </SidebarLink>
      <SidebarLink currentPath={path} href="https://x.com/tchayen">
        X
      </SidebarLink>
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
        "flex h-8 shrink-0 items-center rounded-full border border-transparent px-3 text-sm outline-none hover:border-mauvedark5 focus-visible:ring-2 focus-visible:ring-tomatodark9",
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
