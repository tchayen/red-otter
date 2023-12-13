import types from "../types.json";
import { Class, Function } from "../components/ApiBlocks";
import { Hr } from "../components/tags";

export function Api() {
  return (
    <>
      {Object.values(types.classes)
        .filter((c) => c.source.startsWith("/math"))
        .map((c, i) => {
          return (
            <>
              <Hr />
              <Class key={c.name} c={c} id={String(i + 1)} />
            </>
          );
        })}
      {Object.values(types.functions)
        .filter((f) => f.source.startsWith("/math"))
        .map((f, i) => {
          return (
            <>
              <Hr />
              <Function key={f.name} f={f} id={String(i + 1)} />
            </>
          );
        })}
    </>
  );
}
