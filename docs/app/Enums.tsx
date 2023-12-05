import { H2, H4, P } from "./tags";
import types from "./types.json";

export function Enums() {
  return (
    <>
      <H2>Enums</H2>
      <P>List of enums used in the types above.</P>
      {types.enums.map((e) => {
        return (
          <>
            <H4>{e.name}</H4>
            <P>{e.description}</P>
          </>
        );
      })}
    </>
  );
}
