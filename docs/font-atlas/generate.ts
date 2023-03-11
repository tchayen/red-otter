import path from "node:path";
import { createServer } from "vite";
import fs from "node:fs";
import chalk from "chalk";
import chromium from "@sparticuz/chromium";
import { launch } from "puppeteer-core";

const BUNDLER_PORT = 1337;

const PNG_FILE = `${__dirname}/public/font-atlas.png`;
const JSON_FILE = `${__dirname}/public/spacing.json`;
const BINARY_FILE = `${__dirname}/public/spacing.dat`;
const UV_FILE = `${__dirname}/public/uv.dat`;

const URL = `http://localhost:${BUNDLER_PORT}`;

const LOCAL_CHROME_EXECUTABLE =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function printSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} kB`;
  } else {
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }
}

function saveFile(
  filePath: string,
  data: string | Int16Array | Float32Array,
  encoding: "utf-8" | "binary"
): void {
  fs.writeFileSync(filePath, data, { encoding });
  const fileOnDisk = fs.statSync(filePath);
  console.log(`Saved ${chalk.bold(filePath)} ${printSize(fileOnDisk.size)}`);
}

(async (): Promise<void> => {
  const server = await createServer({
    root: path.resolve(__dirname, "."),
    server: { port: BUNDLER_PORT },
  });
  await server.listen();

  // See README.md for more information why local vs CI.
  const localOptions = {
    executablePath: LOCAL_CHROME_EXECUTABLE,
    args: ["--no-sandbox"],
    headless: true,
  };

  const optionsForCI = {
    executablePath: await chromium.executablePath(),
    args: [...chromium.args, "--no-sandbox"],
    headless: chromium.headless,
  };

  const browser = await launch(
    process.env.CI === "1" ? optionsForCI : localOptions
  );
  const page = await browser.newPage();
  page
    .on("console", (message) => {
      const type = message.type();
      const color = type === "debug" ? chalk.gray : chalk.white;
      console.log(color(`${type}: ${message.text()}`));
    })
    .on("pageerror", ({ message }) => console.log(message))
    .on("response", (response) => {
      const status = response.status().toString();
      const color = status.startsWith("2")
        ? chalk.green
        : status.startsWith("3")
        ? chalk.yellow
        : chalk.red;
      console.log(`${color(`HTTP ${status}`)} ${response.url()}`);
    })
    .on("requestfailed", (request) => {
      console.log(`${request.failure().errorText} ${request.url()}`);
    });

  // Because of CORS it has to be served as a server.
  await page.goto(URL);

  await page.waitForSelector("canvas");
  const canvas = await page.$("canvas");

  if (!canvas) {
    throw new Error("Canvas not found.");
  }

  await canvas.screenshot({ path: PNG_FILE, omitBackground: true });

  const fontAtlasPngOnDisk = fs.statSync(PNG_FILE);
  console.log(
    `Saved ${chalk.bold(PNG_FILE)} ${printSize(fontAtlasPngOnDisk.size)}`
  );

  const spacing = await page.$eval("span", (element) => {
    return JSON.parse(element.innerHTML);
  });

  const { glyphs, uvs, ...metadata } = spacing;

  const spacingJson = JSON.stringify(metadata, null, 2);
  const glyphBinary = new Int16Array(glyphs);
  const uvBinary = new Float32Array(uvs);

  saveFile(JSON_FILE, spacingJson, "utf-8");
  saveFile(BINARY_FILE, glyphBinary, "binary");
  saveFile(UV_FILE, uvBinary, "binary");

  await browser.close();
  await server.close();
})();
