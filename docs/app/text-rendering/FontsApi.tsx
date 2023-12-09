import types from "../types.json";
import { Class, Function } from "../components/ApiBlocks";

export function FontsApi() {
  return (
    <>
      {Object.values(types.functions)
        .filter((f) => f.source.startsWith("/font"))
        .map((f, i) => {
          return <Function key={f.name} f={f} id={String(i + 1)} />;
        })}
      {Object.values(types.classes)
        .filter((c) => c.source.startsWith("/font"))
        .map((c, i) => {
          return <Class key={c.name} c={c} id={String(i + 1)} />;
        })}
    </>
  );
}
