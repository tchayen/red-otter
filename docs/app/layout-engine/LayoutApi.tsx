import types from "../types.json";
import { H2 } from "../components/tags";
import { Function } from "../components/ApiBlocks";

export function LayoutApi() {
  return (
    <>
      <H2>API</H2>
      {Object.values(types.functions)
        .filter((f) => f.source.startsWith("/layout"))
        .filter((f) => !f.name.includes("Props")) // Those are covered in styling.
        .map((f) => {
          return <Function key={f.name} f={f} />;
        })}
    </>
  );
}