// eslint-disable-next-line import/default
import ts from "typescript";

type NodeInfo = {
  name: string;
  description: string;
};

type ExportInfo = {
  classes: (NodeInfo & {
    methods: (NodeInfo & {
      parameters: { name: string; type: string; isOptional: boolean }[];
      returnType?: string;
    })[];
    properties: (NodeInfo & { type: string })[];
  })[];
  types: (NodeInfo & {
    properties: (NodeInfo & { type: string })[];
    value?: string;
  })[];
};

export function extractExports(fileNames: string[]): ExportInfo {
  const classes: ExportInfo["classes"] = [];

  const types: ExportInfo["types"] = [];

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const symbol: ts.Symbol = (c as any).symbol;

      const methodNodes = c.members.filter(
        (m) => ts.isMethodDeclaration(m) || ts.isConstructorDeclaration(m)
      ) as ts.MethodDeclaration[];

      const methods: ExportInfo["classes"][0]["methods"] = [];
      for (const m of methodNodes) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const symbol: ts.Symbol = (m as any).symbol;

        const parameters = m.parameters
          .map((p) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const symbol: ts.Symbol = (p as any).symbol;
            if (!symbol) {
              return;
            }

            const paramDeclaration = symbol.valueDeclaration;
            if (!paramDeclaration) {
              return;
            }

            if (!ts.isParameter(paramDeclaration)) {
              return;
            }

            const isOptional = paramDeclaration.questionToken !== undefined;

            return {
              name: symbol.escapedName?.toString() ?? "",
              type: checker.typeToString(checker.getTypeAtLocation(p)),
              isOptional,
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
          parameters: parameters as {
            name: string;
            type: string;
            isOptional: boolean;
          }[],
          returnType,
        });
      }

      const propertyNodes = c.members.filter((m) =>
        ts.isPropertyDeclaration(m)
      ) as ts.PropertyDeclaration[];

      const properties: ExportInfo["classes"][0]["properties"] = [];
      for (const p of propertyNodes) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const symbol: ts.Symbol = (t as any).symbol;

      const properties: ExportInfo["types"][0]["properties"] = [];
      ts.forEachChild(t.type, (child) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  say(message: string): void {
    console.debug(`${this.name} says: ${message}`);
  }
}
