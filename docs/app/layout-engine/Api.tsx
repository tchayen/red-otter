import types from "../types.json";
import { Class, Function, Interface } from "../components/ApiBlocks";

export function Api() {
  return (
    <>
      {Object.values(types.interfaces)
        .filter((i) => i.source.startsWith("/layout"))
        .filter((i) => !i.name.includes("Props")) // Those are covered in styling.
        .map((i, index) => {
          return <Interface key={i.name} i={i} id={String(index + 1)} />;
        })}
      {Object.values(types.functions)
        .filter((f) => f.source.startsWith("/layout"))
        .filter((f) => !f.name.includes("Props")) // Those are covered in styling.
        .map((f, index) => {
          return <Function key={f.name} f={f} id={String(index + 1)} />;
        })}
      {Object.values(types.classes)
        .filter((f) => f.source.startsWith("/layout"))
        .map((c, index) => {
          return <Class key={c.name} c={c} id={String(index + 1)} />;
        })}
    </>
  );
}
