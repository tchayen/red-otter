import * as Dialog from "@radix-ui/react-dialog";
import { twMerge } from "tailwind-merge";
import FlexSearch from "flexsearch";
import { useEffect, useState } from "react";
import type { Page, Section } from "./search/route";
import { H2, outline } from "./tags";
import { HighlightMatches } from "./HighlightMatches";

declare let sectionIndex: FlexSearch.Document<{
  content: string;
  header: string;
  id: number;
  url: string;
}> | null;

globalThis.sectionIndex = null;

let id = 1;
const idToSection = new Map<number, Section>();

export function Search() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Array<Section>>([]);

  useEffect(() => {
    if (globalThis.sectionIndex) {
      return;
    }

    fetch("/search")
      .then((response) => response.json())
      .then((data) => {
        globalThis.sectionIndex = new FlexSearch.Document({
          cache: 100,
          context: {
            bidirectional: true,
            depth: 2,
            resolution: 9,
          },
          document: {
            id: "id",
            index: ["content", "header"],
          },
          tokenize: "full",
        });

        for (const page of data as Array<Page>) {
          for (const section of page.sections) {
            globalThis.sectionIndex.add({
              content: section.content,
              header: section.header,
              id: id,
              url: section.url,
            });
            idToSection.set(id, section);
            id += 1;
          }
        }
      });
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
            "relative mb-3 mt-1 flex h-7 w-full cursor-pointer items-center rounded-md bg-mauvedark4 px-2 text-sm text-mauvedark10",
          )}
        >
          Search...
          <Key className="right-7">⌘</Key>
          <Key className="right-1">K</Key>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-40" />
        <Dialog.Content className="fixed left-[50%] top-[50%] flex max-h-[90dvh] w-[600px] translate-x-[-50%] translate-y-[-50%] flex-col gap-3 overflow-y-auto rounded-md border border-mauvedark5 bg-mauvedark2 p-8">
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
              "relative flex h-7 w-full shrink-0 items-center rounded-md bg-mauvedark4 px-2 text-sm text-mauvedark12 placeholder:text-mauvedark10",
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
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Key({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={twMerge(
        "absolute top-1 box-content flex h-5 w-5 select-none items-center justify-center rounded border-b-2 border-mauvedark1 bg-mauvedark7 text-sm text-mauvedark12",
        className,
      )}
    >
      {children}
    </span>
  );
}
