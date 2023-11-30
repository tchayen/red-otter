"use client";
import types from "./types.json";
import { Code, H2, P } from "./tags";
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
        className="border-mauvedark6 bg-mauvedark2 my-4 grid overflow-hidden rounded-md border"
      >
        <Cell className="bg-mauvedark3 text-mauvedark12 whitespace-nowrap border-t-0 font-semibold">
          Name
        </Cell>
        <Cell className="bg-mauvedark3 text-mauvedark12 whitespace-nowrap border-t-0 font-semibold">
          Type
        </Cell>
        <Cell className="bg-mauvedark3 text-mauvedark12 whitespace-nowrap border-t-0 font-semibold">
          Default value
        </Cell>
        <Cell className="bg-mauvedark3 text-mauvedark12 whitespace-nowrap border-t-0 font-semibold">
          Description
        </Cell>
        {Object.values(t.types[type].properties).map((field) => {
          const enumType = types.enums.find((e) => e.name === field.type);
          return (
            <Fragment key={field.name}>
              <Cell>{field.name}</Cell>
              <Cell className="">
                {enumType ? (
                  <Tooltip.Root>
                    <Tooltip.Trigger>
                      <Code className="underline">{field.type}</Code>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      sideOffset={4}
                      className="rounded-md bg-black px-3 py-2"
                    >
                      <h3 className="text-mauvedark12 text-lg font-bold">
                        {enumType.name}
                      </h3>
                      <span className="text-mauvedark10">
                        {enumType.description}
                      </span>
                      <ul className="list-disc pl-5">
                        {enumType.values.map((value) => (
                          <li key={value.name}>
                            <Code>{value.name}</Code>
                            {value.description && (
                              <span className="text-mauvedark10">
                                {" "}
                                – {value.description}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </Tooltip.Content>
                  </Tooltip.Root>
                ) : (
                  <Code>{field.type}</Code>
                )}
              </Cell>
              <Cell>
                <Code>{field.default}</Code>
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

function Cell({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={twMerge(
        "border-mauvedark6 text-mauvedark11 border-t px-3 py-2 text-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Description({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const splitOnCode = children
    .split(/(`.*?`)/)
    .map((s) => (s.startsWith("`") ? <Code>{s.slice(1, -1)}</Code> : s));
  return <div>{splitOnCode}</div>;
}
