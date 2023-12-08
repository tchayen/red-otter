import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import _ from "lodash";
import { twMerge } from "tailwind-merge";

type Header = {
  id: string;
  level: number;
  text: string;
};

const SCROLL_OFFSET = 33; // scroll-mt-8 + 1.

export function Outline() {
  const pathname = usePathname();
  const [headers, setHeaders] = useState<Array<Header>>([]);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(
    _.throttle(() => {
      const index = headers
        .map((header) => {
          const element = document.getElementById(header.id);
          return element.getBoundingClientRect().top - SCROLL_OFFSET;
        })
        .findIndex((element) => element > 0);
      setActive(Math.max(0, index === -1 ? headers.length - 1 : index - 1));
    }, 150),
    [],
  );

  useEffect(() => {
    document.addEventListener("scroll", onScroll);
    return () => {
      document.removeEventListener("scroll", onScroll);
    };
  }, [onScroll]);

  useEffect(() => {
    setHeaders(
      [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((header) => {
        return {
          id: header.id,
          level: Number.parseInt(header.tagName[1], 10),
          text: header.textContent,
        };
      }),
    );
  }, [pathname]);

  return (
    <div className="sticky top-0 hidden h-[100dvh] w-64 flex-col gap-2 p-3 pt-[72px] text-sm text-mauvedark10 xl:flex">
      <span className="font-semibold text-mauvedark12">On this page</span>
      {headers.map((header, i) => {
        return (
          <div key={header.id} className={twMerge("flex", i === active && "text-tomato9")}>
            {Array.from({ length: header.level - 1 })
              .fill(undefined)
              .map((_, i) => (
                <div key={i} className="w-4" />
              ))}
            <a href={`#${header.id}`} onClick={() => setActive(i)}>
              {header.text}
            </a>
          </div>
        );
      })}
    </div>
  );
}
