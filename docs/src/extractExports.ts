import * as ts from "typescript";

type NodeInfo = {
  name: string;
  description: string;
};

export function extractExports(fileNames: string[]) {
  const classes: (NodeInfo & {
    methods: (NodeInfo & {
      parameters: { name: string; type: string }[];
      returnType?: string;
    })[];
    properties: (NodeInfo & { type: string })[];
  })[] = [];

  const types: (NodeInfo & {
    properties: (NodeInfo & { type: string })[];
    value?: string;
  })[] = [];

  for (const fileName of fileNames) {
    const program = ts.createProgram([fileName], {});

    const sourceFile = program.getSourceFile(fileName);
    if (!sourceFile) {
      throw new Error(`Source file ${fileName} not found.`);
    }

    const checker = program.getTypeChecker();

    const classNodes = sourceFile.statements.filter((s) =>
      ts.isClassDeclaration(s)
    ) as ts.ClassDeclaration[];

    const typeNodes = sourceFile.statements.filter((s) =>
      ts.isTypeAliasDeclaration(s)
    ) as ts.TypeAliasDeclaration[];

    for (const c of classNodes) {
      // https://github.com/microsoft/rushstack/blob/9cd3e835cd20e18bbe9e1018d63a47fae634ac3e/apps/api-extractor/src/utils/TypeScriptHelpers.ts#L71-L78
      const symbol: ts.Symbol = (c as any).symbol;

      const methodNodes = c.members.filter(
        (m) => ts.isMethodDeclaration(m) || ts.isConstructorDeclaration(m)
      ) as ts.MethodDeclaration[];

      const methods: (typeof classes)[0]["methods"] = [];
      for (const m of methodNodes) {
        const symbol: ts.Symbol = (m as any).symbol;

        const parameters = m.parameters
          .map((p) => {
            const symbol: ts.Symbol = (p as any).symbol;
            if (!symbol) {
              return;
            }

            return {
              name: symbol.escapedName?.toString() ?? "",
              type: checker.typeToString(checker.getTypeAtLocation(p)),
            };
          })
          .filter(Boolean);

        const returnType = m.type
          ? checker.typeToString(checker.getTypeAtLocation(m.type))
          : undefined;

        methods.push({
          name: symbol.escapedName?.toString() ?? "",
          description: ts.displayPartsToString(
            symbol.getDocumentationComment(checker)
          ),
          parameters: parameters as { name: string; type: string }[],
          returnType,
        });
      }

      const propertyNodes = c.members.filter((m) =>
        ts.isPropertyDeclaration(m)
      ) as ts.PropertyDeclaration[];

      const properties: (typeof classes)[0]["properties"] = [];
      for (const p of propertyNodes) {
        const symbol: ts.Symbol = (p as any).symbol;
        if (!symbol) {
          continue;
        }

        properties.push({
          name: symbol.escapedName?.toString() ?? "",
          type: checker.typeToString(checker.getTypeAtLocation(p)),
          description: ts.displayPartsToString(
            symbol.getDocumentationComment(checker)
          ),
        });
      }

      classes.push({
        name: symbol.escapedName?.toString() ?? "",
        description: ts.displayPartsToString(
          symbol.getDocumentationComment(checker)
        ),
        methods,
        properties,
      });
    }

    for (const t of typeNodes) {
      const symbol: ts.Symbol = (t as any).symbol;

      const properties: (typeof types)[0]["properties"] = [];
      ts.forEachChild(t.type, (child) => {
        const symbol: ts.Symbol = (child as any).symbol;
        if (!symbol) {
          return;
        }

        properties.push({
          name: symbol.escapedName?.toString() ?? "",
          type: checker.typeToString(checker.getTypeAtLocation(child)),
          description: ts.displayPartsToString(
            symbol.getDocumentationComment(checker)
          ),
        });
      });

      types.push({
        name: symbol.escapedName?.toString() ?? "",
        description: ts.displayPartsToString(
          symbol.getDocumentationComment(checker)
        ),
        properties,
        value: "TODO",
      });
    }
  }

  return {
    classes,
    types,
  };
}

// Example test file content:

/**
 * A moose.
 */
export type Moose = {
  /**
   * The name of the moose.
   */
  name: string;
};

/**
 * An elk.
 *
 * ```ts
 * const elk = new Elk("Bambi");
 * ```
 */
export class Elk {
  /**
   * The name of the elk.
   */
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Make the elk say something.
   */
  say(message: string) {
    console.log(`${this.name} says: ${message}`);
  }
}
