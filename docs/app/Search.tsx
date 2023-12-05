// TODO:
// - Figure out how to write a plugin(?) that will extract search info in build time.
// - at module level generate indexes on startup (or technically first file import?).
import * as Dialog from "@radix-ui/react-dialog";
import { twMerge } from "tailwind-merge";
import type FlexSearch from "flexsearch";
import { useRouter } from "next/navigation";

type PageIndex = FlexSearch.Document<
  {
    content: string;
    id: number;
    title: string;
  },
  ["title"]
>;

type SectionIndex = FlexSearch.Document<
  {
    content: string;
    display?: string;
    id: string;
    pageId: string;
    title: string;
    url: string;
  },
  ["title", "content", "url", "display"]
>;

const indexes: {
  [locale: string]: [PageIndex, SectionIndex];
} = {};

export function Search() {
  const { basePath } = useRouter();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          onClick={() => {
            //
          }}
          className="relative mb-3 mt-1 flex h-7 w-full cursor-pointer items-center rounded-md bg-mauvedark4 px-2 text-sm text-mauvedark10"
        >
          Search...
          <Key className="right-7">⌘</Key>
          <Key className="right-1">K</Key>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-40" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-mauvedark2 p-16">
          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 flex h-8 w-8 select-none items-center justify-center rounded-full text-3xl text-mauvedark12">
              ✗
            </button>
          </Dialog.Close>
          <input
            onClick={() => {
              //
            }}
            placeholder="Search…"
            className="relative flex h-7 w-full items-center rounded-md border border-mauvedark4 bg-mauvedark4 px-2 text-sm text-mauvedark12 outline-none placeholder:text-mauvedark10 focus:border-bluedark8"
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Key({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={twMerge(
        "absolute top-1 box-content flex h-5 w-5 select-none items-center justify-center rounded-[4px] border-b-2 border-mauvedark1 bg-mauvedark7 text-sm text-mauvedark12",
        className,
      )}
    >
      {children}
    </span>
  );
}
