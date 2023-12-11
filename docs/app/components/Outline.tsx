import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import _ from "lodash";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { outline } from "./tags";

type Header = {
  id: string;
  level: number;
  text: string;
};

const SCROLL_OFFSET = 64; // scroll-mt-16

export function Outline() {
  const pathname = usePathname();
  const [headers, setHeaders] = useState<Array<Header>>([]);
  const [active, setActive] = useState(0);

  const onScroll = _.throttle(() => {
    const index = headers
      .map((header) => {
        const element = document.getElementById(header.id);
        if (!element) {
          return 0;
        }
        return element.getBoundingClientRect().top - SCROLL_OFFSET;
      })
      .findIndex((element) => element > 0);
    setActive(Math.max(0, index === -1 ? headers.length - 1 : index - 1));
  }, 150);

  useEffect(() => {
    document.addEventListener("scroll", onScroll);
    return () => {
      document.removeEventListener("scroll", onScroll);
    };
  }, [onScroll]);

  useLayoutEffect(() => {
    const newHeaders = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((header) => {
      const level = Number.parseInt(header.tagName[1] ?? "", 10);
      return {
        id: header.id,
        level,
        text: header.textContent ?? "",
      };
    });
    setHeaders(newHeaders);
  }, [pathname]);

  // Execute setActive() in a timeout so that:
  // - User clicks, browser takes user to the link.
  // - The scroll event above fires and the active link is updated based on scroll (which in the
  // bottom of the screen might be something else above rather than what user clicked).
  // - The timeout fires and updates the active link to what user clicked.
  const onClick = (i: number) => () => {
    setTimeout(() => setActive(i), 0);
  };

  return (
    <div className="scrollbar flex h-full w-full flex-col gap-2 overflow-y-scroll p-3 text-sm text-mauvedark10">
      <span className="font-semibold text-mauvedark12">On this page</span>
      {headers.map((header, i) => {
        return (
          <div
            key={i}
            className={twMerge(
              "flex",
              i === active && "text-tomato9",
              i !== active && "hover:text-mauvedark11",
            )}
          >
            {Array.from({ length: header.level - 1 })
              .fill(undefined)
              .map((_, i) => (
                <div key={i} className="w-4" />
              ))}
            <Link href={`#${header.id}`} onClick={onClick(i)} className={outline}>
              {header.text}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
