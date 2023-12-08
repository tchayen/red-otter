import "./globals.css";
import { Body } from "./components/Body";
import { mauveDark } from "@radix-ui/colors";
import { Hr } from "./components/tags";
import { packageJson } from "./components/PackageJson";
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

setProperty("--code-theme-main", "#c9d1d9");
setProperty("--code-theme-keyword", "#ff7b72");
setProperty("--code-theme-title", "#d2a8ff");
setProperty("--code-theme-number", "#79c0ff");
setProperty("--code-theme-symbol", "#ffa657");
setProperty("--code-theme-comment", "#8b949e");
setProperty("--code-theme-string", "#a5d6ff");
setProperty("--code-theme-quote", "#7ee787");
setProperty("--code-theme-subst", "#c9d1d9");
setProperty("--code-theme-bullet", "#f2cc60");
setProperty("--code-theme-section", "#1f6feb");
setProperty("--code-theme-strong", "#c9d1d9");
setProperty("--code-theme-emphasis", "#c9d1d9");
setProperty("--code-theme-addition", "#aff5b4");
setProperty("--code-theme-addition-background", "#033a16");
setProperty("--code-theme-deletion", "#ffdcd7");
setProperty("--code-theme-deletion-background", "#67060c");
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
