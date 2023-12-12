"use client";

import { twMerge } from "tailwind-merge";
import { outline } from "./tags";

export function CopyCode({ code }: { code: string }) {
  return (
    <button
      className={twMerge(
        outline,
        "absolute right-2 top-2 rounded-md border border-mauvedark5 px-2 py-1 text-xs text-mauvedark10 hover:bg-mauvedark3",
      )}
      onClick={() => {
        navigator.clipboard.writeText(code);
      }}
    >
      Copy
    </button>
  );
}
