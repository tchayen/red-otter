import { H2, H4, P } from "./tags";
import types from "../types.json";
import { Table } from "./Table";
import { Fragment } from "react";
import { Markdown } from "./Markdown";

export function Enums() {
  return (
    <>
      <H2>Enums</H2>
      <P>List of enums used in the types above.</P>
      {types.enums
        .filter((e) => e.source.startsWith("/layout/styling.ts"))
        .map((e) => {
          return (
            <>
              <H4>{e.name}</H4>
              <Markdown>{e.description}</Markdown>
              <Table.Root columns="min-content auto">
                <Table.HeaderCell>Value</Table.HeaderCell>
                <Table.HeaderCell>Description</Table.HeaderCell>
                {e.values.map((v) => {
                  return (
                    <Fragment key={e.name}>
                      <Table.Cell>{v.name}</Table.Cell>
                      <Table.Cell className="[&>p]:my-0 [&>p]:text-sm">
                        <Markdown>{v.description}</Markdown>
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
