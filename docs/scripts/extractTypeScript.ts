import ts from "typescript";
import fs from "node:fs";

type Field = {
  default: string;
  description: string;
  name: string;
  type: string;
};

type Types = Record<
  string,
  {
    description: string;
    name: string;
    properties: Record<string, Field>;
  }
>;

/**
 * Aim of this function is to extract TS types from layout types. The goal is to for example have
 * the Layout type extracted, with each of the field having name, type, default value, optional
 * description. Also enums should be resolved.
 */
export function extractTypeScript(fileName: string) {
  const program = ts.createProgram([fileName], {});
  const sourceFile = program.getSourceFile(fileName);
  if (sourceFile === undefined) {
    throw new Error("Source file was not found.");
  }

  const checker = program.getTypeChecker();

  const types: Types = {};

  // Process enums.
  const enums = (
    sourceFile.statements.filter((s) => ts.isEnumDeclaration(s)) as Array<ts.EnumDeclaration>
  ).map((e) => {
    return {
      description: ts.displayPartsToString(e.symbol.getDocumentationComment(checker)),
      name: e.name.escapedText,
      values: e.members.map((m) => {
        return {
          description: ts.displayPartsToString(m.symbol.getDocumentationComment(checker)),
          name: m.name.escapedText,
        };
      }),
    };
  });

  // Process types.
  (
    sourceFile.statements.filter((s) =>
      ts.isTypeAliasDeclaration(s),
    ) as Array<ts.TypeAliasDeclaration>
  ).forEach((t) => {
    const symbol: ts.Symbol = (t as any).symbol;

    const properties: Record<string, Field> = {};
    ts.forEachChild(t.type, (child) => {
      const symbol: ts.Symbol = (child as any).symbol;
      if (!symbol) {
        return;
      }
      const name = symbol.escapedName.toString();
      properties[name] = {
        default: "",
        description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
        name,
        type: checker.typeToString(checker.getTypeAtLocation(child)),
      };
    });

    const name = symbol.escapedName.toString();
    types[name] = {
      description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
      name,
      properties,
    };
  });

  // Assign defaults.
  const objects = sourceFile.statements.filter((s) =>
    ts.isVariableStatement(s),
  ) as Array<ts.VariableStatement>;

  objects.forEach((o) => {
    const name = o.declarationList.declarations[0].name.escapedText;
    const type = types[name.replace("default", "")];
    if (!type) {
      throw new Error(`Type ${name} not found.`);
    }

    o.declarationList.declarations[0].initializer.properties.forEach((p) => {
      const name = p.name.escapedText;
      const value = p.initializer.getText();

      type.properties[name] = { ...type.properties[name], default: value };
    });
  });

  return { enums, types };
}

const result = extractTypeScript(import.meta.dir + "/../../src/types.ts");
fs.writeFileSync(import.meta.dir + "/../app/types.json", JSON.stringify(result, null, 2));
