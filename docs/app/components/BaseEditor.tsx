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
        "/dist/index.d.ts": { code: await types, hidden: true },
        "/dist/index.js": { code: await source, hidden: true },
        "sandbox.config.json": {
          code: sandboxConfig,
          hidden: true,
        },
        "tsconfig.json": {
          code: tsconfig,
          hidden: true,
        },
      }}
    />
  );
}

const tsconfig = `{
  "compilerOptions": {
    "allowJs": true,
    "downlevelIteration": true,
    "esModuleInterop": true,
    "incremental": true,
    "isolatedModules": true,
    "lib": ["es2022", "dom", "dom.iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "es2022",
    "typeRoots": ["./node_modules/@webgpu/types"]
  }
}`;

const sandboxConfig = `{"infiniteLoopProtection":false,"hardReloadOnChange":false,"view":"browser"}`;
