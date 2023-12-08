import { Fragment } from "react";
import types from "../types.json";
import { CodeBlock } from "./CodeBlock";
import { Table } from "./Table";
import { Code, H2, H3 } from "./tags";
import { Markdown } from "./Markdown";

export function FontsApi() {
  return (
    <>
      <H2>Functions</H2>
      {Object.values(types.functions)
        .filter((f) => f.source.startsWith("/font"))
        .map((f) => {
          return (
            <Fragment key={f.name}>
              <H3>{f.name}</H3>
              <Markdown>{f.description}</Markdown>
              <CodeBlock>
                <pre className="language-ts">{f.returnType}</pre>
              </CodeBlock>
            </Fragment>
          );
        })}
      <H2>Classes</H2>
      {Object.values(types.classes)
        .filter((c) => c.source.startsWith("/font"))
        .map((c) => {
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
                        <div className="mt-1 [&>p]:text-sm">
                          {<Markdown>{m.description}</Markdown>}
                        </div>
                      </Table.Cell>
                    </Fragment>
                  );
                })}
              </Table.Root>
            </>
          );
        })}
    </>
  );
}
