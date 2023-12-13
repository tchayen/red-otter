import types from "../types.json";
import { ApiBlock, Class, Function } from "../components/ApiBlocks";
import { Hr } from "../components/tags";

export function Api() {
  return (
    <ApiBlock>
      {Object.values(types.functions)
        .filter((f) => f.source.startsWith("/font"))
        .map((f, i) => {
          return (
            <>
              <Hr />
              <Function key={f.name} f={f} id={String(i + 1)} />
            </>
          );
        })}
      {Object.values(types.classes)
        .filter((c) => c.source.startsWith("/font"))
        .map((c, i) => {
          return (
            <>
              <Hr />
              <Class key={c.name} c={c} id={String(i + 1)} />
            </>
          );
        })}
    </ApiBlock>
  );
}
