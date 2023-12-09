import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
import type { ClassType, EnumType, FunctionType, TypeType } from "../app/components/ApiBlocks";

const mainDirectory = path.resolve(import.meta.dir + "/../../src");

const result = extractTypeScript([
  `${mainDirectory}/layout`,
  `${mainDirectory}/font`,
  `${mainDirectory}/math`,
]);
fs.writeFileSync(import.meta.dir + "/../app/types.json", JSON.stringify(result, null, 2));

/**
 * Extract types, classes, functions and enums from TypeScript files.
 */
export function extractTypeScript(paths: Array<string>) {
  const types: Record<string, TypeType> = {};
  const classes: Record<string, ClassType> = {};
  const functions: Record<string, FunctionType> = {};
  const enums: Array<EnumType> = [];

  const files = getListOfFiles(paths);

  for (const fileName of files) {
    const program = ts.createProgram([fileName], {});
    const sourceFile = program.getSourceFile(fileName);
    const sourceString = fileName.replaceAll(mainDirectory, "");
    if (sourceFile === undefined) {
      throw new Error("Source file was not found.");
    }

    const checker = program.getTypeChecker();

    // Process enums.
    enums.push(
      ...(
        sourceFile.statements.filter((s) => ts.isEnumDeclaration(s)) as Array<ts.EnumDeclaration>
      ).map((e) => {
        return {
          description: ts.displayPartsToString(e.symbol.getDocumentationComment(checker)),
          name: e.name.escapedText.toString(),
          source: sourceString,
          values: e.members.map((m) => {
            return {
              description: ts.displayPartsToString(m.symbol.getDocumentationComment(checker)),
              name: m.name.escapedText,
            };
          }),
        };
      }),
    );

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
        source: sourceString,
      };
    });

    //Process classes.
    (
      sourceFile.statements.filter((s) => ts.isClassDeclaration(s)) as Array<ts.ClassDeclaration>
    ).forEach((c) => {
      const symbol: ts.Symbol = (c as any).symbol;

      const methods: Record<string, Method> = {};
      ts.forEachChild(c, (child) => {
        if (!ts.isMethodDeclaration(child)) {
          return;
        }

        const symbol: ts.Symbol = (child as any).symbol;
        if (!symbol) {
          return;
        }

        const name = symbol.escapedName.toString();
        const parameters: Record<string, Field> = {};
        ts.forEachChild(child, (child) => {
          if (!ts.isParameter(child)) {
            return;
          }

          const symbol: ts.Symbol = (child as any).symbol;
          if (!symbol) {
            return;
          }

          const name = symbol.escapedName.toString();
          parameters[name] = {
            default: "",
            description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
            name,
            type: checker.typeToString(checker.getTypeAtLocation(child)),
          };
        });

        methods[name] = {
          description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
          name,
          parameters,
          returnType: checker.typeToString(checker.getTypeAtLocation(child)),
        };
      });

      const name = symbol.escapedName.toString();
      classes[name] = {
        description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
        methods,
        name,
        source: sourceString,
      };
    });

    // Process exported functions.
    // TODO: fix JSDoc comments - match them with parameters and don't loose description.
    (
      sourceFile.statements.filter((s) =>
        ts.isFunctionDeclaration(s),
      ) as Array<ts.FunctionDeclaration>
    ).forEach((f) => {
      const symbol: ts.Symbol = (f as any).symbol;
      // Check if the function is exported
      if (!f.modifiers || !f.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
        return;
      }

      const parameters: Record<string, Field> = {};
      ts.forEachChild(f, (child) => {
        if (!ts.isParameter(child)) {
          return;
        }

        const symbol: ts.Symbol = (child as any).symbol;
        if (!symbol) {
          return;
        }

        const name = symbol.escapedName.toString();
        parameters[name] = {
          default: "",
          description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
          name,
          type: checker.typeToString(checker.getTypeAtLocation(child)),
        };
      });

      const name = symbol.escapedName.toString();
      // Handle JSDoc.
      const jsDoc = symbol.getJsDocTags();
      // if (jsDoc.length > 0) {
      //   console.log(name, JSON.stringify(jsDoc, null, 2));
      // }
      // JSDoc description of the return value.
      const returnTag = jsDoc.find((t) => t.name === "returns");
      if (returnTag) {
        console.log(name, returnTag.text);
      }

      functions[name] = {
        description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
        name,
        parameters,
        returnDescription: returnTag?.text[0].text ?? "",
        returnType: checker.typeToString(
          checker.getTypeOfSymbol(symbol).getCallSignatures().at(0).getReturnType(),
        ),
        source: sourceString,
        typeSignature: checker.typeToString(checker.getTypeAtLocation(f)),
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
        console.warn(`Type ${name} not found.`);
        return;
      }

      o.declarationList.declarations[0].initializer.properties.forEach((p) => {
        const name = p.name.escapedText;
        const value = p.initializer.getText();

        type.properties[name] = { ...type.properties[name], default: value };
      });
    });
  }

  return { classes, enums, functions, types };
}

/**
 * Construct a list of files to process given list of paths. Paths can be either files or
 * directories. Directories can be nested.
 */
function getListOfFiles(paths: Array<string>): Array<string> {
  const files: Array<string> = [];

  function explore(path: string) {
    try {
      const stats = fs.statSync(path);

      if (stats.isDirectory()) {
        fs.readdirSync(path).forEach((child) => {
          explore(`${path}/${child}`);
        });
      } else if (stats.isFile()) {
        files.push(path);
      }
    } catch (error) {
      console.error(`${path}: ${error.message}`);
    }
  }

  paths.forEach((path) => explore(path));
  return files;
}
