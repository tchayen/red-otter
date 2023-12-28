"use client";
import type { SandpackProps, SandpackTheme } from "@codesandbox/sandpack-react";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { withClient } from "./withClient";
import { jetBrainsMono, outline } from "./tags";
import * as Collapsible from "@radix-ui/react-collapsible";
import { twMerge } from "tailwind-merge";
import { useEffect, useRef } from "react";

function toggleScrolling(isPaused: boolean) {
  const body = document.body;
  if (isPaused) {
    body.setAttribute("style", "overflow:hidden");
  } else {
    body.setAttribute("style", "");
  }
}

export const BaseEditorClient = withClient(function BaseEditor({
  files,
  customSetup,
}: SandpackProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const onMouseEnter = (event: MouseEvent) => {
      console.log("Aa");
      localStorage.setItem("sandpack:editor:active", "true");
      toggleScrolling(true);
    };

    const onMouseLeave = (event: MouseEvent) => {
      console.log("Bb");
      localStorage.setItem("sandpack:editor:active", "false");
      toggleScrolling(false);
    };

    ref.current.addEventListener("mouseenter", onMouseEnter);
    ref.current.addEventListener("mouseleave", onMouseLeave);

    return () => {
      if (!ref.current) {
        return;
      }

      ref.current.removeEventListener("mouseenter", onMouseEnter);
      ref.current.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [ref]);

  return (
    <SandpackProvider
      files={files}
      template="vanilla-ts"
      customSetup={{ ...customSetup }}
      theme={githubDark}
      options={{
        bundlerURL: "https://sandpack-bundler.pages.dev",
        initMode: "lazy",
      }}
    >
      <SandpackLayout className="my-6 flex flex-col !gap-1 !overflow-visible !rounded-none !border-transparent !bg-transparent">
        <div ref={ref}>
          <SandpackPreview className="!h-[640px] !flex-initial" showOpenInCodeSandbox />
        </div>
        <Collapsible.Root className="group flex w-full flex-col gap-1">
          <Collapsible.Trigger asChild>
            <button
              className={twMerge(
                outline,
                "flex items-center gap-2 self-start rounded-md border border-mauvedark5 bg-mauvedark2 px-3 py-2 text-sm text-mauvedark11",
              )}
            >
              Show code{" "}
              <svg
                className="transition-all duration-100 group-data-[state=open]:rotate-180"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 5L7 10L12 5"
                  stroke="#6B7176"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <SandpackCodeEditor
              className="h-[640px] w-full overflow-hidden rounded-md border border-mauvedark5 !bg-mauvedark2 antialiased [&_.sp-tab-button]:px-4 data-[active=true]:[&_.sp-tab-button]:bg-mauvedark3 [&_.sp-tabs-scrollable-container]:!pl-0"
              showInlineErrors
              showLineNumbers
              style={{ fontVariantLigatures: "none" }}
            />
          </Collapsible.Content>
        </Collapsible.Root>
      </SandpackLayout>
    </SandpackProvider>
  );
});

const githubDark: SandpackTheme = {
  colors: {
    accent: "#c9d1d9",
    base: "#c9d1d9",
    clickable: "#c9d1d9",
    disabled: "#4d4d4d",
    hover: "#c9d1d9",
    surface1: "var(--code-theme-background)",
    surface2: "hsl(198, 6.6%, 15.8%)",
    surface3: "hsl(198, 6.6%, 15.8%)",
  },
  font: {
    body: "Inter",
    lineHeight: "20px",
    mono: jetBrainsMono.style.fontFamily,
    size: "14px",
  },
  syntax: {
    comment: {
      color: "#8b949e",
      fontStyle: "normal",
    },
    definition: "#d2a8ff",
    keyword: "#ff7b72",
    plain: "#c9d1d9",
    property: "#79c0ff",
    punctuation: "#c9d1d9",
    static: "#a5d6ff",
    string: "#a5d6ff",
    tag: "#7ee787",
  },
};
