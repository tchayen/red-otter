"use client";

import { twMerge } from "tailwind-merge";
import { outline } from "./tags";
import { useState } from "react";

export function CopyCode({ code }: { code: string }) {
  const [state, setState] = useState<"idle" | "success">("idle");
  return (
    <button
      className={twMerge(
        outline,
        "absolute right-2 top-2 rounded-md border border-mauvedark5 px-2 py-1 text-xs text-mauvedark10 hover:bg-mauvedark3",
        state === "success" ? "text-grassdark10 bg-mauvedark3" : "",
      )}
      onClick={() => {
        navigator.clipboard.writeText(code);

        setState("success");
        setTimeout(() => {
          setState("idle");
        }, 2000);
      }}
    >
      {state === "idle" ? "Copy" : "Copied ✓"}
    </button>
  );
}
