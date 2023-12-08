import { Fragment } from "react";
import types from "../types.json";
import { CodeBlock } from "./CodeBlock";
import { H2, H3 } from "./tags";
import { Markdown } from "./Markdown";

export function LayoutApi() {
  return (
    <>
      <H2>API</H2>
      {Object.values(types.functions)
        .filter((f) => f.source.startsWith("/layout"))
        .filter((f) => !f.name.includes("Props")) // Those are covered in styling.
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
    </>
  );
}
