"use client";

import { useState, type PropsWithChildren } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Sidebar } from "./Sidebar";

export function Body({ children }: PropsWithChildren) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  return (
    <>
      <Tooltip.Provider>
        {/* <div className="from-tomatodark2 to-mauvedark1 absolute -top-32 h-[300px] w-full bg-gradient-to-b"></div> */}
        <div className="relative mx-auto w-full px-4 py-8 lg:w-[900px] lg:px-0 lg:pl-56">
          {children}
        </div>
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
          <div className="fixed bottom-0 left-0 right-0 top-0 flex flex-col items-start gap-4 bg-mauvedark1 px-4">
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
        <div className="scrollbar fixed top-0 hidden h-[100dvh] w-56 flex-col items-start gap-4 overflow-auto p-6 pt-4 lg:flex">
          <Sidebar />
        </div>
      </Tooltip.Provider>
    </>
  );
}
