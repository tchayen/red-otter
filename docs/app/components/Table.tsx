import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

type CellProps = PropsWithChildren<{ className?: string }>;

function Cell({ children, className }: CellProps) {
  return (
    <div
      className={twMerge(
        "border-t border-mauvedark6 px-3 py-2 text-sm text-mauvedark11",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Root({ children, columns }: PropsWithChildren<{ columns?: string }>) {
  return (
    <div
      style={{ gridTemplateColumns: columns ?? "min-content min-content min-content auto" }}
      className="scrollbar my-4 grid overflow-x-auto rounded-md border border-mauvedark6 bg-mauvedark2"
    >
      {children}
    </div>
  );
}

export function HeaderCell({ children }: PropsWithChildren) {
  return (
    <Cell className="whitespace-nowrap border-t-0 bg-mauvedark3 font-semibold text-mauvedark12">
      {children}
    </Cell>
  );
}

export const Table = { Cell, HeaderCell, Root };
