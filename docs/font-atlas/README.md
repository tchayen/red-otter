- `generate.ts` runs puppeteer which bundles the app and visits the page with atlas and downloads it.
- `main.ts` is the website code which generates and shows the atlas.

## Puppeteer in Vercel CI

Regular Puppeteer is too big to run on Vercel CI. See: thread in [Vercel discussions](https://github.com/orgs/vercel/discussions/124).

I am using [@sparticuz/chromium](https://github.com/Sparticuz/chromium) now.

[chrome-aws-lambda](https://github.com/alixaxel/chrome-aws-lambda) used to be a go-to solution, but there seem to be problems running it on Node 14+ ([GitHub comment](https://gist.github.com/kettanaito/56861aff96e6debc575d522dd03e5725?permalink_comment_id=4454732#gistcomment-4454732)).

On the other hand, CI version doesn't work locally, so that's why `LOCAL_CHROME_EXECUTABLE` is also there.
