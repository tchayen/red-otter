import type { SandpackProps } from "@codesandbox/sandpack-react/types";
import { BaseEditorClient } from "./BaseEditor.client";
// import redOtter from "../../../.sandpack-files/red-otter.js?raw";
import fs from "node:fs";

const basePath = "/../../../../../.sandpack-files";
const source = fs.promises.readFile(__dirname + basePath + "/red-otter.js", "utf8");
const types = fs.promises.readFile(__dirname + basePath + "/index.d.ts", "utf8");

export async function BaseEditor(props: SandpackProps) {
  return (
    <BaseEditorClient
      {...props}
      customSetup={{
        devDependencies: {
          "@webgpu/types": "^0.1.40",
        },
      }}
      files={{
        ...props.files,
        "/dist/index.d.ts": {
          code: `/// <reference types="node_modules/@webgpu/types" />\n${await types}`,
        },
        "/dist/index.js": { code: await source },
        "sandbox.config.json": { code: sandboxConfig, hidden: true },
      }}
    />
  );
}

const sandboxConfig = `{"infiniteLoopProtection":false,"hardReloadOnChange":false,"view":"browser"}`;
