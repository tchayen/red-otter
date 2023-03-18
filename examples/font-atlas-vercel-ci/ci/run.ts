import path from "node:path";
import fs from "node:fs";

import { createServer } from "vite";
import chromium from "@sparticuz/chromium";
import { launch, PuppeteerLaunchOptions } from "puppeteer-core";

const PNG_FILE = `${__dirname}/../public/font-atlas.png`;
const JSON_FILE = `${__dirname}/../public/spacing.json`;
const BINARY_FILE = `${__dirname}/../public/spacing.dat`;
const UV_FILE = `${__dirname}/../public/uv.dat`;

const BUNDLER_PORT = 3456;

async function getPuppeteerOptions(): Promise<Partial<PuppeteerLaunchOptions>> {
  if (process.env.CI === "1") {
    return {
      executablePath: await chromium.executablePath(),
      args: [...chromium.args, "--no-sandbox"],
      headless: chromium.headless,
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
  console.debug(`Saved ${filePath}.`);
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
