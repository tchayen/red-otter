# font-atlas-ci

What is going on in here?

```bash
.
├── ci
│   ├── run.ts # Vercel CI runs this script as part of `yarn build`. The script runs puppeteer and Vite, loads `ci` page and downloads font files to `/public`.
│   ├── index.html # Vite will use this file to show the font atlas page.
│   ├── main.ts # Renders font atlas.
│   └── public
│       └── inter.ttf
├── index.html # Final page.
├── main.ts # Renders on the final page, loading fonts from `/public`.
```

You can see it for yourself by running `vercel` in this directory.
