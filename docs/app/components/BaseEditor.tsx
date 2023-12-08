"use client";
import type { SandpackProps, SandpackTheme } from "@codesandbox/sandpack-react";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { withClient } from "./withClient";
import { jetBrainsMono } from "./tags";

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
      <SandpackLayout className="border-slate7 dark:border-slatedark7 my-6 flex h-[1280px] flex-col border-y md:rounded-lg md:border">
        <SandpackCodeEditor
          className="h-[640px]"
          showInlineErrors
          showLineNumbers
          style={{ fontVariantLigatures: "none" }}
        />
        <SandpackPreview
          className="border-slate7 dark:border-slatedark7 h-[640px] border-t"
          showOpenInCodeSandbox
        />
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
