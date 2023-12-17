import type { SandpackProps } from "@codesandbox/sandpack-react/types";
import { BaseEditorClient } from "./BaseEditor.client";
// import redOtter from "../../../.sandpack-files/red-otter.js?raw";
import fs from "node:fs";

const source = fs.promises.readFile(
  __dirname + "/../../../../../.sandpack-files/red-otter.js",
  "utf8",
);

export async function BaseEditor(props: SandpackProps) {
  return (
    <BaseEditorClient
      {...props}
      files={{
        ...props.files,
        "red-otter.js": { code: await source, hidden: true },
      }}
    />
  );
}
