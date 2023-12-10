import types from "../types.json";
import { Class } from "../components/ApiBlocks";

export function Api() {
  return (
    <>
      {Object.values(types.classes)
        .filter((c) => c.source.startsWith("/EventManager"))
        .map((c, i) => {
          return <Class key={c.name} c={c} id={String(i + 1)} />;
        })}
    </>
  );
}
