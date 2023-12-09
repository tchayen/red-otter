import { Fragment } from "react";
import { Table } from "./Table";
import { Code, H3, H4, Hr } from "./tags";
import { Markdown } from "./Markdown";
import { CodeBlock } from "./CodeBlock";

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
