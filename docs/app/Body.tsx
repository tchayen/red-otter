"use client";

import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Version } from "./Version";
import Link from "next/link";

export function Body({ children }: PropsWithChildren) {
  return (
    <Tooltip.Provider>
      <body className={""}>
        <div className="from-mauvedark2 to-mauvedark1 absolute -top-32 h-[300px] w-full bg-gradient-to-b"></div>
        <div className="bg-mauvedark2 border-mauvedark5 fixed flex h-[100dvh] w-64 flex-col items-start gap-2 border-r p-4">
          <img src="/logo.svg" className="h-24 w-24" alt="Red Otter logo" />
          <div className="flex items-baseline gap-0.5">
            <div className="text-2xl font-bold text-white">Red Otter</div>
            <div className="text-mauvedark10 text-xs">
              <Version />
            </div>
          </div>
          <SidebarLink href="/">Home</SidebarLink>
          <SidebarLink href="/api">API reference</SidebarLink>
          <SidebarLink href="/roadmap">Roadmap</SidebarLink>
          <SidebarLink href="/renderer">Renderer</SidebarLink>
          <SidebarLink href="/layout">Layout engine</SidebarLink>
          <SidebarLink href="https://github.com/tchayen/red-otter">
            GitHub
          </SidebarLink>
          <SidebarLink href="https://npmjs.com/package/red-otter">
            NPM
          </SidebarLink>
          <SidebarLink href="https://x.com/tchayen">Twitter</SidebarLink>
        </div>
        <main className="relative mx-auto w-[1024px] py-8 pl-64">
          {children}
        </main>
      </body>
    </Tooltip.Provider>
  );
}

function SidebarLink({ href, children }: PropsWithChildren<{ href: string }>) {
  const isExternal = href.startsWith("http");

  return (
    <Link
      className={twMerge(
        "hover:bg-mauvedark5 flex h-8 items-center rounded-full px-4 text-sm",
        false ? "bg-mauvedark5" : "bg-transparent", // TODO: use router to get current path
      )}
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
    </Link>
  );
}
