import types from "../types.json";
import { Code, H2, P } from "./tags";
import { Fragment, type PropsWithChildren } from "react";
import { TypeTooltip } from "./TypeTooltip";
import { Table } from "./Table";

export type Field = {
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

export type Enum = {
  description: string;
  name: string;
  values: Array<{
    description: string;
    name: string;
  }>;
};

type TypeTableProps = PropsWithChildren<{ type: keyof typeof types.types }>;

export function TypeTable({ type, children }: TypeTableProps) {
  const t = types as { enums: Array<Enum>; types: Types };
  return (
    <>
      <H2>{t.types[type].name}</H2>
      <P>{t.types[type].description}</P>
      {children}
      <Table.Root>
        <Table.HeaderCell>Name</Table.HeaderCell>
        <Table.HeaderCell>Type</Table.HeaderCell>
        <Table.HeaderCell>Default value</Table.HeaderCell>
        <Table.HeaderCell>Description</Table.HeaderCell>
        {Object.values(t.types[type].properties).map((field) => {
          const enumType = types.enums.find((e) => e.name === field.type);
          return (
            <Fragment key={field.name}>
              <Table.Cell>
                <span>{field.name}</span>
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap">
                {enumType ? (
                  <TypeTooltip field={field} enumType={enumType} />
                ) : (
                  replacePercentage(field.type)
                )}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap">
                <Code className="text-[13px]">{shortenDefault(field.default)}</Code>
              </Table.Cell>
              <Table.Cell>
                <Description>{field.description}</Description>
              </Table.Cell>
            </Fragment>
          );
        })}
      </Table.Root>
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

type DescriptionProps = { children: string };

function Description({ children }: DescriptionProps) {
  const splitOnCode = children.split(/(`.*?`)/).map((s, i) => {
    return <Fragment key={i}>{s.startsWith("`") ? <Code>{s.slice(1, -1)}</Code> : s}</Fragment>;
  });
  return <div>{splitOnCode}</div>;
}
