"use client";

import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import * as Tooltip from "@radix-ui/react-tooltip";
import { A, inter } from "./tags";
import { Version } from "./Version";

export function Body({ children }: PropsWithChildren) {
  return (
    <Tooltip.Provider>
      <body className={twMerge(inter.className, "")}>
        <div className="bg-mauvedark2 border-mauvedark5 fixed flex h-[100dvh] w-64 flex-col items-start gap-2 border-r p-4">
          <img src="/logo.svg" className="h-16 w-16" alt="Red Otter logo" />
          <div className="flex items-end">
            <div className="text-2xl font-bold text-white">Red Otter</div>
            <div className="text-mauvedark10 text-xs">
              <Version />
            </div>
          </div>
          <A href="/">Home</A>
          <A href="/api">API reference</A>
          <A href="/roadmap">Roadmap</A>
          <A href="/renderer">Renderer</A>
          <A href="/layout">Layout engine</A>
          <A href="https://github.com/tchayen/red-otter">GitHub</A>
          <A href="https://npmjs.com/package/red-otter">NPM</A>
          <A href="https://x.com/tchayen">Twitter</A>
        </div>
        <main className="mx-auto w-[1024px] py-8 pl-64">{children}</main>
      </body>
    </Tooltip.Provider>
  );
}
