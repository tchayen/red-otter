import type { PropsWithChildren } from "react";
import { Fragment } from "react";
import types from "../types.json";
import { Table } from "./Table";
import { Code, H3, Hr, P, Strong, slugify } from "./tags";
import { Markdown } from "./Markdown";
import { CodeBlock } from "./CodeBlock";
import { TypeTooltip } from "./TypeTooltip";
import Link from "next/link";

function Header({
  label,
  id,
  type,
  suffix,
}: {
  id: string;
  label: string;
  suffix?: string;
  type: string;
}) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="italic text-mauvedark10">{type}</span>
      <H3 id={`${id}-${slugify(label)}`}>{label}</H3>
      <span className="italic text-mauvedark10">{suffix}</span>
    </div>
  );
}

export function Class({ c, id }: { c: ClassType; id: string }) {
  return (
    <>
      <Header
        label={c.name}
        id={id}
        type="class"
        suffix={c.extends ? `extends ${c.extends}` : undefined}
      />
      <Source>{c.source}</Source>
      <Markdown>{c.description}</Markdown>
      {Object.values(c.methods).length > 0 && (
        <Table.Root columns="min-content auto">
          <Table.HeaderCell>Method</Table.HeaderCell>
          <Table.HeaderCell>Type and description</Table.HeaderCell>
          {Object.values(c.methods).map((m) => {
            return (
              <Fragment key={c.name}>
                <Table.Cell>{m.name}</Table.Cell>
                <Table.Cell>
                  <Code>{m.returnType}</Code>
                  <Description>{m.description}</Description>
                </Table.Cell>
              </Fragment>
            );
          })}
        </Table.Root>
      )}
    </>
  );
}

export function Function({ f, id }: { f: FunctionType; id: string }) {
  return (
    <Fragment key={f.name}>
      <Header label={f.name} id={id} type="function" />
      <Source>{f.source}</Source>
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
                  <Description>{p.description}</Description>
                </Table.Cell>
              </Fragment>
            );
          })}
          {
            <>
              <Table.Cell className="italic">returns</Table.Cell>
              <Table.Cell>
                <Code>{f.returnType}</Code>
                <Description>{f.returnDescription}</Description>
              </Table.Cell>
            </>
          }
        </Table.Root>
      )}
      <P>
        <Strong>Type declaration</Strong>
      </P>
      <CodeBlock>
        <pre className="language-ts">{f.typeSignature}</pre>
      </CodeBlock>
      <Hr />
    </Fragment>
  );
}

export function Type({ t, id, children }: PropsWithChildren<{ id: string; t: TypeType }>) {
  const hasDefaultValues = Object.values(t.properties).some((p) => !!p.default);

  return (
    <>
      <Header label={t.name} id={id} type="type" />
      <Source>{t.source}</Source>
      <P>{t.description}</P>
      {children}
      <Table.Root columns={hasDefaultValues ? "min-content min-content auto" : "min-content auto"}>
        <Table.HeaderCell>Name</Table.HeaderCell>
        {hasDefaultValues && <Table.HeaderCell>Default value</Table.HeaderCell>}
        <Table.HeaderCell>Type and description</Table.HeaderCell>
        {Object.values(t.properties).map((field) => {
          const enumType = types.enums.find((e) => e.name === field.type);
          return (
            <Fragment key={field.name}>
              <Table.Cell>
                <span>{field.name}</span>
              </Table.Cell>
              {hasDefaultValues && (
                <Table.Cell className="whitespace-nowrap">
                  <Code className="text-[13px]">{shortenDefault(field.default)}</Code>
                </Table.Cell>
              )}
              <Table.Cell>
                {enumType ? (
                  <TypeTooltip field={field} enumType={enumType} />
                ) : (
                  replacePercentage(field.type)
                )}
                <Description>{field.description}</Description>
              </Table.Cell>
            </Fragment>
          );
        })}
      </Table.Root>
    </>
  );
}

function Description({ children }: { children: string }) {
  if (!children) {
    return null;
  }

  return <div className="mt-1 [&>p]:my-0 [&>p]:text-sm">{<Markdown>{children}</Markdown>}</div>;
}

export function Interface({
  i,
  id,
  children,
}: PropsWithChildren<{ i: InterfaceType; id: string }>) {
  const hasDefaultValues = Object.values(i.properties).some((p) => !!p.default);
  return (
    <>
      <Header label={i.name} id={id} type="interface" />
      <Source>{i.source}</Source>
      <P>{i.description}</P>
      {children}
      {Object.values(i.properties).length > 0 && (
        <Table.Root
          columns={hasDefaultValues ? "min-content min-content auto" : "min-content auto"}
        >
          <Table.HeaderCell>Name</Table.HeaderCell>
          {hasDefaultValues && <Table.HeaderCell>Default value</Table.HeaderCell>}
          <Table.HeaderCell>Type and description</Table.HeaderCell>
          {Object.values(i.properties).map((field) => {
            const enumType = types.enums.find((e) => e.name === field.type);
            return (
              <Fragment key={field.name}>
                <Table.Cell>
                  <span>{field.name}</span>
                </Table.Cell>
                {hasDefaultValues && (
                  <Table.Cell className="whitespace-nowrap">
                    <Code className="text-[13px]">{shortenDefault(field.default)}</Code>
                  </Table.Cell>
                )}
                <Table.Cell>
                  {enumType ? (
                    <TypeTooltip field={field} enumType={enumType} />
                  ) : (
                    replacePercentage(field.type)
                  )}
                  <Description>{i.description}</Description>
                </Table.Cell>
              </Fragment>
            );
          })}
        </Table.Root>
      )}
      {Object.values(i.methods).length > 0 && (
        <Table.Root columns="min-content auto">
          <Table.HeaderCell>Method</Table.HeaderCell>
          <Table.HeaderCell>Type and description</Table.HeaderCell>
          {Object.values(i.methods).map((m) => {
            return (
              <Fragment key={i.name}>
                <Table.Cell>{m.name}</Table.Cell>
                <Table.Cell>
                  <Code>{m.returnType}</Code>
                  <Description>{m.description}</Description>
                </Table.Cell>
              </Fragment>
            );
          })}
        </Table.Root>
      )}
    </>
  );
}

const gitBranch = "big-reset"; // TODO release: change to "main".

function Source({ children }: { children: string }) {
  return (
    <Link
      target="_blank"
      href={`https://github.com/tchayen/red-otter/tree/${gitBranch}/src${children}`}
    >
      <Code className="text-xs text-mauvedark11 decoration-mauvedark10 underline-offset-2 hover:underline">
        {children}
      </Code>
    </Link>
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

export type InterfaceType = {
  description: string;
  methods: Record<string, MethodType>;
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
  extends?: string;
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
