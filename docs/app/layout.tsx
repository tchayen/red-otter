import "./globals.css";
import { Body } from "./Body";
import { mauveDark } from "@radix-ui/colors";
import { Hr } from "./tags";
import { packageJson } from "./PackageJson";
import "./code-theme.css";

export const metadata = {
  description: packageJson.description,
  title: "Red Otter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-mauvedark1">
      <head>
        <script defer data-domain="red-otter.dev" src="https://plausible.io/js/script.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
function setProperty(key, value) {
  document.documentElement.style.setProperty(key, value);
}

setProperty("--scrollbar-track", "${mauveDark.mauve1}");
setProperty("--scrollbar-thumb", "${mauveDark.mauve6}");
setProperty("--scrollbar-thumb-hover", "${mauveDark.mauve7}");
setProperty("--scrollbar-thumb-active", "${mauveDark.mauve8}");
`,
          }}
        />
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body className="selection:bg-mauvedark12 selection:text-black">
        <Body>
          <main>{children}</main>
          <Hr />
          <footer>
            <span className="text-sm text-mauvedark10">Copyright © Tomasz Czajęcki 2023</span>
          </footer>
        </Body>
      </body>
    </html>
  );
}
