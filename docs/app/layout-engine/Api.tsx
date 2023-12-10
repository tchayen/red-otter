import types from "../types.json";
import { Class, Function } from "../components/ApiBlocks";

export function Api() {
  return (
    <>
      {Object.values(types.functions)
        .filter((f) => f.source.startsWith("/layout"))
        .filter((f) => !f.name.includes("Props")) // Those are covered in styling.
        .map((f, i) => {
          return <Function key={f.name} f={f} id={String(i + 1)} />;
        })}
      {Object.values(types.classes)
        .filter((f) => f.source.startsWith("/layout"))
        .map((c, i) => {
          return <Class key={c.name} c={c} id={String(i + 1)} />;
        })}
    </>
  );
}
