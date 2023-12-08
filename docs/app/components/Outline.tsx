import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
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

  useLayoutEffect(() => {
    const newHeaders = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((header) => {
      return {
        id: header.id,
        level: Number.parseInt(header.tagName[1], 10),
        text: header.textContent,
      };
    });
    console.log(newHeaders);
    setHeaders(newHeaders);
  }, [pathname]);

  return (
    <div className="scrollbar sticky top-[49px] hidden h-[calc(100dvh-49px)] w-64 flex-col gap-2 overflow-y-scroll p-3 text-sm text-mauvedark10 xl:flex">
      <span className="font-semibold text-mauvedark12">On this page</span>
      {headers.map((header, i) => {
        return (
          <div key={i} className={twMerge("flex", i === active && "text-tomato9")}>
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
