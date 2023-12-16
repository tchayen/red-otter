import types from "../types.json";
import { ApiBlock, Class, Function, Interface } from "../components/ApiBlocks";
import { Hr } from "../components/tags";

export function Api() {
  return (
    <ApiBlock>
      {Object.values(types.functions)
        .filter((f) => f.source.startsWith("/renderer"))
        .map((f, index) => {
          return (
            <>
              <Hr className="my-4" />
              <Function key={f.name} f={f} id={String(index + 1)} />
            </>
          );
        })}
      {Object.values(types.interfaces)
        .filter((f) => f.source.startsWith("/renderer"))
        .map((i, index) => {
          return (
            <>
              <Hr className="my-4" />
              <Interface key={i.name} i={i} id={String(index + 1)} />
            </>
          );
        })}
      {Object.values(types.classes)
        .filter((c) => c.source.startsWith("/renderer"))
        .map((c, index) => {
          return (
            <>
              <Hr className="my-4" />
              <Class key={c.name} c={c} id={String(index + 1)} />
            </>
          );
        })}
    </ApiBlock>
  );
}
