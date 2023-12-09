import types from "../types.json";
import { Function } from "../components/ApiBlocks";

export function LayoutApi() {
  return (
    <>
      {Object.values(types.functions)
        .filter((f) => f.source.startsWith("/layout"))
        .filter((f) => !f.name.includes("Props")) // Those are covered in styling.
        .map((f, i) => {
          return <Function key={f.name} f={f} id={String(i + 1)} />;
        })}
    </>
  );
}
