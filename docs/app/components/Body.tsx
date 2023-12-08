"use client";

import { useState, type PropsWithChildren } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Sidebar } from "./Sidebar";
import * as Dialog from "@radix-ui/react-dialog";
import { Outline } from "./Outline";
import Image from "next/image";
import { packageJson } from "./PackageJson";
import { Search } from "./Search";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { outline } from "./tags";

export function Body({ children }: PropsWithChildren) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const logo = (
    <Link href="/" className={twMerge(outline, "flex items-center gap-2 rounded-md px-1")}>
      <Image width={36} height={36} src="/logo.svg" alt="Red Otter logo" />
      <div className="flex items-baseline gap-1">
        <div className="text-2xl font-semibold text-white">Red Otter</div>
        <div className="text-xs text-mauvedark10">{packageJson.version}</div>
      </div>
    </Link>
  );

  const mobileNavigation = (
    <Dialog.Root open={showMobileMenu} onOpenChange={(open) => setShowMobileMenu(open)}>
      <Dialog.Trigger asChild>
        <div
          role="button"
          className="flex h-8 w-8 select-none items-center justify-center text-3xl text-mauvedark12 lg:hidden"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="4" y="8" width="24" height="3" rx="1.5" fill="currentColor" />
            <rect x="4" y="15" width="24" height="3" rx="1.5" fill="currentColor" />
            <rect x="4" y="22" width="24" height="3" rx="1.5" fill="currentColor" />
          </svg>
        </div>
      </Dialog.Trigger>
      <Dialog.Content>
        <div className="fixed bottom-0 left-0 right-0 top-0 flex flex-col items-start gap-4 bg-mauvedark1 p-1 px-2">
          <div className="flex items-center justify-between self-stretch">
            {logo}
            <Dialog.Close asChild>
              <button
                className={twMerge(
                  outline,
                  "flex h-8 w-8 select-none items-center justify-center rounded-full text-3xl text-mauvedark12",
                )}
              >
                ✗
              </button>
            </Dialog.Close>
          </div>
          <div className="flex self-stretch">
            <Search />
          </div>
          <Sidebar onClick={() => setShowMobileMenu(false)} />
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );

  const topBar = (
    // Height is 49px to add 1px for bottom border.
    <div className="fixed top-0 z-10 flex h-[49px] w-full items-center justify-between border-b border-mauvedark5 bg-mauvedark1 pl-1">
      {logo}
      <div className="hidden w-64 gap-2 px-2 lg:flex">
        <Search />
        <Link
          className={twMerge(outline, "rounded-full p-1")}
          href="https://github.com/tchayen/red-otter"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="24" height="24" fill="currentColor" viewBox="3 3 18 18">
            <title>GitHub</title>
            <path d="M12 3C7.0275 3 3 7.12937 3 12.2276C3 16.3109 5.57625 19.7597 9.15374 20.9824C9.60374 21.0631 9.77249 20.7863 9.77249 20.5441C9.77249 20.3249 9.76125 19.5982 9.76125 18.8254C7.5 19.2522 6.915 18.2602 6.735 17.7412C6.63375 17.4759 6.19499 16.6569 5.8125 16.4378C5.4975 16.2647 5.0475 15.838 5.80124 15.8264C6.51 15.8149 7.01625 16.4954 7.18499 16.7723C7.99499 18.1679 9.28875 17.7758 9.80625 17.5335C9.885 16.9337 10.1212 16.53 10.38 16.2993C8.3775 16.0687 6.285 15.2728 6.285 11.7432C6.285 10.7397 6.63375 9.9092 7.20749 9.26326C7.1175 9.03257 6.8025 8.08674 7.2975 6.81794C7.2975 6.81794 8.05125 6.57571 9.77249 7.76377C10.4925 7.55615 11.2575 7.45234 12.0225 7.45234C12.7875 7.45234 13.5525 7.55615 14.2725 7.76377C15.9937 6.56418 16.7475 6.81794 16.7475 6.81794C17.2424 8.08674 16.9275 9.03257 16.8375 9.26326C17.4113 9.9092 17.76 10.7281 17.76 11.7432C17.76 15.2843 15.6563 16.0687 13.6537 16.2993C13.98 16.5877 14.2613 17.1414 14.2613 18.0065C14.2613 19.2407 14.25 20.2326 14.25 20.5441C14.25 20.7863 14.4188 21.0746 14.8688 20.9824C16.6554 20.364 18.2079 19.1866 19.3078 17.6162C20.4077 16.0457 20.9995 14.1611 21 12.2276C21 7.12937 16.9725 3 12 3Z"></path>
          </svg>
        </Link>
      </div>
      {mobileNavigation}
    </div>
  );

  return (
    <>
      <Tooltip.Provider>
        {/* <div className="absolute -top-32 h-[300px] w-full bg-gradient-to-b from-tomatodark4 to-mauvedark1"></div> */}
        {topBar}
        <div className="flex">
          <div className="scrollbar sticky top-0 hidden h-[100dvh] w-64 flex-col gap-4 overflow-auto p-3 pt-[72px] lg:flex">
            <Sidebar />
          </div>
          <div className="mx-auto w-full px-4 pb-8 pt-[64px] md:w-[768px]">{children}</div>
          <Outline />
        </div>
      </Tooltip.Provider>
    </>
  );
}
