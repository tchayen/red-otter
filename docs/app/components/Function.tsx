import { Fragment } from "react";
import { CodeBlock } from "./CodeBlock";
import { Table } from "./Table";
import { Code, H3, H4, Hr } from "./tags";
import { Markdown } from "./Markdown";

type Field = {
  default: string;
  description: string;
  name: string;
  type: string;
};

type FunctionData = {
  description: string;
  name: string;
  parameters: Record<string, Field>;
  returnDescription: string;
  returnType: string;
  source: string;
  typeSignature: string;
};

export function Function({ f }: { f: FunctionData }) {
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
