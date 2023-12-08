import { Fragment } from "react";
import types from "../types.json";
import { Table } from "./Table";
import { Code, H2, H3 } from "./tags";
import { Markdown } from "./Markdown";
import { CodeBlock } from "./CodeBlock";

export function MathApi() {
  return (
    <>
      <H2>Classes</H2>
      {Object.values(types.classes)
        .filter((c) => c.source.startsWith("/math"))
        .map((c) => {
          return (
            <>
              <H3>{c.name}</H3>
              <Table.Root columns="min-content auto">
                <Table.HeaderCell>Method</Table.HeaderCell>
                <Table.HeaderCell>Type and description</Table.HeaderCell>
                {Object.values(c.methods).map((m) => {
                  return (
                    <Fragment key={m.name}>
                      <Table.Cell>{m.name}</Table.Cell>
                      <Table.Cell>
                        <Code>{m.returnType}</Code>
                        <div className="mt-1 [&>p]:text-sm">
                          <Markdown>{m.description}</Markdown>
                        </div>
                      </Table.Cell>
                    </Fragment>
                  );
                })}
              </Table.Root>
            </>
          );
        })}
      <H2>Functions</H2>
      {Object.values(types.functions)
        .filter((f) => f.source.startsWith("/math"))
        .map((f) => {
          return (
            <Fragment key={f.name}>
              <H3>{f.name}</H3>
              <Markdown>{f.description}</Markdown>
              <CodeBlock>
                <pre className="language-ts">{f.typeSignature}</pre>
              </CodeBlock>
            </Fragment>
          );
        })}
    </>
  );
}
