import * as Dialog from "@radix-ui/react-dialog";
import { twMerge } from "tailwind-merge";
import FlexSearch from "flexsearch";
import { useEffect, useState } from "react";
import type { Page, Section } from "./search/route";
import { H2, outline } from "./tags";
import { HighlightMatches } from "./HighlightMatches";
import { withClient } from "./withClient";

declare let sectionIndex: FlexSearch.Document<{
  content: string;
  header: string;
  id: number;
  url: string;
}> | null;

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

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open: boolean) => {
        setSearch("");
        setResults([]);
        setOpen(open);
        console.log(sectionIndex);
      }}
    >
      <Dialog.Trigger asChild>
        <button
          className={twMerge(
            outline,
            "relative flex h-8 w-full shrink-0 cursor-pointer items-center rounded-md border border-mauvedark5 bg-mauvedark3 px-2 text-sm text-mauvedark10",
          )}
        >
          Search...
          <SearchKeys />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 flex justify-center bg-[rgba(0,0,0,0.4)] pt-32">
          <Dialog.Content className="scrollbar fixed flex max-h-[calc(100dvh-32px)] w-[600px] max-w-[calc(100dvw-32px)] flex-col gap-3 overflow-hidden overflow-y-auto rounded-md border border-mauvedark5 bg-mauvedark2 p-8">
            <H2 className="my-0">Search</H2>
            <Dialog.Close asChild>
              <button className="absolute right-4 top-4 flex h-8 w-8 select-none items-center justify-center rounded-full text-3xl text-mauvedark12">
                ✗
              </button>
            </Dialog.Close>
            <input
              autoFocus
              placeholder="Search…"
              value={search}
              onChange={(event) => {
                let newValue = event.target.value;
                setSearch(newValue);
                newValue = newValue.trim();

                if (newValue === search) {
                  return;
                }
                if (newValue.length < 3) {
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
              }}
              className={twMerge(
                outline,
                "relative flex h-8 w-full shrink-0 items-center rounded-md bg-mauvedark4 px-2 text-sm text-mauvedark12 placeholder:text-mauvedark10",
              )}
            />
            <div className="flex flex-col gap-2">
              {results.length === 0 && (
                <div className="block overflow-hidden rounded-md border border-mauvedark6 p-2 text-sm text-mauvedark10">
                  No results. Try changing your query.
                </div>
              )}
              {results.map((result) => {
                return (
                  <a
                    onClick={() => {
                      setOpen(false);
                    }}
                    href={result.url}
                    className={twMerge(
                      outline,
                      "block overflow-hidden rounded-md border border-mauvedark6 p-2 text-mauvedark12 hover:bg-mauvedark3 focus:border-transparent",
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
                  </a>
                );
              })}
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Key({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={twMerge(
        "box-content flex h-[22px] select-none items-center justify-center rounded bg-mauvedark7 px-1.5 text-xs text-mauvedark12",
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
