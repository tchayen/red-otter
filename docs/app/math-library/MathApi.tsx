import types from "../types.json";
import { Class, Function } from "../components/ApiBlocks";

export function MathApi() {
  return (
    <>
      {Object.values(types.classes)
        .filter((c) => c.source.startsWith("/math"))
        .map((c, i) => {
          return <Class key={c.name} c={c} id={String(i + 1)} />;
        })}
      {Object.values(types.functions)
        .filter((f) => f.source.startsWith("/math"))
        .map((f, i) => {
          return <Function key={f.name} f={f} id={String(i + 1)} />;
        })}
    </>
  );
}
