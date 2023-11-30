"use client";

import type { PropsWithChildren } from "react";
import types from "./types.json";
import { twMerge } from "tailwind-merge";
import { A, Code, Em, H2, Li, P, Ul } from "./tags";
import * as Tooltip from "@radix-ui/react-tooltip";

// TODO:
// - Restore favicon and logo.
// - Switch this page to be markdown.
// - Figure out a way to share introduction text between this and README.md.
// - Fix scrollbar missing colors.
// - Set text selection color.
// - Add enums and make underlined mentions of them links to their definition.

type Field = {
  name: string;
  type: string;
  description: string;
  default: string;
};

type Types = Record<
  string,
  {
    name: string;
    description: string;
    properties: Record<string, Field>;
  }
>;

type Enum = {
  name: string;
  description: string;
  values: Array<{
    name: string;
    description: string;
  }>;
};

export default function Home() {
  return (
    <main className="mx-auto flex w-[800px] flex-col gap-3">
      <h1>red-otter</h1>
      <Tooltip.Provider>
        <P>Some differences (or unobvious cases) from RN and/or CSS:</P>
        <Ul>
          <Li>
            Default <Code>flexDirection</Code> is <Code>column</Code> (CSS
            default is <Code>row</Code>).
          </Li>
          <Li>
            Default <Code>alignContent</Code> is <Code>flex-start</Code> (CSS
            default is
            <Code>stretch</Code>).
          </Li>
          <Li>
            Default <Code>flexShrink</Code> is <Code>0</Code> (CSS default is{" "}
            <Code>1</Code>
            ).
          </Li>
          <Li>
            <Code>flexBasis</Code> takes precedence over <Code>width</Code> and{" "}
            <Code>height</Code> if defined.
          </Li>
          <Li>
            There's no <Code>margin: auto</Code>.
          </Li>
          <Li>
            Similarly to CSS and RN, if both top and bottom (or left and right)
            are defined and <Code>height</Code> (or <Code>width</Code>) is{" "}
            <Em>not</Em> defined, the element will span the distance between
            those two edges.
          </Li>
          <Li>
            Properties with higher specificity override properties with lower
            specificity (in CSS order matters). In CSS{" "}
            <Code>style="flex-grow: 1; flex: 2"</Code> would use value{" "}
            <Code>2</Code> for <Code>flex-grow</Code> because it is defined
            later. Here corresponding code would use value <Code>1</Code> for
            <Code>flex-grow</Code> because it is more specific. Same goes for
            <Code>margin</Code>, <Code>padding</Code>, <Code>borderWidth</Code>,{" "}
            <Code>gap</Code>.
          </Li>
          <Li>
            <Code>box-sizing</Code> is always <Code>border-box</Code>, which
            means that
            <Code>width</Code> and <Code>height</Code> include both{" "}
            <Code>padding</Code>
            and <Code>border</Code> (CSS default is <Code>content-box</Code>).
          </Li>
        </Ul>
        <H2>LayoutProps</H2>
        <TypeTable type="LayoutProps" />
        <H2>DecorativeProps</H2>
        <P>Decorative props are used in combination with layout props.</P>
        <TypeTable type="DecorativeProps" />
        <H2>TextStyleProps</H2>
        <P>
          Control how text is rendered. Note that due to a custom text renderer,
          there might be some differences in how text is rendered compared to a
          browser.
        </P>
        <P>
          The library uses cap size as opposed to line height for calculating
          bounding box of text elements (see{" "}
          <A href="https://seek-oss.github.io/capsize/">CapSize</A> for more
          explanation). This results in most noticeable differences in buttons
          which require more vertical space than in browsers.
        </P>
        <TypeTable type="TextStyleProps" />
        <TypeTable type="LayoutNodeState" />
      </Tooltip.Provider>
    </main>
  );
}

function TypeTable({ type }: { type: keyof typeof types.types }) {
  const t = types as { types: Types; enums: Array<Enum> };

  return (
    <div
      style={{
        gridTemplateColumns: "min-content min-content min-content auto",
      }}
      className="grid overflow-hidden rounded-md border border-slatedark6 bg-slatedark2"
    >
      <Cell className="whitespace-nowrap border-t-0 bg-slatedark3 font-semibold text-slatedark12">
        Name
      </Cell>
      <Cell className="whitespace-nowrap border-t-0 bg-slatedark3 font-semibold text-slatedark12">
        Type
      </Cell>
      <Cell className="whitespace-nowrap border-t-0 bg-slatedark3 font-semibold text-slatedark12">
        Default value
      </Cell>
      <Cell className="whitespace-nowrap border-t-0 bg-slatedark3 font-semibold text-slatedark12">
        Description
      </Cell>
      {Object.values(t.types[type].properties).map((field) => {
        const enumType = types.enums.find((e) => e.name === field.type);
        return (
          <>
            <Cell>{field.name}</Cell>
            <Cell className="whitespace-nowrap">
              {enumType ? (
                <Tooltip.Root>
                  <Tooltip.Trigger>
                    <Code className="underline">{field.type}</Code>
                  </Tooltip.Trigger>
                  <Tooltip.Content className="rounded-md bg-black px-3 py-2">
                    <h3 className="text-lg font-bold text-slatedark12">
                      {enumType.name}
                    </h3>
                    <span className="text-slatedark10">
                      {enumType.description}
                    </span>
                    <ul className="list-disc pl-5">
                      {enumType.values.map((value) => (
                        <li>
                          <Code>{value.name}</Code>
                          {value.description && (
                            <span className="text-slatedark10">
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
          </>
        );
      })}
    </div>
  );
}

function Cell({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={twMerge(
        "border-t border-slatedark6 px-3 py-2 text-sm text-slatedark11",
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
