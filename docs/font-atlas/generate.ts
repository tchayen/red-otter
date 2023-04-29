import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { createServer } from "vite";
import chromium from "@sparticuz/chromium";
import { launch, PuppeteerLaunchOptions } from "puppeteer-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PNG_FILE = `${__dirname}/../public/font-atlas.png`;
const JSON_FILE = `${__dirname}/../public/spacing.json`;
const BINARY_FILE = `${__dirname}/../public/spacing.dat`;
const UV_FILE = `${__dirname}/../public/uv.dat`;

const BUNDLER_PORT = 3456;

function printSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} kB`;
  } else {
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }
}

async function getPuppeteerOptions(): Promise<Partial<PuppeteerLaunchOptions>> {
  if (process.env.CI === "1") {
    return {
      executablePath: await chromium.executablePath(),
      args: [],
      headless: "new",
    };
  } else if (process.platform === "darwin") {
    return {
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      args: ["--no-sandbox"],
      headless: true,
    };
  } else {
    throw new Error("Unsupported OS.");
  }
}

function saveFile(
  filePath: string,
  data: string | Int16Array | Float32Array,
  encoding: "utf-8" | "binary"
): void {
  fs.writeFileSync(filePath, data, { encoding });
  const fileOnDisk = fs.statSync(filePath);
  console.debug(`Saved ${filePath} ${printSize(fileOnDisk.size)}`);
}

async function run(): Promise<void> {
  const server = await createServer({
    root: path.resolve(__dirname, "."),
    server: { port: BUNDLER_PORT },
  });
  await server.listen();
  console.debug(`Vite dev server started on port ${BUNDLER_PORT}.`);

  const browser = await launch(await getPuppeteerOptions());
  console.debug("Chromium launched.");

  const page = await browser.newPage();
  page
    .on("console", (message) => {
      const type = message.type();
      console.debug(`${type}: ${message.text()}`);
    })
    .on("pageerror", ({ message }) => console.debug(message))
    .on("response", (response) => {
      const status = response.status().toString();
      console.debug(`${`HTTP ${status}`} ${response.url()}`);
    })
    .on("requestfailed", (request) => {
      console.debug(`${request.failure().errorText} ${request.url()}`);
    });

  // Because of CORS it has to be served by a server.
  await page.goto(`http://localhost:${BUNDLER_PORT}`);

  await page.waitForSelector("canvas");
  const canvas = await page.$("canvas");

  if (!canvas) {
    throw new Error("Canvas not found.");
  }

  console.debug("Page loaded.");

  await canvas.screenshot({ path: PNG_FILE, omitBackground: true });

  console.debug(`Saved ${PNG_FILE}.`);

  const spacing = await page.$eval("span", (element) => {
    return JSON.parse(element.innerHTML);
  });

  const { glyphs, uvs, ...metadata } = spacing;

  const spacingJson = JSON.stringify(metadata, null, 2);
  saveFile(JSON_FILE, spacingJson, "utf-8");

  const glyphBinary = new Int16Array(glyphs);
  saveFile(BINARY_FILE, glyphBinary, "binary");

  const uvBinary = new Float32Array(uvs);
  saveFile(UV_FILE, uvBinary, "binary");

  await browser.close();
  await server.close();
}

run();
