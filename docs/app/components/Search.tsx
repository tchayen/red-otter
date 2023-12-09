import * as Dialog from "@radix-ui/react-dialog";
import { twMerge } from "tailwind-merge";
import FlexSearch from "flexsearch";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import type { Page, Section } from "../search/route";
import { H2, outline } from "./tags";
import { HighlightMatches } from "./HighlightMatches";
import { withClient } from "./withClient";
import Link from "next/link";

declare global {
  // It only works with var.
  // eslint-disable-next-line no-var
  var sectionIndex: FlexSearch.Document<{
    content: string;
    header: string;
    id: number;
    url: string;
  }> | null;
}

globalThis.sectionIndex = null;

let id = 1;
const idToSection = new Map<number, Section>();

function getPlatform() {
  if (navigator.userAgent.match(/Macintosh/)) {
    return "mac";
  }

  if (navigator.userAgent.match(/Windows/)) {
    return "windows";
  }

  return "linux";
}

export function Search() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Array<Section>>([]);

  // Load the search index.
  useEffect(() => {
    if (globalThis.sectionIndex) {
      return;
    }

    fetch("/search")
      .then((response) => response.json())
      .then((data) => {
        globalThis.sectionIndex = new FlexSearch.Document({
          cache: 100,
          context: { bidirectional: true, depth: 2, resolution: 9 },
          document: { id: "id", index: ["content", "header"] },
          tokenize: "full",
        });

        for (const page of data as Array<Page>) {
          for (const section of page.sections) {
            globalThis.sectionIndex.add({ id, ...section });
            idToSection.set(id, section);
            id += 1;
          }
        }
      });
  }, []);

  // Detect CMD+K or CTRL+K to open the search dialog.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function onChange(event: ChangeEvent<HTMLInputElement>): void {
    let newValue = event.target.value;
    setSearch(newValue);
    newValue = newValue.trim();

    if (newValue === search) {
      return;
    }
    if (newValue.length < 2) {
      setResults([]);
      return;
    }
    if (!globalThis.sectionIndex) {
      setResults([]);
      return;
    }

    const result = globalThis.sectionIndex.search(newValue, 5, {
      enrich: true,
      suggest: true,
    });
    const results = new Map<number, Section>();

    result.forEach((item) =>
      item.result.forEach((id) => results.set(Number(id), idToSection.get(Number(id)))),
    );

    setResults([...results.values()]);
  }

  const searchIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none absolute right-[9px] top-[9px]"
    >
      <path
        d="M12.2929 13.7071C12.6834 14.0976 13.3166 14.0976 13.7071 13.7071C14.0976 13.3166 14.0976 12.6834 13.7071 12.2929L12.2929 13.7071ZM13.7071 12.2929L8.70711 7.29289L7.29289 8.70711L12.2929 13.7071L13.7071 12.2929Z"
        fill="#6B7176"
      />
      <circle cx="5.5" cy="5.5" r="4.5" stroke="#6B7176" stroke-width="2" />
    </svg>
  );

  const triggerButton = (
    <button
      className={twMerge(
        outline,
        "relative flex h-8 flex-1 shrink-0 cursor-pointer items-center rounded-md border border-mauvedark5 bg-mauvedark2 px-2 text-sm text-mauvedark10",
      )}
    >
      Search...
      <SearchKeys />
    </button>
  );

  const closeButton = (
    <button
      className={twMerge(
        outline,
        "flex h-8 w-8 select-none items-center justify-center rounded-full text-3xl text-mauvedark12",
      )}
    >
      ✗
    </button>
  );

  const resultsSection = results.map((result) => {
    return (
      <Link
        key={result.url}
        onClick={() => {
          setOpen(false);
        }}
        href={result.url}
        className={twMerge(
          outline,
          "block overflow-hidden rounded-md border border-mauvedark6 px-4 py-3 text-mauvedark12 hover:bg-mauvedark3 focus-visible:border-transparent",
        )}
      >
        <div className="flex flex-col items-start gap-1">
          <span className="font-semibold">
            <HighlightMatches match={search} value={result.header} />
          </span>
          <div className="inline text-sm">
            <HighlightMatches match={search} value={result.content} />
          </div>
        </div>
      </Link>
    );
  });

  const placeholder = results.length === 0 && (
    <div className="block overflow-hidden rounded-md border border-mauvedark6 p-4 text-sm text-mauvedark10">
      No results. Try changing your query.
    </div>
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open: boolean) => {
        setSearch("");
        setResults([]);
        setOpen(open);
      }}
    >
      <Dialog.Trigger asChild>{triggerButton}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-10 flex justify-center bg-[rgba(0,0,0,0.4)] pt-32">
          <Dialog.Content
            className="scrollbar fixed flex max-h-[calc(100dvh-128px-32px)] w-[600px] max-w-[calc(100dvw-32px)] flex-col gap-3 overflow-hidden overflow-y-auto rounded-md border border-mauvedark5 bg-mauvedark2 p-6"
            tabIndex={-1}
          >
            <div className="flex justify-between">
              <H2 className="my-0" noLink>
                Search
              </H2>
              <Dialog.Close asChild>{closeButton}</Dialog.Close>
            </div>
            <div className="relative">
              <input
                autoFocus
                className={twMerge(
                  outline,
                  "relative flex h-8 w-full shrink-0 items-center rounded-md border border-mauvedark5 bg-mauvedark1 px-2 text-sm text-mauvedark12 placeholder:text-mauvedark10 focus-visible:border-transparent",
                )}
                placeholder="Search…"
                onChange={onChange}
                value={search}
              />
              {searchIcon}
            </div>
            <div className="flex flex-col gap-2">
              {placeholder}
              {resultsSection}
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type KeyProps = {
  children: string;
  className?: string;
};

function Key({ children, className }: KeyProps) {
  return (
    <span
      className={twMerge(
        "box-content flex h-[22px] select-none items-center justify-center rounded bg-mauvedark5 px-1.5 text-xs text-mauvedark12",
        className,
      )}
    >
      {children}
    </span>
  );
}

const SearchKeys = withClient(function SearchKeys() {
  return (
    <div className="absolute right-1 top-1 flex gap-1">
      <Key className="right-7">{getPlatform() === "mac" ? "⌘" : "CTRL"}</Key>
      <Key className="right-1">K</Key>
    </div>
  );
});
