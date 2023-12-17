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
      files={{
        ...props.files,
        "index.d.ts": { code: await types, hidden: true },
        "red-otter.js": { code: await source, hidden: true },
        "sandbox.config.json": {
          code: `{"infiniteLoopProtection":false,"hardReloadOnChange":false,"view":"browser"}`,
          hidden: true,
        },
      }}
    />
  );
}
