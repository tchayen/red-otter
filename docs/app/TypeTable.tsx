"use client";
import types from "./types.json";
import { Code, H2, P, slugify } from "./tags";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { PropsWithChildren } from "react";
import { Fragment } from "react";
import { twMerge } from "tailwind-merge";

type Field = {
  default: string;
  description: string;
  name: string;
  type: string;
};

type Types = Record<
  string,
  {
    description: string;
    name: string;
    properties: Record<string, Field>;
  }
>;

type Enum = {
  description: string;
  name: string;
  values: Array<{
    description: string;
    name: string;
  }>;
};

export function TypeTable({
  type,
  children,
}: PropsWithChildren<{ type: keyof typeof types.types }>) {
  const t = types as { enums: Array<Enum>; types: Types };

  return (
    <>
      <H2>{t.types[type].name}</H2>
      <P>{t.types[type].description}</P>
      {children}
      <div
        style={{
          gridTemplateColumns: "min-content min-content min-content auto",
        }}
        className="my-4 grid overflow-x-auto rounded-md border border-mauvedark6 bg-mauvedark2"
      >
        <Cell className="whitespace-nowrap border-t-0 bg-mauvedark3 font-semibold text-mauvedark12">
          Name
        </Cell>
        <Cell className="whitespace-nowrap border-t-0 bg-mauvedark3 font-semibold text-mauvedark12">
          Type
        </Cell>
        <Cell className="whitespace-nowrap border-t-0 bg-mauvedark3 font-semibold text-mauvedark12">
          Default value
        </Cell>
        <Cell className="whitespace-nowrap border-t-0 bg-mauvedark3 font-semibold text-mauvedark12">
          Description
        </Cell>
        {Object.values(t.types[type].properties).map((field) => {
          const enumType = types.enums.find((e) => e.name === field.type);
          return (
            <Fragment key={field.name}>
              <Cell>{field.name}</Cell>
              <Cell className="whitespace-nowrap">
                {enumType ? (
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <a
                        href={`#${slugify(field.type)}`}
                        className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-orangedark9"
                      >
                        <Code className="text-[13px] underline">{field.type}</Code>
                      </a>
                    </Tooltip.Trigger>
                    <Tooltip.Content sideOffset={4} className="rounded-md bg-black px-3 py-2">
                      <Tooltip.Arrow />
                      <h3 className="text-lg font-bold text-mauvedark12">{enumType.name}</h3>
                      <span className="text-mauvedark10">{enumType.description}</span>
                      <ul className="text-mauvedark10">
                        {enumType.values.map((value) => (
                          <li key={value.name} className="my-1">
                            <Code>{value.name}</Code>
                            {value.description && <span> – {value.description}</span>}
                          </li>
                        ))}
                      </ul>
                    </Tooltip.Content>
                  </Tooltip.Root>
                ) : (
                  replacePercentage(field.type)
                )}
              </Cell>
              <Cell className="whitespace-nowrap">
                <Code className="text-[13px]">{shortenDefault(field.default)}</Code>
              </Cell>
              <Cell>
                <Description>{field.description}</Description>
              </Cell>
            </Fragment>
          );
        })}
      </div>
    </>
  );
}

function replacePercentage(value: string) {
  if (value === "number | `${number}%`") {
    return (
      <>
        <Code className="text-[13px]">number</Code> or{" "}
        <Code className="text-[13px]">{'"${n}%"'}</Code>
      </>
    );
  }

  return <Code className="text-[13px]">{value}</Code>;
}

function shortenDefault(value: string) {
  if (value.includes(".")) {
    return value.split(".")[1];
  }

  return value;
}

function Cell({ children, className }: PropsWithChildren<{ className?: string }>) {
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

function Description({ children, className }: { children: string; className?: string }) {
  const splitOnCode = children
    .split(/(`.*?`)/)
    .map((s) => (s.startsWith("`") ? <Code>{s.slice(1, -1)}</Code> : s));
  return <div>{splitOnCode}</div>;
}
