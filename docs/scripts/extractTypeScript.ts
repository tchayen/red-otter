import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
import type {
  ClassType,
  EnumType,
  FieldType,
  FunctionType,
  InterfaceType,
  TypeType,
} from "../app/components/ApiBlocks";
import "@total-typescript/ts-reset";

const mainDirectory = path.resolve(path.join(__dirname, "/../../src"));

const result = extractTypeScript([mainDirectory]);

fs.writeFileSync(
  path.resolve(path.join(__dirname, "/../app/types.json")),
  JSON.stringify(result, null, 2),
);

/**
 * Extract types, classes, functions and enums from TypeScript files.
 */
export function extractTypeScript(paths: Array<string>) {
  const types: Record<string, TypeType> = {};
  const interfaces: Record<string, InterfaceType> = {};
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
      ...(sourceFile.statements.filter(ts.isEnumDeclaration) as Array<ts.EnumDeclaration>)
        .map((e) => {
          const symbol = checker.getSymbolAtLocation(e.name);
          if (!symbol) {
            return;
          }

          // Check if the enum is exported.
          if (!e.modifiers || !e.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
            return;
          }

          return {
            description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
            name: e.name.escapedText.toString(),
            source: sourceString,
            values: e.members.map((m) => {
              const mSymbol = checker.getSymbolAtLocation(m.name);
              const name = m.name.getText();
              return {
                description: ts.displayPartsToString(mSymbol?.getDocumentationComment(checker)),
                name,
              };
            }),
          };
        })
        .filter(Boolean),
    );

    // Process types.
    (
      sourceFile.statements.filter(ts.isTypeAliasDeclaration) as Array<ts.TypeAliasDeclaration>
    ).forEach((t) => {
      const symbol = checker.getSymbolAtLocation(t.name);
      if (!symbol) {
        return;
      }

      // Check if type is exported.
      if (!t.modifiers || !t.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
        return;
      }

      const properties: Record<string, FieldType> = {};
      if (ts.isTypeLiteralNode(t.type)) {
        t.type.members.forEach((m) => {
          if (!ts.isPropertySignature(m)) {
            return;
          }

          const symbol = checker.getSymbolAtLocation(m.name);
          if (!symbol) {
            return;
          }

          const name = symbol.escapedName.toString();
          properties[name] = {
            default: "",
            description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
            name,
            type: checker.typeToString(checker.getTypeAtLocation(m)),
          };
        });
      }

      const name = symbol.escapedName.toString();
      types[name] = {
        description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
        name,
        properties,
        source: sourceString,
      };
    });

    // Process interfaces.
    (
      sourceFile.statements.filter(ts.isInterfaceDeclaration) as Array<ts.InterfaceDeclaration>
    ).forEach((i) => {
      const symbol = checker.getSymbolAtLocation(i.name);
      if (!symbol) {
        return;
      }

      // Check if interface is exported.
      if (!i.modifiers || !i.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
        return;
      }

      const properties: Record<string, FieldType> = {};
      i.members.forEach((m) => {
        if (!ts.isPropertySignature(m)) {
          return;
        }

        const symbol = checker.getSymbolAtLocation(m.name);
        if (!symbol) {
          return;
        }

        const name = symbol.escapedName.toString();
        properties[name] = {
          default: "",
          description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
          name,
          type: checker.typeToString(checker.getTypeAtLocation(m)),
        };
      });

      // Process methods.
      const methods: Record<string, FunctionType> = {};
      i.members.forEach((m) => {
        if (!ts.isMethodSignature(m)) {
          return;
        }

        // Check if method is not private.
        if (m.modifiers?.some((m) => m.kind === ts.SyntaxKind.PrivateKeyword)) {
          return;
        }

        const symbol = checker.getSymbolAtLocation(m.name);
        if (!symbol) {
          return;
        }

        const name = symbol.escapedName.toString();
        const parameters: Record<string, FieldType> = {};
        m.parameters.forEach((p) => {
          const symbol = checker.getSymbolAtLocation(p.name);
          if (!symbol) {
            return;
          }

          const name = symbol.escapedName.toString();
          parameters[name] = {
            default: "",
            description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
            name,
            type: checker.typeToString(checker.getTypeAtLocation(p)),
          };
        });

        const { returnTag, returnTypeString } = processJSDoc(checker, symbol);
        methods[name] = {
          description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
          name,
          parameters,
          returnDescription: returnTag?.text?.at(0)?.text ?? "",
          returnType: returnTypeString,
          typeSignature: checker.typeToString(checker.getTypeAtLocation(m)),
        };
      });

      const name = symbol.escapedName.toString();
      interfaces[name] = {
        description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
        methods,
        name,
        properties,
        source: sourceString,
      };
    });

    //Process classes.
    (sourceFile.statements.filter(ts.isClassDeclaration) as Array<ts.ClassDeclaration>).forEach(
      (c) => {
        if (!c.name) {
          return;
        }

        const symbol = checker.getSymbolAtLocation(c.name);
        if (!symbol) {
          return;
        }

        // Check if class is exported.
        if (!c.modifiers || !c.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
          return;
        }

        const name = symbol.escapedName.toString();

        const fields: Record<string, FieldType> = {};
        ts.forEachChild(c, (child) => {
          if (!ts.isPropertyDeclaration(child)) {
            return;
          }

          const symbol = checker.getSymbolAtLocation(child.name);
          if (!symbol) {
            return;
          }

          const name = symbol.escapedName.toString();
          fields[name] = {
            default: "",
            description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
            name,
            type: checker.typeToString(checker.getTypeAtLocation(child)),
          };
        });

        const methods: Record<string, FunctionType> = {};
        ts.forEachChild(c, (child) => {
          if (!ts.isMethodDeclaration(child)) {
            return;
          }

          const symbol = checker.getSymbolAtLocation(child.name);
          if (!symbol) {
            return;
          }

          // Check if method is not private.
          if (child.modifiers?.some((m) => m.kind === ts.SyntaxKind.PrivateKeyword)) {
            return;
          }

          const name = symbol.escapedName.toString();
          const parameters: Record<string, FieldType> = {};
          ts.forEachChild(child, (child) => {
            if (!ts.isParameter(child)) {
              return;
            }

            const symbol = checker.getSymbolAtLocation(child.name);
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

          const { returnTag, returnTypeString } = processJSDoc(checker, symbol);
          methods[name] = {
            description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
            name,
            parameters,
            returnDescription: returnTag?.text?.at(0)?.text ?? "",
            returnType: returnTypeString,
            typeSignature: checker.typeToString(checker.getTypeAtLocation(child)),
          };
        });

        let constructor: FunctionType | null = null;

        // Add constructor to methods.
        const constructorDeclaration = c.members.find(ts.isConstructorDeclaration);
        if (constructorDeclaration) {
          const parameters: Record<string, FieldType> = {};
          constructorDeclaration.parameters.forEach((p) => {
            const symbol = checker.getSymbolAtLocation(p.name);
            if (!symbol) {
              return;
            }

            const name = symbol.escapedName.toString();
            parameters[name] = {
              default: "",
              description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
              name,
              type: checker.typeToString(checker.getTypeAtLocation(p)),
            };
          });

          const { returnTag, returnTypeString } = processJSDoc(checker, symbol);
          constructor = {
            description: "",
            name: "constructor",
            parameters,
            returnDescription: returnTag?.text?.at(0)?.text ?? "",
            returnType: returnTypeString,
            typeSignature: checker.typeToString(checker.getTypeAtLocation(constructorDeclaration)),
          };
        }

        const ext = c.heritageClauses
          ?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)
          ?.getText()
          .replace("extends ", "");
        classes[name] = {
          constructor,
          description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
          extends: ext,
          fields,
          methods,
          name,
          source: sourceString,
        };
      },
    );

    // Process exported functions.
    (
      sourceFile.statements.filter(ts.isFunctionDeclaration) as Array<ts.FunctionDeclaration>
    ).forEach((f) => {
      if (!f.name) {
        return;
      }

      const symbol = checker.getSymbolAtLocation(f.name);
      if (!symbol) {
        return;
      }

      // Check if the function is exported
      if (!f.modifiers || !f.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
        return;
      }

      const parameters: Record<string, FieldType> = {};
      ts.forEachChild(f, (child) => {
        if (!ts.isParameter(child)) {
          return;
        }

        const symbol = checker.getSymbolAtLocation(child.name);
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

      const { returnTag, returnTypeString } = processJSDoc(checker, symbol);
      functions[name] = {
        description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
        name,
        parameters,
        returnDescription: returnTag?.text?.at(0)?.text ?? "",
        returnType: returnTypeString,
        source: sourceString,
        typeSignature: checker.typeToString(checker.getTypeAtLocation(f)),
      };
    });

    // Assign defaults.
    const objects = sourceFile.statements.filter(
      ts.isVariableStatement,
    ) as Array<ts.VariableStatement>;

    objects.forEach((o) => {
      const name = o.declarationList.declarations[0]?.name.getText();
      if (!name) {
        return;
      }
      const type = types[name.replace("default", "")];
      if (!type) {
        return;
      }

      if (
        o.declarationList.declarations[0]?.initializer &&
        ts.isObjectLiteralExpression(o.declarationList.declarations[0].initializer)
      ) {
        o.declarationList.declarations[0].initializer.properties.forEach((p) => {
          if (ts.isPropertyAssignment(p)) {
            const name = p.name.getText();
            const value = p.initializer.getText();
            const property = type.properties[name];
            if (!property) {
              console.warn(`Property ${name} not found in type ${type.name}.`);
              return;
            }

            type.properties[name] = {
              ...property,
              default: value,
            };
          }
        });
      }
    });
  }

  return { classes, enums, functions, interfaces, types };
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

      if (stats.isDirectory() && !path.includes("node_modules")) {
        fs.readdirSync(path).forEach((child) => {
          console.log(`Reading ${path}/${child}`);
          explore(`${path}/${child}`);
        });
      } else if (stats.isFile() && path.endsWith(".ts")) {
        files.push(path);
      }
    } catch (error) {
      console.error(`${path}: ${(error as Error).message}`);
    }
  }

  paths.forEach((path) => explore(path));
  return files;
}

function processJSDoc(checker: ts.TypeChecker, symbol: ts.Symbol) {
  const jsDoc = symbol.getJsDocTags();
  const returnType = checker.getTypeOfSymbol(symbol)?.getCallSignatures()?.at(0)?.getReturnType();
  const returnTag = jsDoc.find((t) => t.name === "returns");
  const returnTypeString = returnType ? checker.typeToString(returnType) : "";
  return { returnTag, returnTypeString };
}
