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

export const BaseEditor = withClient(function BaseEditor({ files, customSetup }: SandpackProps) {
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
        <SandpackPreview className="!h-[640px] !flex-initial" showOpenInCodeSandbox />
        <Collapsible.Root className="flex w-full flex-col gap-1">
          <Collapsible.Trigger asChild>
            <button
              className={twMerge(
                outline,
                "flex self-start rounded-md border border-mauvedark5 bg-mauvedark2 px-3 py-2 text-sm text-mauvedark11 focus-visible:border-transparent",
              )}
            >
              Show code
            </button>
          </Collapsible.Trigger>
          <Collapsible.Content className="">
            <SandpackCodeEditor
              className="h-[640px] w-full overflow-hidden rounded-md border border-mauvedark5 !bg-mauvedark2 antialiased"
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
