import types from "../types.json";
import { H2 } from "../components/tags";
import { Class, Function } from "../components/ApiBlocks";

export function MathApi() {
  return (
    <>
      <H2>Classes</H2>
      {Object.values(types.classes)
        .filter((c) => c.source.startsWith("/math"))
        .map((c) => {
          return <Class key={c.name} c={c} />;
        })}
      <H2>Functions</H2>
      {Object.values(types.functions)
        .filter((f) => f.source.startsWith("/math"))
        .map((f) => {
          return <Function key={f.name} f={f} />;
        })}
    </>
  );
}
