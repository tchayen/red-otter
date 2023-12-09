import type { PropsWithChildren } from "react";
import { Fragment } from "react";
import types from "../types.json";
import { Table } from "./Table";
import { Code, H2, H3, H4, Hr, P } from "./tags";
import { Markdown } from "./Markdown";
import { CodeBlock } from "./CodeBlock";
import { TypeTooltip } from "./TypeTooltip";

export function Class({ c }: { c: ClassType }) {
  return (
    <>
      <H3 key={c.name}>{c.name}</H3>
      <Markdown>{c.description}</Markdown>
      <Table.Root columns="min-content auto">
        <Table.HeaderCell>Method</Table.HeaderCell>
        <Table.HeaderCell>Type and description</Table.HeaderCell>
        {Object.values(c.methods).map((m) => {
          return (
            <Fragment key={c.name}>
              <Table.Cell>{m.name}</Table.Cell>
              <Table.Cell>
                <Code>{m.returnType}</Code>
                <div className="mt-1 [&>p]:text-sm">{<Markdown>{m.description}</Markdown>}</div>
              </Table.Cell>
            </Fragment>
          );
        })}
      </Table.Root>
    </>
  );
}

export function Function({ f }: { f: FunctionType }) {
  return (
    <Fragment key={f.name}>
      <H3>{f.name}</H3>
      <Markdown>{f.description}</Markdown>
      {Object.values(f.parameters).length > 0 && (
        <Table.Root columns="min-content auto">
          <Table.HeaderCell>Parameter</Table.HeaderCell>
          <Table.HeaderCell>Type and description</Table.HeaderCell>
          {Object.values(f.parameters).map((p) => {
            return (
              <Fragment key={p.name}>
                <Table.Cell>{p.name}</Table.Cell>
                <Table.Cell>
                  <Code>{p.type}</Code>
                  <div className="mt-1 [&>p]:text-sm">{<Markdown>{p.description}</Markdown>}</div>
                </Table.Cell>
              </Fragment>
            );
          })}
          {
            <>
              <Table.Cell className="italic">returns</Table.Cell>
              <Table.Cell>
                <Code>{f.returnType}</Code>
                <div className="mt-1 [&>p]:text-sm">
                  <Markdown>{f.returnDescription}</Markdown>
                </div>
              </Table.Cell>
            </>
          }
        </Table.Root>
      )}
      <H4>Type declaration</H4>
      <CodeBlock>
        <pre className="language-ts">{f.typeSignature}</pre>
      </CodeBlock>
      <Hr />
    </Fragment>
  );
}

export function Type({ t, children }: PropsWithChildren<{ t: TypeType }>) {
  return (
    <>
      <H2>{t.name}</H2>
      <P>{t.description}</P>
      {children}
      <Table.Root>
        <Table.HeaderCell>Name</Table.HeaderCell>
        <Table.HeaderCell>Type</Table.HeaderCell>
        <Table.HeaderCell>Default value</Table.HeaderCell>
        <Table.HeaderCell>Description</Table.HeaderCell>
        {Object.values(t.properties).map((field) => {
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

export type FieldType = {
  default: string;
  description: string;
  name: string;
  type: string;
};

export type TypeType = {
  description: string;
  name: string;
  properties: Record<string, FieldType>;
  source: string;
};

export type FunctionType = {
  description: string;
  name: string;
  parameters: Record<string, FieldType>;
  returnDescription: string;
  returnType: string;
  source: string;
  typeSignature: string;
};

export type MethodType = {
  description: string;
  name: string;
  parameters: Record<string, FieldType>;
  returnType: string;
};

export type ClassType = {
  description: string;
  methods: Record<string, MethodType>;
  name: string;
  source: string;
};

export type EnumType = {
  description: string;
  name: string;
  source: string;
  values: Array<{
    description: string;
    name: string;
  }>;
};