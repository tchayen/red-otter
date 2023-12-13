import types from "../types.json";
import { Class, Function, Interface } from "../components/ApiBlocks";
import { Hr } from "../components/tags";

export function Api() {
  return (
    <>
      {Object.values(types.functions)
        .filter((f) => f.source.startsWith("/renderer"))
        .map((f, index) => {
          return (
            <>
              <Function key={f.name} f={f} id={String(index + 1)} />
              <Hr />
            </>
          );
        })}
      {Object.values(types.interfaces)
        .filter((f) => f.source.startsWith("/renderer"))
        .map((i, index) => {
          return (
            <>
              <Interface key={i.name} i={i} id={String(index + 1)} />
              <Hr />
            </>
          );
        })}
      {Object.values(types.classes)
        .filter((c) => c.source.startsWith("/renderer"))
        .map((c, index) => {
          return <Class key={c.name} c={c} id={String(index + 1)} />;
        })}
    </>
  );
}
